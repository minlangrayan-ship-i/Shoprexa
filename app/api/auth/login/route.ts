import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const schema = z.object({ email: z.string().email(), password: z.string().min(8) });

export async function POST(req: Request) {
  const body = schema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: 'Données invalides' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: body.data.email } });
  if (!user || !(await bcrypt.compare(body.data.password, user.passwordHash))) return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
  return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role } });
}
