import { NextResponse } from 'next/server';
import { requireRoles } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const access = requireRoles(request, ['ADMIN']);
  if (!access.ok) return access.response;
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(messages);
}
