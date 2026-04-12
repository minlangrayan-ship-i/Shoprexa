import { formatPrice } from '@/lib/utils';
import type { GroundedAnswer, Locale, ParsedUserQuery, RankedCatalogProduct } from '@/types/marketplace-ai';

export function buildGroundedCatalogAnswer(params: {
  locale: Locale;
  query: ParsedUserQuery;
  results: RankedCatalogProduct[];
  maxLines?: number;
}): GroundedAnswer {
  const top = params.results.slice(0, Math.max(1, Math.min(5, params.maxLines ?? 3)));

  if (top.length === 0) {
    return {
      text:
        params.locale === 'fr'
          ? 'Aucun produit reel du catalogue ne correspond assez a la demande pour le moment. Essaie avec une categorie, un budget ou une ville.'
          : 'No real catalog products matched the request strongly enough. Try adding category, budget, or city.',
      usedProductIds: []
    };
  }

  const header =
    params.locale === 'fr'
      ? `Voici ${top.length} resultat(s) reels trouves dans le catalogue:`
      : `Here are ${top.length} real result(s) found in the catalog:`;

  const lines = top.map((entry, index) => {
    const product = entry.product;
    const price = formatPrice(product.price, product.country);
    const reasonText = entry.reasons.slice(0, 2).join(', ');
    return params.locale === 'fr'
      ? `${index + 1}. ${product.name} (${price}) - ${product.city}, ${product.country} - coherence ${entry.coherenceScore}/100${reasonText ? ` - ${reasonText}` : ''}.`
      : `${index + 1}. ${product.name} (${price}) - ${product.city}, ${product.country} - coherence ${entry.coherenceScore}/100${reasonText ? ` - ${reasonText}` : ''}.`;
  });

  const footer =
    params.locale === 'fr'
      ? 'Reponse strictement basee sur ces produits trouves.'
      : 'Response strictly grounded in these retrieved products.';

  return {
    text: [header, ...lines, footer].join('\n'),
    usedProductIds: top.map((entry) => entry.product.id)
  };
}
