import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateProductSheet } from '@/services/ai/product-sheet-generator';
import { recordAiMetric } from '@/services/ai/health-metrics';

const ROUTE_KEY = '/api/ai/product-generator';

const schema = z.object({
  locale: z.enum(['fr', 'en']).default('fr'),
  name: z.string().min(2),
  categorySlug: z.string().min(2),
  price: z.number().optional(),
  specs: z.string().optional(),
  benefits: z.string().optional(),
  condition: z.string().optional(),
  salesZone: z.string().optional(),
  kind: z.enum(['product', 'service']).default('product'),
  draft: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      recordAiMetric(ROUTE_KEY, { error: true });
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { locale, ...payload } = parsed.data;
    const result = await generateProductSheet(payload, locale);
    recordAiMetric(ROUTE_KEY);
    return NextResponse.json(result);
  } catch {
    recordAiMetric(ROUTE_KEY, { error: true, fallback: true });
    return NextResponse.json({ error: 'product_generator_internal_error' }, { status: 500 });
  }
}
