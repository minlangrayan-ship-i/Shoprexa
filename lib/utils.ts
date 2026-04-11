import clsx from 'clsx';

export const cn = (...values: Array<string | undefined | false | null>) => clsx(values);

const currencyByCountry: Record<string, { currency: string; locale: string; rate: number }> = {
  'Cameroun': { currency: 'XAF', locale: 'fr-CM', rate: 1 },
  'Cote d\'Ivoire': { currency: 'XOF', locale: 'fr-CI', rate: 1 },
  'Senegal': { currency: 'XOF', locale: 'fr-SN', rate: 1 },
  'Congo': { currency: 'XAF', locale: 'fr-CG', rate: 1 },
  'Tchad': { currency: 'XAF', locale: 'fr-TD', rate: 1 },
  'Nigeria': { currency: 'NGN', locale: 'en-NG', rate: 1.24 },
  'Kenya': { currency: 'KES', locale: 'en-KE', rate: 0.26 },
  'France': { currency: 'EUR', locale: 'fr-FR', rate: 0.0015 }
};

export function formatPrice(value: number, country = 'Cameroun') {
  const cfg = currencyByCountry[country] ?? { currency: 'USD', locale: 'en-US', rate: 0.0017 };
  return new Intl.NumberFormat(cfg.locale, { style: 'currency', currency: cfg.currency, maximumFractionDigits: 0 }).format(Math.round(value * cfg.rate));
}

export function estimateDelivery(params: {
  clientCountry: string;
  clientCity: string;
  sellerCountry: string;
  sellerCity: string;
  subtotal: number;
}) {
  const { clientCountry, clientCity, sellerCountry, sellerCity, subtotal } = params;
  const base = clientCountry === sellerCountry ? 1800 : 9500;

  if (clientCountry === sellerCountry && clientCity === sellerCity) {
    const cost = base + Math.round(subtotal * 0.02);
    return { transport: 'Moto', delay: '2h a 6h', etaDays: 0, deliveryCost: cost };
  }

  if (clientCountry === sellerCountry) {
    const isLargeOrder = subtotal > 90000;
    const cost = base + Math.round(subtotal * (isLargeOrder ? 0.04 : 0.03));
    return {
      transport: isLargeOrder ? 'Camion' : 'Voiture',
      delay: '24h a 72h',
      etaDays: 2,
      deliveryCost: cost
    };
  }

  const cost = base + Math.round(subtotal * 0.08);
  return { transport: 'Avion', delay: '3 a 7 jours', etaDays: 5, deliveryCost: cost };
}
