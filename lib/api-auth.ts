import { NextResponse } from 'next/server';
import { env, isProduction } from '@/lib/env';
import { verifySessionToken, type SessionPayload, type SessionRole } from '@/lib/session';

export function sessionFromRequest(request: Request) {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  const chunks = cookieHeader.split(';').map((entry) => entry.trim());
  const sessionCookie = chunks.find((chunk) => chunk.startsWith(`${env.APP_SESSION_COOKIE_NAME}=`));
  if (!sessionCookie) return null;
  const value = sessionCookie.split('=').slice(1).join('=');
  return verifySessionToken(value);
}

export function requireRoles(request: Request, allowedRoles: SessionRole[]) {
  const session = sessionFromRequest(request);
  if (!session) {
    if (!isProduction() && env.ENABLE_DEV_AUTH_BYPASS) return { ok: true, session: null as SessionPayload | null };
    return { ok: false, response: NextResponse.json({ error: 'unauthorized' }, { status: 401 }) };
  }
  if (!allowedRoles.includes(session.role)) {
    return { ok: false, response: NextResponse.json({ error: 'forbidden' }, { status: 403 }) };
  }
  return { ok: true, session };
}
