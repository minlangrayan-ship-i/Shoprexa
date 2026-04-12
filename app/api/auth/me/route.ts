import { NextResponse } from 'next/server';
import { sessionFromRequest } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const session = sessionFromRequest(request);
  if (!session) return NextResponse.json({ user: null });

  const db = prisma as unknown as {
    user: {
      findUnique(args: { where: { id: string } }): Promise<{
        id: string;
        name: string;
        email: string;
        role: 'ADMIN' | 'CUSTOMER' | 'SELLER';
      } | null>;
    };
    seller?: {
      findFirst(args: { where: { userId: string } }): Promise<{ id: string } | null>;
    };
  };
  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    return NextResponse.json({
      user: {
        id: session.userId,
        name: session.email.split('@')[0],
        email: session.email,
        role: session.role,
        sellerId: session.sellerId ?? null
      }
    });
  }

  const seller = db.seller ? await db.seller.findFirst({ where: { userId: user.id } }) : null;

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      sellerId: seller?.id ?? null
    }
  });
}
