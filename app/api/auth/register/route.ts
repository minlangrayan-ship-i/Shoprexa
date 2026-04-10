import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const schema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8) });

export async function POST(req: Request) {
  const body = schema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: 'Données invalides' }, { status: 400 });

  const exists = await prisma.user.findUnique({ where: { email: body.data.email } });
  if (exists) return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 409 });
  const passwordHash = await bcrypt.hash(body.data.password, 10);
  const user = await prisma.user.create({ data: { name: body.data.name, email: body.data.email, passwordHash } });
  return NextResponse.json({ user: { id: user.id, email: user.email } }, { status: 201 });
}
