import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyProductConsistency } from '@/services/verification/product-consistency';
import { recordAiMetric } from '@/services/ai/health-metrics';

const ROUTE_KEY = '/api/product-verification';

const schema = z.object({
  locale: z.enum(['fr', 'en']).default('fr'),
  name: z.string().min(2),
  categorySlug: z.string().min(2),
  description: z.string().optional(),
  images: z
    .array(
      z.object({
        src: z.string().min(2),
        width: z.number().optional(),
        height: z.number().optional(),
        sizeKb: z.number().optional(),
        mimeType: z.string().optional(),
        source: z.enum(['upload', 'catalog']).optional()
      })
    )
    .default([])
});

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      recordAiMetric(ROUTE_KEY, { error: true });
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { locale, ...payload } = parsed.data;
    recordAiMetric(ROUTE_KEY);
    return NextResponse.json(verifyProductConsistency(payload, locale));
  } catch {
    recordAiMetric(ROUTE_KEY, { error: true });
    return NextResponse.json({ error: 'verification_internal_error' }, { status: 500 });
  }
}
