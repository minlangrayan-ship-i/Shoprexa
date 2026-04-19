import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth-options';
import { env } from '@/lib/env';
import { prisma } from '@/lib/prisma';
import { createSessionToken } from '@/lib/session';

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
    include: { seller: { select: { id: true } } }
  });

  if (!dbUser) {
    return NextResponse.json({ error: 'user_not_found' }, { status: 404 });
  }

  const token = createSessionToken({
    userId: dbUser.id,
    email: dbUser.email,
    role: dbUser.role,
    sellerId: dbUser.seller?.id ?? null
  });

  const response = NextResponse.json({
    ok: true,
    user: {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      sellerId: dbUser.seller?.id ?? null
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

