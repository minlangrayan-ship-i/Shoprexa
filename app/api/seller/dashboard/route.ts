import { NextResponse } from 'next/server';
import { requireRoles } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const access = requireRoles(request, ['SELLER', 'ADMIN']);
  if (!access.ok) return access.response;

  const db = prisma as unknown as {
    product: { count(args?: { where?: { sellerId: string } }): Promise<number> };
    orderItem: {
      findMany(args: {
        where?: { product: { sellerId: string } };
        include: { order: true };
      }): Promise<Array<{ order: { status: string } | null }>>;
    };
    commission?: {
      aggregate(args: {
        where: { sellerId?: string; status: 'PAID' | 'PENDING' };
        _sum: { amount: true };
      }): Promise<{ _sum: { amount: number | string | null } }>;
    };
  };
  const sellerId = access.session?.sellerId;
  if (!sellerId && access.session?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'seller_profile_missing' }, { status: 400 });
  }

  const products = sellerId
    ? await db.product.count({ where: { sellerId } })
    : await db.product.count();

  const orderItems = sellerId
    ? await db.orderItem.findMany({ where: { product: { sellerId } }, include: { order: true } })
    : await db.orderItem.findMany({ include: { order: true } });

  const paidOrders = orderItems.filter((item) => item.order?.status === 'PAID').length;

  const earnedCommissions = db.commission
    ? await db.commission.aggregate({ where: sellerId ? { sellerId, status: 'PAID' } : { status: 'PAID' }, _sum: { amount: true } })
    : { _sum: { amount: 0 } };

  const pendingCommissions = db.commission
    ? await db.commission.aggregate({ where: sellerId ? { sellerId, status: 'PENDING' } : { status: 'PENDING' }, _sum: { amount: true } })
    : { _sum: { amount: 0 } };

  return NextResponse.json({
    products,
    orders: orderItems.length,
    paidOrders,
    earnedCommissions: Number(earnedCommissions._sum?.amount ?? 0),
    pendingCommissions: Number(pendingCommissions._sum?.amount ?? 0)
  });
}
