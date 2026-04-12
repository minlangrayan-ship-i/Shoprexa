import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(6).optional(),
  role: z.enum(['CUSTOMER', 'SELLER']).default('CUSTOMER')
});

export async function POST(req: Request) {
  const body = schema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });

  const db = prisma as unknown as {
    user: {
      findUnique(args: { where: { email: string } }): Promise<{ id: string } | null>;
      create(args: {
        data: Record<string, unknown>;
      }): Promise<{ id: string }>;
    };
    seller?: {
      create(args: {
        data: { userId: string; companyName: string; status: 'PENDING' };
      }): Promise<{ id: string }>;
    };
  };
  const exists = await db.user.findUnique({ where: { email: body.data.email } });
  if (exists) return NextResponse.json({ error: 'email_already_exists' }, { status: 409 });

  const passwordHash = await bcrypt.hash(body.data.password, 10);
  const user = await db.user.create({
    data: {
      name: body.data.name,
      email: body.data.email,
      passwordHash,
      ...(body.data.phone ? { phone: body.data.phone } : {}),
      role: body.data.role
    } as Record<string, unknown>
  });

  if (body.data.role === 'SELLER' && db.seller) {
    await db.seller.create({
      data: {
        userId: user.id,
        companyName: `${body.data.name} Store`,
        status: 'PENDING'
      }
    });
  }

  return NextResponse.json({ ok: true, userId: user.id }, { status: 201 });
}
