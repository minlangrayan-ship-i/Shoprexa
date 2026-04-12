import { NextResponse } from 'next/server';
import { z } from 'zod';
import { env, isProduction } from '@/lib/env';
import { createSessionToken, type SessionRole } from '@/lib/session';

const schema = z.object({
  userId: z.string().min(2),
  email: z.string().email(),
  role: z.enum(['ADMIN', 'CUSTOMER', 'SELLER']),
  sellerId: z.string().min(2).nullable().optional(),
  name: z.string().min(1).optional()
});

export async function POST(request: Request) {
  if (isProduction()) {
    return NextResponse.json({ error: 'forbidden_in_production' }, { status: 403 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // This route exists only to keep mock/demo accounts compatible with server-protected pages in development.
  const token = createSessionToken({
    userId: parsed.data.userId,
    email: parsed.data.email,
    role: parsed.data.role as SessionRole,
    sellerId: parsed.data.sellerId ?? null
  });

  const response = NextResponse.json({
    ok: true,
    user: {
      id: parsed.data.userId,
      email: parsed.data.email,
      role: parsed.data.role,
      sellerId: parsed.data.sellerId ?? null,
      name: parsed.data.name ?? null
    }
  });

  response.cookies.set(env.APP_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: env.APP_SESSION_TTL_SECONDS
  });

  return response;
}
