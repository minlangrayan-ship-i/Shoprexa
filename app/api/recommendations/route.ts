import { NextResponse } from 'next/server';
import { z } from 'zod';
import { buildRecommendations } from '@/services/recommendations/recommendation-engine';
import { recordAiMetric } from '@/services/ai/health-metrics';

const ROUTE_KEY = '/api/recommendations';

const schema = z.object({
  locale: z.enum(['fr', 'en']).default('fr'),
  country: z.string().min(2),
  city: z.string().optional(),
  productId: z.string().optional(),
  budget: z.number().optional(),
  viewedCategorySlug: z.string().optional(),
  followedSellerIds: z.array(z.string()).optional()
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
    return NextResponse.json(buildRecommendations(payload, locale));
  } catch {
    recordAiMetric(ROUTE_KEY, { error: true });
    return NextResponse.json({ error: 'recommendations_internal_error' }, { status: 500 });
  }
}
