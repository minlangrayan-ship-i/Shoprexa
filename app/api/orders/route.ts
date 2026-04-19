import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sessionFromRequest } from '@/lib/api-auth';
import { estimateShipment } from '@/lib/shipping';
import { prisma } from '@/lib/prisma';
import { log } from '@/services/logger';
import { getCityDistricts, isLaunchCountry, isSupportedLaunchCity, launchCountryName } from '@/lib/geo-config';

const schema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(6),
  shippingAddress: z.string().min(5),
  country: z.string().min(2),
  city: z.string().min(2),
  district: z.string().min(2),
  paymentProvider: z.enum(['MOCK', 'FLUTTERWAVE', 'CINETPAY', 'PAYSTACK']),
  currency: z.string().min(3).max(3).default('XAF'),
  items: z.array(z.object({ id: z.string(), quantity: z.number().int().min(1), price: z.number().min(1) })).min(1)
});

function generateOrderReference() {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
}

type OrderProvider = 'MOCK' | 'FLUTTERWAVE' | 'CINETPAY' | 'PAYSTACK';

export async function POST(req: Request) {
  const body = schema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });

  if (!isLaunchCountry(body.data.country)) {
    return NextResponse.json({ error: 'country_not_supported', message: `Lancement limité au ${launchCountryName}.` }, { status: 400 });
  }

  if (!isSupportedLaunchCity(body.data.city)) {
    return NextResponse.json({ error: 'city_not_supported', message: 'Ville non prise en charge pour le lancement.' }, { status: 400 });
  }

  if (!getCityDistricts(body.data.city).includes(body.data.district)) {
    return NextResponse.json({ error: 'district_not_supported', message: 'Quartier non pris en charge pour cette ville.' }, { status: 400 });
  }

  const db = prisma as unknown as {
    order: {
      create(args: {
        data: {
          reference: string;
          userId: string | null;
          customerName: string;
          customerEmail: string;
          customerPhone: string;
          shippingAddress: string;
          paymentProvider: OrderProvider;
          currency: string;
          total: number;
          items: { create: Array<{ productId: string; quantity: number; unitPrice: number }> };
        };
        include: { items: true };
      }): Promise<{ id: string }>;
    };
    orderItem: {
      findMany(args: {
        where: { orderId: string };
        include: { product: true };
      }): Promise<Array<{ id: string; productId: string; quantity: number; unitPrice: number }>>;
    };
    product: {
      findUnique(args: { where: { id: string } }): Promise<{ sellerId: string | null; sellerCountry?: string | null; sellerCity?: string | null } | null>;
    };
    seller: {
      findUnique(args: { where: { id: string } }): Promise<{ id: string; commissionRate: number | string | null } | null>;
    };
    commission: {
      create(args: {
        data: { orderItemId: string; sellerId: string; rate: number; amount: number };
      }): Promise<{ id: string }>;
    };
    shipment?: {
      create(args: {
        data: {
          orderId: string;
          sellerId: string | null;
          status: 'PENDING';
          transportMode: string;
          estimatedMinHours: number;
          estimatedMaxHours: number;
          reliability: number;
          estimatedDeliveryAt: Date;
          events: {
            create: Array<{
              status: 'PENDING' | 'CONFIRMED';
              note: string;
              location: string;
              createdById: string | undefined;
            }>;
          };
        };
      }): Promise<{ id: string }>;
    };
  };
  const session = sessionFromRequest(req);
  const total = body.data.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const reference = generateOrderReference();

  const order = await db.order.create({
    data: {
      reference,
      userId: session?.userId ?? null,
      customerName: body.data.customerName,
      customerEmail: body.data.customerEmail,
      customerPhone: body.data.customerPhone,
      shippingAddress: `${body.data.shippingAddress} (${body.data.district}, ${body.data.city}, ${body.data.country})`,
      paymentProvider: body.data.paymentProvider,
      currency: body.data.currency.toUpperCase(),
      total,
      items: {
        create: body.data.items.map((item) => ({ productId: item.id, quantity: item.quantity, unitPrice: item.price }))
      }
    },
    include: { items: true }
  });

  // Best-effort commission preparation (skipped automatically when model is not present yet).
  if (db.commission && db.seller) {
    const orderItems = await db.orderItem.findMany({ where: { orderId: order.id }, include: { product: true } });
    for (const item of orderItems) {
      const product = await db.product.findUnique({ where: { id: item.productId } });
      if (!product?.sellerId) continue;
      const seller = await db.seller.findUnique({ where: { id: product.sellerId } });
      if (!seller) continue;
      const rate = Number(seller.commissionRate ?? 0);
      const amount = Number(item.unitPrice) * item.quantity * (rate / 100);
      await db.commission.create({
        data: { orderItemId: item.id, sellerId: seller.id, rate, amount }
      });
    }
  }

  if (db.shipment) {
    const primaryProduct = body.data.items[0] ? await db.product.findUnique({ where: { id: body.data.items[0].id } }) : null;
    const primarySeller = primaryProduct?.sellerId ? await db.seller.findUnique({ where: { id: primaryProduct.sellerId } }) : null;
    const shippingEstimate = estimateShipment({
      sellerCountry: primaryProduct?.sellerCountry ?? launchCountryName,
      sellerCity: primaryProduct?.sellerCity ?? body.data.city,
      customerCountry: body.data.country,
      customerCity: body.data.city,
      stock: body.data.items.reduce((acc, item) => acc + item.quantity, 0),
      priority: 'standard'
    });
    const estimatedDeliveryAt = new Date(Date.now() + shippingEstimate.estimatedMaxHours * 3600 * 1000);

    await db.shipment.create({
      data: {
        orderId: order.id,
        sellerId: primarySeller?.id ?? null,
        status: 'PENDING',
        transportMode: shippingEstimate.transportMode,
        estimatedMinHours: shippingEstimate.estimatedMinHours,
        estimatedMaxHours: shippingEstimate.estimatedMaxHours,
        reliability: shippingEstimate.reliability,
        estimatedDeliveryAt,
        events: {
          create: [
            {
              status: 'PENDING',
              note: 'Commande en attente de confirmation.',
              location: 'Système Min-shop',
              createdById: session?.userId
            }
          ]
        }
      }
    });
  }

  log('info', {
    scope: 'order.create',
    message: 'order_created',
    meta: { orderId: order.id, reference, total, paymentProvider: body.data.paymentProvider }
  });

  return NextResponse.json(order, { status: 201 });
}
