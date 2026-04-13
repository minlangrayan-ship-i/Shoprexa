import type { MarketplaceProduct, MarketplaceSeller } from '@/lib/mock-marketplace';

export type SellerProfileReadiness = {
  accessible: boolean;
  score: number;
  alerts: string[];
};

const brokenEncodingPattern = /Ã|â€™|â€œ|â€|�/;
const suspiciousFragments = [
  'lorem ipsum',
  'test test',
  'xxx',
  'pas encore',
  'to do',
  'coming soon',
  'n/a'
];

function countSuspiciousTypos(content: string) {
  const patterns = [
    /\bteh\b/gi,
    /\brecieve\b/gi,
    /\badress\b/gi,
    /\bcommende\b/gi,
    /\bproduitss\b/gi,
    /\bservicess\b/gi
  ];

  return patterns.reduce((count, pattern) => count + (content.match(pattern)?.length ?? 0), 0);
}

export function validateSellerProfileReadiness(
  seller: MarketplaceSeller,
  products: MarketplaceProduct[],
  locale: 'fr' | 'en'
): SellerProfileReadiness {
  const sellerOffers = products.filter((product) => product.sellerId === seller.id);
  const serviceCount = sellerOffers.filter((offer) => (offer.kind ?? 'product') === 'service').length;
  const combinedText = [seller.activityDescription, seller.about, ...sellerOffers.map((offer) => offer.description)].join(' ').trim();

  const alerts: string[] = [];
  let score = 100;

  if (seller.activityDescription.trim().length < 350) {
    alerts.push(
      locale === 'fr'
        ? 'La description publique doit contenir au moins 350 caracteres.'
        : 'The public description must contain at least 350 characters.'
    );
    score -= 40;
  }

  if (brokenEncodingPattern.test(combinedText)) {
    alerts.push(
      locale === 'fr'
        ? 'Le texte public contient des caracteres mal encodes. Corrige la langue avant publication.'
        : 'Public text contains broken encoded characters. Fix the language before publishing.'
    );
    score -= 35;
  }

  const suspiciousCount = suspiciousFragments.reduce(
    (count, fragment) => count + (combinedText.toLowerCase().includes(fragment) ? 1 : 0),
    0
  );
  if (suspiciousCount > 0) {
    alerts.push(
      locale === 'fr'
        ? 'Le profil contient des formulations trop faibles ou provisoires.'
        : 'The profile contains weak or provisional wording.'
    );
    score -= suspiciousCount * 8;
  }

  const typoCount = countSuspiciousTypos(combinedText);
  if (typoCount > 0) {
    alerts.push(
      locale === 'fr'
        ? 'Le profil semble contenir des fautes en francais ou en anglais.'
        : 'The profile appears to contain French or English mistakes.'
    );
    score -= Math.min(24, typoCount * 6);
  }

  const shortOfferDescriptions = sellerOffers.filter((offer) => offer.description.trim().length < 60).length;
  if (shortOfferDescriptions > 0) {
    alerts.push(
      locale === 'fr'
        ? 'Certaines descriptions produit/service sont trop courtes pour inspirer confiance.'
        : 'Some product/service descriptions are too short to build trust.'
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
    accessible: score >= 72,
    score: Math.max(0, Math.min(100, score)),
    alerts
  };
}
