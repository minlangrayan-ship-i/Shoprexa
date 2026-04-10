import { NextResponse } from 'next/server';
import { z } from 'zod';
import { findUserByCredentials } from '@/lib/mock-marketplace';

const schema = z.object({ email: z.string().email(), password: z.string().min(6) });

export async function POST(req: Request) {
  const body = schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: 'Donnees invalides' }, { status: 400 });
  }

  const user = findUserByCredentials(body.data.email, body.data.password);
  if (!user) {
    return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      country: user.country,
      city: user.city,
      sellerId: user.sellerId ?? null
    }
  });
}
