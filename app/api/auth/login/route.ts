import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { env } from '@/lib/env';
import { prisma } from '@/lib/prisma';
import { createSessionToken } from '@/lib/session';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export async function POST(req: Request) {
  const body = schema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });

  const db = prisma as unknown as {
    user: {
      findUnique(args: { where: { email: string } }): Promise<{
        id: string;
        name: string;
        email: string;
        passwordHash: string | null;
        role: 'ADMIN' | 'CUSTOMER' | 'SELLER';
      } | null>;
    };
    seller?: {
      findFirst(args: { where: { userId: string } }): Promise<{ id: string } | null>;
    };
  };

  const user = await db.user.findUnique({ where: { email: body.data.email } });
  if (!user) return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
  if (!user.passwordHash) return NextResponse.json({ error: 'use_google_login' }, { status: 401 });

  const valid = await bcrypt.compare(body.data.password, user.passwordHash);
  if (!valid) return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });

  const seller = db.seller ? await db.seller.findFirst({ where: { userId: user.id } }) : null;

  const token = createSessionToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    sellerId: seller?.id ?? null
  });

  const response = NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      sellerId: seller?.id ?? null
    }
  });

  response.cookies.set(env.APP_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
    maxAge: env.APP_SESSION_TTL_SECONDS
  });
  return response;
}
