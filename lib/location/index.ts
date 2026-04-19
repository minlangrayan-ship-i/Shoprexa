import { env } from '@/lib/env';
import type { GeocodingProvider, SellerLocationInput, SellerLocationOutput } from '@/lib/location/types';
import { MapboxGeocodingProvider } from '@/lib/location/providers/mapbox-provider';
import { GoogleGeocodingProvider } from '@/lib/location/providers/google-provider';

class FallbackGeocodingProvider implements GeocodingProvider {
  name = 'FALLBACK' as const;

  async geocode(address: string): Promise<{ latitude: number; longitude: number; formattedAddress: string; confidence: number; provider: 'FALLBACK' } | null> {
    const seed = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const latitude = 3 + (seed % 9000) / 1000;
    const longitude = 8 + (seed % 13000) / 1000;

    return {
      latitude: Number(latitude.toFixed(7)),
      longitude: Number(longitude.toFixed(7)),
      formattedAddress: address,
      confidence: 45,
      provider: 'FALLBACK'
    };
  }
}

function getProvider(): GeocodingProvider {
  if (env.GEO_PROVIDER === 'GOOGLE') return new GoogleGeocodingProvider();
  return new MapboxGeocodingProvider();
}

export function haversineDistanceKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((a.latitude * Math.PI) / 180) *
      Math.cos((b.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return Number((R * c).toFixed(1));
}

export async function resolveSellerLocation(input: SellerLocationInput): Promise<SellerLocationOutput> {
  const provider = getProvider();
  const baseAddress = `${input.address}, ${input.city}, ${input.country}`;

  const externalResult = await provider.geocode(baseAddress, input.country);
  const finalResult = externalResult ?? (await new FallbackGeocodingProvider().geocode(baseAddress));

  if (!finalResult) {
    throw new Error('location_resolution_failed');
  }

  return {
    country: input.country,
    city: input.city,
    address: finalResult.formattedAddress,
    latitude: finalResult.latitude,
    longitude: finalResult.longitude,
    locationVerified: finalResult.provider !== 'FALLBACK',
    provider: finalResult.provider
  };
}

