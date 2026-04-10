import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const schema = z.object({ fullName: z.string().min(2), businessName: z.string().min(2), email: z.string().email(), phone: z.string().min(6), category: z.string().min(2), city: z.string().min(2), message: z.string().optional() });

export async function POST(req: Request) {
  const body = schema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  const application = await prisma.sellerApplication.create({ data: body.data });
  return NextResponse.json(application, { status: 201 });
}
