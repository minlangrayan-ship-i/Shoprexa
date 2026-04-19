import { NextResponse } from 'next/server';
import { z } from 'zod';
import { estimateSmartDelivery } from '@/services/delivery/delivery-estimator';
import { recordAiMetric } from '@/services/ai/health-metrics';
import { isLaunchCountry, isSupportedLaunchCity, launchCountryName } from '@/lib/geo-config';

const ROUTE_KEY = '/api/delivery-estimate';

const schema = z.object({
  locale: z.enum(['fr', 'en']).default('fr'),
  sellerCountry: z.string().min(2),
  sellerCity: z.string().min(2),
  clientCountry: z.string().min(2),
  clientCity: z.string().min(2),
  stock: z.number().int().nonnegative(),
  kind: z.enum(['product', 'service']).default('product'),
  priority: z.enum(['standard', 'express']).default('standard')
});

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      recordAiMetric(ROUTE_KEY, { error: true });
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    if (!isLaunchCountry(parsed.data.sellerCountry) || !isLaunchCountry(parsed.data.clientCountry)) {
      recordAiMetric(ROUTE_KEY, { error: true });
      return NextResponse.json({ error: 'country_not_supported', message: `Lancement limité au ${launchCountryName}.` }, { status: 400 });
    }

    if (!isSupportedLaunchCity(parsed.data.sellerCity) || !isSupportedLaunchCity(parsed.data.clientCity)) {
      recordAiMetric(ROUTE_KEY, { error: true });
      return NextResponse.json({ error: 'city_not_supported' }, { status: 400 });
    }

    const { locale, ...payload } = parsed.data;
    recordAiMetric(ROUTE_KEY);
    return NextResponse.json(estimateSmartDelivery(payload, locale));
  } catch {
    recordAiMetric(ROUTE_KEY, { error: true });
    return NextResponse.json({ error: 'delivery_internal_error' }, { status: 500 });
  }
}
