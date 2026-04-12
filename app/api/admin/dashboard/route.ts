import { NextResponse } from 'next/server';
import { requireRoles } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const access = requireRoles(request, ['ADMIN']);
  if (!access.ok) return access.response;

  const db = prisma as unknown as {
    user: { count(): Promise<number> };
    seller?: { count(): Promise<number> };
    product: { count(): Promise<number> };
    order: {
      count(args?: { where?: { status?: 'PAID' } }): Promise<number>;
      aggregate(args: { _sum: { total: true }; where: { status: 'PAID' } }): Promise<{ _sum: { total: number | string | null } }>;
    };
    sellerApplication: { count(): Promise<number> };
  };
  const [users, sellers, products, orders, paidOrders, revenue, pendingSellerApplications] = await Promise.all([
    db.user.count(),
    db.seller?.count?.() ?? 0,
    db.product.count(),
    db.order.count(),
    db.order.count({ where: { status: 'PAID' } }),
    db.order.aggregate({ _sum: { total: true }, where: { status: 'PAID' } }),
    db.sellerApplication.count()
  ]);

  return NextResponse.json({
    users,
    sellers,
    products,
    orders,
    paidOrders,
    revenue: Number(revenue?._sum?.total ?? 0),
    pendingSellerApplications
  });
}
