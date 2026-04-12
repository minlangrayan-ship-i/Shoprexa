import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';

export type SessionRole = 'ADMIN' | 'SELLER' | 'CUSTOMER';

export type SessionPayload = {
  userId: string;
  email: string;
  role: SessionRole;
  sellerId?: string | null;
  exp: number;
};

function toBase64Url(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function fromBase64Url(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function signRaw(raw: string) {
  return crypto.createHmac('sha256', env.APP_SESSION_SECRET).update(raw).digest('base64url');
}

export function createSessionToken(input: Omit<SessionPayload, 'exp'>, ttlSeconds = env.APP_SESSION_TTL_SECONDS) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload: SessionPayload = { ...input, exp };
  const raw = toBase64Url(JSON.stringify(payload));
  const signature = signRaw(raw);
  return `${raw}.${signature}`;
}

export function verifySessionToken(token: string | null | undefined): SessionPayload | null {
  if (!token) return null;
  const [raw, signature] = token.split('.');
  if (!raw || !signature) return null;

  const expected = signRaw(raw);
  if (signature.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  try {
    const payload = JSON.parse(fromBase64Url(raw)) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function readServerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(env.APP_SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}
