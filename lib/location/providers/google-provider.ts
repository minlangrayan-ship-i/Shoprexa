import { env } from '@/lib/env';
import type { GeocodingProvider, GeocodeResult } from '@/lib/location/types';

export class GoogleGeocodingProvider implements GeocodingProvider {
  name = 'GOOGLE' as const;

  async geocode(address: string, country?: string): Promise<GeocodeResult | null> {
    if (!env.GOOGLE_MAPS_API_KEY) return null;

    const query = encodeURIComponent(country ? `${address}, ${country}` : address);
    const endpoint = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${env.GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(endpoint, { method: 'GET', cache: 'no-store' });
    if (!response.ok) return null;

    const payload = await response.json() as {
      status?: string;
      results?: Array<{
        formatted_address?: string;
        geometry?: { location?: { lat?: number; lng?: number }; location_type?: string };
      }>;
    };

    const first = payload.results?.[0];
    const lat = first?.geometry?.location?.lat;
    const lng = first?.geometry?.location?.lng;
    if (typeof lat !== 'number' || typeof lng !== 'number') return null;

    const confidence = first?.geometry?.location_type === 'ROOFTOP' ? 95 : 80;

    return {
      latitude: lat,
      longitude: lng,
      formattedAddress: first?.formatted_address ?? address,
      confidence,
      provider: this.name
    };
  }
}

