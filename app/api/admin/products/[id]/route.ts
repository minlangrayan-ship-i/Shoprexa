import { NextResponse } from 'next/server';
import { requireRoles } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = requireRoles(req, ['ADMIN']);
  if (!access.ok) return access.response;
  const body = await req.json();
  const { id } = await params;
  const product = await prisma.product.update({ where: { id }, data: body });
  return NextResponse.json(product);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = requireRoles(request, ['ADMIN']);
  if (!access.ok) return access.response;
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
