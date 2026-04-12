import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyProviderPayment, type SupportedPaymentProvider } from '@/services/payment/providers';
import { verifyPaymentWebhookSignature } from '@/services/payment/webhook-security';
import { log } from '@/services/logger';

function parseProvider(value: string | null): SupportedPaymentProvider {
  if (value === 'FLUTTERWAVE' || value === 'CINETPAY' || value === 'MOCK') return value;
  return 'FLUTTERWAVE';
}

function extractProviderReference(provider: SupportedPaymentProvider, payload: Record<string, unknown>) {
  if (provider === 'FLUTTERWAVE') {
    const data = payload.data as Record<string, unknown> | undefined;
    const txRef = data?.tx_ref;
    return typeof txRef === 'string' ? txRef : null;
  }
  if (provider === 'CINETPAY') {
    const txRef = payload.transaction_id ?? payload.cpm_trans_id;
    return typeof txRef === 'string' ? txRef : null;
  }
  const txRef = payload.tx_ref;
  return typeof txRef === 'string' ? txRef : null;
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

export async function POST(request: Request) {
  const provider = parseProvider(new URL(request.url).searchParams.get('provider'));
  const rawBody = await request.text();
  const signatureOk = verifyPaymentWebhookSignature({ provider, headers: request.headers, rawBody });
  if (!signatureOk) {
    log('warn', { scope: 'payment.webhook', message: 'invalid_signature', meta: { provider } });
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  const providerReference = extractProviderReference(provider, payload);
  if (!providerReference) return NextResponse.json({ error: 'missing_provider_reference' }, { status: 400 });

  const db = prisma as unknown as {
    payment: {
      findFirst(args: {
        where: {
          OR: Array<{ externalReference?: string; providerReference?: string }>;
        };
      }): Promise<{
        id: string;
        status: string;
        externalReference: string;
        orderId: string;
      } | null>;
      update(args: {
        where: { id: string };
        data: {
          status: 'FAILED' | 'SUCCESS';
          rawResponse: Record<string, unknown>;
          providerTransactionId?: string;
          verifiedAt?: Date;
        };
      }): Promise<{ id: string }>;
      findUnique(args: { where: { id: string } }): Promise<{ id: string; status: string } | null>;
    };
    order: {
      update(args: { where: { id: string }; data: { status: 'PAID'; paidAt: Date } }): Promise<{ id: string }>;
    };
    $transaction<T>(fn: (tx: {
      payment: {
        findUnique(args: { where: { id: string } }): Promise<{ id: string; status: string } | null>;
        update(args: {
          where: { id: string };
          data: {
            status: 'SUCCESS';
            providerTransactionId: string;
            verifiedAt: Date;
            rawResponse: Record<string, unknown>;
          };
        }): Promise<{ id: string }>;
      };
      order: {
        update(args: { where: { id: string }; data: { status: 'PAID'; paidAt: Date } }): Promise<{ id: string }>;
      };
    }) => Promise<T>): Promise<T>;
  };
  const payment = await db.payment.findFirst({
    where: {
      OR: [{ externalReference: providerReference }, { providerReference }]
    }
  });
  if (!payment) return NextResponse.json({ ok: true, ignored: true });
  if (payment.status === 'SUCCESS') return NextResponse.json({ ok: true, alreadyProcessed: true });

  try {
    const verified = await verifyProviderPayment({ provider, providerReference: payment.externalReference });

    if (!verified.paid) {
      await db.payment.update({ where: { id: payment.id }, data: { status: 'FAILED', rawResponse: toRecord(verified.raw) } });
      return NextResponse.json({ ok: false, verified: false });
    }

    await db.$transaction(async (tx) => {
      const current = await tx.payment.findUnique({ where: { id: payment.id } });
      if (!current || current.status === 'SUCCESS') return;

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESS',
          providerTransactionId: verified.providerTransactionId ?? payment.externalReference,
          verifiedAt: new Date(),
          rawResponse: toRecord(verified.raw)
        }
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'PAID',
          paidAt: new Date()
        }
      });
    });

    log('info', {
      scope: 'payment.webhook',
      message: 'payment_verified',
      meta: { paymentId: payment.id, orderId: payment.orderId, provider }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    log('error', {
      scope: 'payment.webhook',
      message: 'provider_verification_failed',
      meta: {
        paymentId: payment.id,
        provider,
        error: error instanceof Error ? error.message : 'unknown_error'
      }
    });
    return NextResponse.json({ error: 'verification_failed' }, { status: 502 });
  }
}
