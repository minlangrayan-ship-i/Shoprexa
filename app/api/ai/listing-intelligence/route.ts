import { NextResponse } from 'next/server';
import { z } from 'zod';
import { recordAiMetric } from '@/services/ai/health-metrics';
import { runListingIntelligence } from '@/services/ai/listing-intelligence';

const ROUTE_KEY = '/api/ai/listing-intelligence';

const schema = z.object({
  locale: z.enum(['fr', 'en']).default('fr'),
  country: z.string().min(2),
  city: z.string().min(2),
  userQuery: z.string().min(2),
  listing: z.object({
    name: z.string().min(2),
    categorySlug: z.string().min(2),
    description: z.string().optional(),
    imageUrls: z.array(z.string()).default([])
  }),
  maxResults: z.number().int().min(1).max(10).optional()
});

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      recordAiMetric(ROUTE_KEY, { error: true });
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const result = await runListingIntelligence(parsed.data);
    recordAiMetric(ROUTE_KEY, { fallback: result.fallbackUsed });
    return NextResponse.json(result);
  } catch {
    recordAiMetric(ROUTE_KEY, { error: true, fallback: true });
    return NextResponse.json({ error: 'listing_intelligence_internal_error' }, { status: 500 });
  }
}
