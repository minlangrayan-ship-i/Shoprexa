import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRoles } from '@/lib/api-auth';
import { resolveSellerLocation } from '@/lib/location';
import { prisma } from '@/lib/prisma';
import { getCityDistricts, isLaunchCountry, isSupportedLaunchCity, launchCountryName } from '@/lib/geo-config';

const schema = z.object({
  sellerId: z.string().optional(),
  country: z.string().min(2),
  city: z.string().min(2),
  district: z.string().min(2),
  address: z.string().min(6)
});

export async function POST(request: Request) {
  const access = requireRoles(request, ['SELLER', 'ADMIN']);
  if (!access.ok) return access.response;

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (!isLaunchCountry(parsed.data.country)) {
    return NextResponse.json({ error: 'country_not_supported', message: `Lancement limité au ${launchCountryName}.` }, { status: 400 });
  }

  if (!isSupportedLaunchCity(parsed.data.city)) {
    return NextResponse.json({ error: 'city_not_supported' }, { status: 400 });
  }

  if (!getCityDistricts(parsed.data.city).includes(parsed.data.district)) {
    return NextResponse.json({ error: 'district_not_supported' }, { status: 400 });
  }

  const targetSellerId = access.session?.role === 'ADMIN'
    ? parsed.data.sellerId
    : access.session?.sellerId;

  if (!targetSellerId) {
    return NextResponse.json({ error: 'seller_profile_missing' }, { status: 400 });
  }

  const location = await resolveSellerLocation({
    country: launchCountryName,
    city: parsed.data.city,
    address: `${parsed.data.district}, ${parsed.data.address}`
  });

  await prisma.seller.update({
    where: { id: targetSellerId },
    data: {
      country: launchCountryName,
      city: location.city,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      locationVerified: location.locationVerified
    }
  });

  return NextResponse.json({ ok: true, location });
}
