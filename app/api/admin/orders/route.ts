import { NextResponse } from 'next/server';
import { requireRoles } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const access = requireRoles(request, ['ADMIN']);
  if (!access.ok) return access.response;
  const orders = await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(orders);
}
