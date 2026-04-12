import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRoles, sessionFromRequest } from '@/lib/api-auth';
import { env } from '@/lib/env';
import { prisma } from '@/lib/prisma';
import { createHostedCheckout, type SupportedPaymentProvider } from '@/services/payment/providers';
import { log } from '@/services/logger';

const schema = z.object({
  orderId: z.string().min(3),
  provider: z.enum(['MOCK', 'FLUTTERWAVE', 'CINETPAY', 'PAYSTACK'])
});

function toSupportedProvider(provider: 'MOCK' | 'FLUTTERWAVE' | 'CINETPAY' | 'PAYSTACK'): SupportedPaymentProvider {
  if (provider === 'PAYSTACK') return 'MOCK';
  return provider;
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

export async function POST(request: Request) {
  const access = requireRoles(request, ['CUSTOMER', 'SELLER', 'ADMIN']);
  if (!access.ok) return access.response;

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const db = prisma as unknown as {
    order: {
      findUnique(args: {
        where: { id: string };
        include: { payments: true };
      }): Promise<{
        id: string;
        userId: string | null;
        status: string;
        total: number | string;
        currency: string | null;
        customerName: string;
        customerEmail: string;
        customerPhone: string;
        reference: string;
        payments: Array<{ id: string; status: string }>;
      } | null>;
      update(args: { where: { id: string }; data: { status: 'PAID'; paidAt: Date } }): Promise<{ id: string }>;
    };
    payment: {
      create(args: {
        data: {
          orderId: string;
          provider: SupportedPaymentProvider;
          status: 'SUCCESS' | 'PENDING';
          amount: number | string;
          currency: string;
          externalReference: string;
          providerReference: string | null;
          rawRequest: Record<string, unknown>;
          rawResponse: Record<string, unknown>;
        };
      }): Promise<{ id: string }>;
    };
  };
  const session = sessionFromRequest(request);
  const order = await db.order.findUnique({ where: { id: parsed.data.orderId }, include: { payments: true } });
  if (!order) return NextResponse.json({ error: 'order_not_found' }, { status: 404 });
  if (session?.role === 'CUSTOMER' && order.userId && order.userId !== session.userId) {
    return NextResponse.json({ error: 'forbidden_order' }, { status: 403 });
  }
  if (order.status === 'PAID') {
    return NextResponse.json({ ok: true, alreadyPaid: true, orderId: order.id });
  }

  const activePayment = Array.isArray(order.payments)
    ? order.payments.find((payment: { status: string }) => payment.status === 'PENDING')
    : null;

  if (activePayment) {
    return NextResponse.json({
      ok: true,
      paymentId: activePayment.id,
      orderId: order.id,
      checkoutUrl: null
    });
  }

  try {
    const txRef = `shoprexa_${order.reference}_${Date.now()}`;
    const provider = toSupportedProvider(parsed.data.provider);
    const redirectUrl = `${env.APP_BASE_URL}/payment-return?orderId=${encodeURIComponent(order.id)}&provider=${provider}`;

    const hosted = await createHostedCheckout({
      provider,
      amount: Number(order.total),
      currency: order.currency ?? 'XAF',
      customer: {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone
      },
      txRef,
      redirectUrl,
      description: `Order ${order.reference}`
    });

    const payment = await db.payment.create({
      data: {
        orderId: order.id,
        provider,
        status: provider === 'MOCK' ? 'SUCCESS' : 'PENDING',
        amount: order.total,
        currency: order.currency ?? 'XAF',
        externalReference: txRef,
        providerReference: hosted.providerReference,
        rawRequest: { txRef, orderReference: order.reference, provider },
        rawResponse: toRecord(hosted.raw)
      }
    });

    if (provider === 'MOCK') {
      await db.order.update({ where: { id: order.id }, data: { status: 'PAID', paidAt: new Date() } });
    }

    log('info', {
      scope: 'payment.create',
      message: 'checkout_created',
      meta: { orderId: order.id, paymentId: payment.id, provider, txRef }
    });

    return NextResponse.json({ ok: true, orderId: order.id, paymentId: payment.id, checkoutUrl: hosted.checkoutUrl });
  } catch (error) {
    log('error', {
      scope: 'payment.create',
      message: 'checkout_creation_failed',
      meta: {
        orderId: order.id,
        error: error instanceof Error ? error.message : 'unknown_error'
      }
    });
    return NextResponse.json({ error: 'payment_checkout_unavailable' }, { status: 502 });
  }
}
