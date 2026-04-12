import { cityDistanceBands } from '@/db/mock-ai-data';
import type { DeliveryEstimateRequest, DeliveryEstimateResponse } from '@/types/marketplace-ai';

function findDistance(cityA: string, cityB: string) {
  const match = cityDistanceBands.find(
    (item) => (item.from === cityA && item.to === cityB) || (item.from === cityB && item.to === cityA)
  );
  return match?.km ?? null;
}

export function estimateSmartDelivery(input: DeliveryEstimateRequest, locale: 'fr' | 'en'): DeliveryEstimateResponse {
  const sameCountry = input.clientCountry === input.sellerCountry;
  const sameCity = sameCountry && input.clientCity === input.sellerCity;
  const knownDistance = findDistance(input.clientCity, input.sellerCity);

  if (sameCity) {
    const expressBoost = input.priority === 'express' ? -1 : 0;
    return {
      transport: 'Moto',
      delayLabel: locale === 'fr' ? '2h a 6h' : '2h to 6h',
      etaMinHours: Math.max(1, 2 + expressBoost),
      etaMaxHours: Math.max(3, 6 + expressBoost),
      reliability: input.stock > 0 ? 'high' : 'medium',
      explanation:
        locale === 'fr'
          ? 'Livraison locale rapide car vendeur et client sont dans la meme ville.'
          : 'Fast local delivery because seller and customer are in the same city.'
    };
  }

  if (sameCountry) {
    const longHaul = (knownDistance ?? 300) > 350;
    return {
      transport: longHaul ? 'Camion' : 'Voiture',
      delayLabel: locale === 'fr' ? '24h a 72h' : '24h to 72h',
      etaMinHours: 24,
      etaMaxHours: longHaul ? 84 : 60,
      reliability: input.stock > 3 ? 'high' : 'medium',
      explanation:
        locale === 'fr'
          ? 'Livraison inter-ville dans le meme pays. Le stock et la distance influencent le delai.'
          : 'Inter-city domestic delivery. Stock and distance influence ETA.'
    };
  }

  return {
    transport: 'Avion',
    delayLabel: locale === 'fr' ? '3 a 7 jours' : '3 to 7 days',
    etaMinHours: 72,
    etaMaxHours: input.kind === 'service' ? 120 : 168,
    reliability: input.stock > 5 ? 'medium' : 'low',
    explanation:
      locale === 'fr'
        ? 'Livraison internationale avec transit douane/logistique, delai variable selon pays.'
        : 'International shipping with customs/logistics transit, ETA varies by country.'
  };
}
