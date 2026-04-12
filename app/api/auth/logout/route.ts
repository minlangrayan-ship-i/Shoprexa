import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(env.APP_SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    maxAge: 0
  });
  return response;
}
