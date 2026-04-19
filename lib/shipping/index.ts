export type TransportMode = 'moto' | 'voiture' | 'camion' | 'avion';

export type ShippingEstimateInput = {
  sellerCountry?: string | null;
  sellerCity?: string | null;
  customerCountry?: string | null;
  customerCity?: string | null;
  distanceKm?: number | null;
  stock: number;
  priority?: 'standard' | 'express';
};

export type ShippingEstimate = {
  transportMode: TransportMode;
  estimatedMinHours: number;
  estimatedMaxHours: number;
  reliability: number;
  rationale: string;
};

export function estimateShipment(input: ShippingEstimateInput): ShippingEstimate {
  const sameCountry = Boolean(input.sellerCountry && input.customerCountry && input.sellerCountry === input.customerCountry);
  const sameCity = sameCountry && Boolean(input.sellerCity && input.customerCity && input.sellerCity === input.customerCity);
  const priorityBoost = input.priority === 'express' ? -1 : 0;

  if (sameCity) {
    return {
      transportMode: 'moto',
      estimatedMinHours: Math.max(1, 2 + priorityBoost),
      estimatedMaxHours: Math.max(3, 6 + priorityBoost),
      reliability: input.stock > 0 ? 92 : 70,
      rationale: 'Local urbain: livraison rapide par moto.'
    };
  }

  if (sameCountry) {
    const far = (input.distanceKm ?? 250) > 300;
    return {
      transportMode: far ? 'camion' : 'voiture',
      estimatedMinHours: 24,
      estimatedMaxHours: far ? 72 : 48,
      reliability: input.stock > 2 ? 84 : 68,
      rationale: 'Inter-ville domestique: voiture/camion selon distance.'
    };
  }

  return {
    transportMode: 'avion',
    estimatedMinHours: 72,
    estimatedMaxHours: 168,
    reliability: input.stock > 5 ? 76 : 60,
    rationale: 'Transfrontalier: transport aérien avec transit logistique.'
  };
}

export const SHIPMENT_FLOW: Array<{
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'SHIPPED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  labelFr: string;
  labelEn: string;
}> = [
  { status: 'PENDING', labelFr: 'En attente', labelEn: 'Pending' },
  { status: 'CONFIRMED', labelFr: 'Confirmée', labelEn: 'Confirmed' },
  { status: 'PREPARING', labelFr: 'Préparation', labelEn: 'Preparing' },
  { status: 'SHIPPED', labelFr: 'Expédiée', labelEn: 'Shipped' },
  { status: 'IN_TRANSIT', labelFr: 'En transit', labelEn: 'In transit' },
  { status: 'OUT_FOR_DELIVERY', labelFr: 'En cours de livraison', labelEn: 'Out for delivery' },
  { status: 'DELIVERED', labelFr: 'Livrée', labelEn: 'Delivered' },
  { status: 'CANCELLED', labelFr: 'Annulée', labelEn: 'Cancelled' }
];

