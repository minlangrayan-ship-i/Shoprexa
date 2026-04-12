import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sessionFromRequest } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { log } from '@/services/logger';

const schema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(6),
  shippingAddress: z.string().min(5),
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
      findUnique(args: { where: { id: string } }): Promise<{ sellerId: string | null } | null>;
    };
    seller: {
      findUnique(args: { where: { id: string } }): Promise<{ id: string; commissionRate: number | string | null } | null>;
    };
    commission: {
      create(args: {
        data: { orderItemId: string; sellerId: string; rate: number; amount: number };
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
      shippingAddress: body.data.shippingAddress,
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

  log('info', {
    scope: 'order.create',
    message: 'order_created',
    meta: { orderId: order.id, reference, total, paymentProvider: body.data.paymentProvider }
  });

  return NextResponse.json(order, { status: 201 });
}
