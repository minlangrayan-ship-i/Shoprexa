import crypto from 'node:crypto';
import { env } from '@/lib/env';

function safeEqual(a: string, b: string) {
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function verifyPaymentWebhookSignature(input: {
  provider: 'FLUTTERWAVE' | 'CINETPAY' | 'MOCK';
  headers: Headers;
  rawBody: string;
}) {
  if (input.provider === 'MOCK') return true;

  if (input.provider === 'FLUTTERWAVE') {
    const signature = input.headers.get('verif-hash') ?? '';
    if (!signature || !env.FLUTTERWAVE_WEBHOOK_SECRET) return false;
    if (signature.length !== env.FLUTTERWAVE_WEBHOOK_SECRET.length) return false;
    return safeEqual(signature, env.FLUTTERWAVE_WEBHOOK_SECRET);
  }

  const signature = input.headers.get('x-token') ?? '';
  if (!signature || !env.CINETPAY_WEBHOOK_SECRET) return false;
  const expected = crypto.createHmac('sha256', env.CINETPAY_WEBHOOK_SECRET).update(input.rawBody).digest('hex');
  if (signature.length !== expected.length) return false;
  return safeEqual(signature, expected);
}
