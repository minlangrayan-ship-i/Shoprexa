import type { DefaultSession } from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { env } from '@/lib/env';
import { prisma } from '@/lib/prisma';

type DbUser = {
  id: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER' | 'SELLER';
  provider: 'LOCAL' | 'GOOGLE' | 'MIXED';
  seller: { id: string } | null;
};

async function findDbUserByEmail(email: string): Promise<DbUser | null> {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { seller: { select: { id: true } } }
  }) as Promise<DbUser | null>;
}

export const authOptions: NextAuthOptions = {
  secret: env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: { signIn: '/auth/login' },
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google') return true;
      const email = user.email?.toLowerCase();
      if (!email) return false;

      const existing = await findDbUserByEmail(email);

      if (!existing) {
        await prisma.user.create({
          data: {
            name: user.name?.trim() || email.split('@')[0],
            email,
            image: user.image ?? null,
            provider: 'GOOGLE',
            role: 'CUSTOMER',
            passwordHash: null
          }
        });
        return true;
      }

      const provider =
        existing.provider === 'LOCAL'
          ? 'MIXED'
          : existing.provider;

      await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: user.name?.trim() || existing.email.split('@')[0],
          image: user.image ?? null,
          provider
        }
      });

      return true;
    },
    async jwt({ token }) {
      const email = token.email?.toLowerCase();
      if (!email) return token;

      const dbUser = await findDbUserByEmail(email);
      if (!dbUser) return token;

      token.uid = dbUser.id;
      token.role = dbUser.role;
      token.sellerId = dbUser.seller?.id ?? null;

      return token;
    },
    async session({ session, token }) {
      if (!session.user) return session;

      session.user.id = String(token.uid ?? '');
      session.user.role = (token.role as 'ADMIN' | 'CUSTOMER' | 'SELLER') ?? 'CUSTOMER';
      session.user.sellerId = (token.sellerId as string | null) ?? null;

      return session;
    }
  }
};

export type AppSessionUser = DefaultSession['user'] & {
  id: string;
  role: 'ADMIN' | 'CUSTOMER' | 'SELLER';
  sellerId: string | null;
};

