export type GeocodeResult = {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  confidence: number;
  provider: 'MAPBOX' | 'GOOGLE' | 'FALLBACK';
};

export interface GeocodingProvider {
  name: 'MAPBOX' | 'GOOGLE' | 'FALLBACK';
  geocode(address: string, country?: string): Promise<GeocodeResult | null>;
}

export type SellerLocationInput = {
  country: string;
  city: string;
  address: string;
};

export type SellerLocationOutput = {
  country: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  locationVerified: boolean;
  provider: string;
};

