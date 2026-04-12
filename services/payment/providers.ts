import { env } from '@/lib/env';
import { log } from '@/services/logger';

export type SupportedPaymentProvider = 'FLUTTERWAVE' | 'CINETPAY' | 'MOCK';

type CreateHostedCheckoutInput = {
  provider: SupportedPaymentProvider;
  amount: number;
  currency: string;
  customer: { name: string; email: string; phone: string };
  txRef: string;
  redirectUrl: string;
  description: string;
};

type HostedCheckoutResult = {
  checkoutUrl: string;
  providerReference: string;
  raw: unknown;
};

type VerifyPaymentInput = {
  provider: SupportedPaymentProvider;
  providerReference: string;
};

type VerifyPaymentResult = {
  paid: boolean;
  providerTransactionId?: string;
  raw: unknown;
};

export async function createHostedCheckout(input: CreateHostedCheckoutInput): Promise<HostedCheckoutResult> {
  if (input.provider === 'MOCK') {
    return {
      checkoutUrl: `${input.redirectUrl}?status=successful&tx_ref=${encodeURIComponent(input.txRef)}&provider=MOCK`,
      providerReference: input.txRef,
      raw: { mode: 'mock' }
    };
  }

  if (input.provider === 'FLUTTERWAVE') {
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.FLUTTERWAVE_SECRET_KEY}`
      },
      body: JSON.stringify({
        tx_ref: input.txRef,
        amount: input.amount,
        currency: input.currency,
        redirect_url: input.redirectUrl,
        customer: input.customer,
        customizations: {
          title: 'Shoprexa',
          description: input.description
        }
      })
    });
    const payload = (await response.json()) as { data?: { link?: string }; message?: string };
    if (!response.ok || !payload.data?.link) {
      log('error', { scope: 'payment.flutterwave.create', message: 'failed', meta: { payload } });
      throw new Error('flutterwave_checkout_failed');
    }
    return {
      checkoutUrl: payload.data.link,
      providerReference: input.txRef,
      raw: payload
    };
  }

  const response = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apikey: env.CINETPAY_API_KEY,
      site_id: env.CINETPAY_SITE_ID,
      transaction_id: input.txRef,
      amount: input.amount,
      currency: input.currency,
      description: input.description,
      notify_url: `${env.APP_BASE_URL}/api/payments/payment-webhook?provider=CINETPAY`,
      return_url: input.redirectUrl,
      channels: 'ALL',
      customer_name: input.customer.name,
      customer_email: input.customer.email,
      customer_phone_number: input.customer.phone
    })
  });
  const payload = (await response.json()) as {
    code?: string;
    data?: { payment_url?: string };
  };
  if (!response.ok || !payload.data?.payment_url) {
    log('error', { scope: 'payment.cinetpay.create', message: 'failed', meta: { payload } });
    throw new Error('cinetpay_checkout_failed');
  }
  return {
    checkoutUrl: payload.data.payment_url,
    providerReference: input.txRef,
    raw: payload
  };
}

export async function verifyProviderPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
  if (input.provider === 'MOCK') {
    return { paid: true, providerTransactionId: input.providerReference, raw: { mode: 'mock' } };
  }

  if (input.provider === 'FLUTTERWAVE') {
    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(input.providerReference)}`,
      {
        headers: {
          Authorization: `Bearer ${env.FLUTTERWAVE_SECRET_KEY}`
        }
      }
    );
    const payload = (await response.json()) as {
      status?: string;
      data?: { id?: number; status?: string };
    };
    const paid = response.ok && payload.status === 'success' && payload.data?.status === 'successful';
    return {
      paid,
      providerTransactionId: payload.data?.id ? String(payload.data.id) : undefined,
      raw: payload
    };
  }

  const response = await fetch('https://api-checkout.cinetpay.com/v2/payment/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apikey: env.CINETPAY_API_KEY,
      site_id: env.CINETPAY_SITE_ID,
      transaction_id: input.providerReference
    })
  });
  const payload = (await response.json()) as {
    code?: string;
    data?: { status?: string; payment_method?: string };
  };
  const paid = response.ok && payload.code === '00' && payload.data?.status === 'ACCEPTED';
  return {
    paid,
    providerTransactionId: payload.data?.payment_method ? `${payload.data.payment_method}-${input.providerReference}` : undefined,
    raw: payload
  };
}
