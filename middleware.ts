import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { env } from '@/lib/env';

function isPrivatePath(pathname: string) {
  return pathname.startsWith('/admin') || pathname.startsWith('/seller') || pathname.startsWith('/client/home');
}

export async function middleware(request: NextRequest) {
  if (!isPrivatePath(request.nextUrl.pathname)) return NextResponse.next();
  if (process.env.NODE_ENV !== 'production' && env.ENABLE_DEV_AUTH_BYPASS) return NextResponse.next();

  const sessionCookie = request.cookies.get(env.APP_SESSION_COOKIE_NAME)?.value;
  const nextAuthToken = await getToken({ req: request, secret: env.NEXTAUTH_SECRET });
  if (nextAuthToken) return NextResponse.next();
  if (!sessionCookie) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/seller/:path*', '/client/home']
};
