import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const apps = await prisma.sellerApplication.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(apps);
}
