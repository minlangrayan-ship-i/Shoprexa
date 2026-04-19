import { env } from '@/lib/env';
import type { GeocodingProvider, GeocodeResult } from '@/lib/location/types';

export class MapboxGeocodingProvider implements GeocodingProvider {
  name = 'MAPBOX' as const;

  async geocode(address: string, country?: string): Promise<GeocodeResult | null> {
    if (!env.MAPBOX_ACCESS_TOKEN) return null;

    const query = encodeURIComponent(country ? `${address}, ${country}` : address);
    const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${env.MAPBOX_ACCESS_TOKEN}&limit=1`;

    const response = await fetch(endpoint, { method: 'GET', cache: 'no-store' });
    if (!response.ok) return null;

    const payload = await response.json() as { features?: Array<{ center?: [number, number]; place_name?: string; relevance?: number }> };
    const feature = payload.features?.[0];
    if (!feature?.center) return null;

    const [longitude, latitude] = feature.center;
    return {
      latitude,
      longitude,
      formattedAddress: feature.place_name ?? address,
      confidence: Math.round((feature.relevance ?? 0.8) * 100),
      provider: this.name
    };
  }
}

