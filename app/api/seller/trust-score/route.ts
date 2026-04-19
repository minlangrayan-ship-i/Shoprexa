import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRoles } from '@/lib/api-auth';
import { computeSellerTrustScore } from '@/lib/trust/compute-seller-trust';

const schema = z.object({
  sellerId: z.string().optional()
});

export async function POST(request: Request) {
  const access = requireRoles(request, ['SELLER', 'ADMIN']);
  if (!access.ok) return access.response;

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const sellerId = access.session?.role === 'ADMIN' ? parsed.data.sellerId : access.session?.sellerId;
  if (!sellerId) return NextResponse.json({ error: 'seller_profile_missing' }, { status: 400 });

  const result = await computeSellerTrustScore(sellerId);
  return NextResponse.json(result);
}

