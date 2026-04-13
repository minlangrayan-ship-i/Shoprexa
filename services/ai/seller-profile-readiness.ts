import type { MarketplaceProduct, MarketplaceSeller } from '@/lib/mock-marketplace';
import { assessLinguisticQuality } from '@/services/ai/linguistic-quality';

export type SellerProfileReadiness = {
  accessible: boolean;
  score: number;
  alerts: string[];
};

export function validateSellerProfileReadiness(
  seller: MarketplaceSeller,
  products: MarketplaceProduct[],
  locale: 'fr' | 'en'
): SellerProfileReadiness {
  const sellerOffers = products.filter((product) => product.sellerId === seller.id);
  const serviceCount = sellerOffers.filter((offer) => (offer.kind ?? 'product') === 'service').length;
  const combinedText = [seller.activityDescription, seller.about, ...sellerOffers.map((offer) => offer.description)].join(' ').trim();
  const linguisticQuality = assessLinguisticQuality(combinedText, locale);

  const alerts = [...linguisticQuality.alerts];
  let score = linguisticQuality.score;

  if (seller.activityDescription.trim().length < 350) {
    alerts.push(
      locale === 'fr'
        ? 'La description publique doit contenir au moins 350 caracteres.'
        : 'The public description must contain at least 350 characters.'
    );
    score -= 40;
  }

  const shortOfferDescriptions = sellerOffers.filter((offer) => offer.description.trim().length < 60).length;
  if (shortOfferDescriptions > 0) {
    alerts.push(
      locale === 'fr'
        ? 'Certaines descriptions produit/service sont trop courtes pour inspirer confiance.'
        : 'Some product or service descriptions are too short to build trust.'
    );
    score -= Math.min(20, shortOfferDescriptions * 4);
  }

  if (!seller.socialLinks || Object.values(seller.socialLinks).filter(Boolean).length < 2) {
    alerts.push(
      locale === 'fr'
        ? 'Ajoute au moins deux liens sociaux pour rendre le profil plus credible.'
        : 'Add at least two social links to make the profile more credible.'
    );
    score -= 10;
  }

  if (!seller.openingHours || !seller.closingHours) {
    alerts.push(
      locale === 'fr'
        ? 'Les horaires d ouverture doivent etre renseignes.'
        : 'Opening and closing hours must be provided.'
    );
    score -= 8;
  }

  if (sellerOffers.length === 0) {
    alerts.push(
      locale === 'fr'
        ? 'Ajoute au moins une offre avant de rendre le profil public.'
        : 'Add at least one offer before making the profile public.'
    );
    score -= 25;
  }

  if (serviceCount > 0 && !seller.activityDescription.toLowerCase().includes('service')) {
    alerts.push(
      locale === 'fr'
        ? 'Mentionne clairement les services proposes dans la description publique.'
        : 'Mention the offered services clearly in the public description.'
    );
    score -= 6;
  }

  return {
    accessible: score >= 72 && seller.activityDescription.trim().length >= 350 && linguisticQuality.typoCount === 0,
    score: Math.max(0, Math.min(100, score)),
    alerts
  };
}
