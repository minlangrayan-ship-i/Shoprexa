import { buildGroundedCatalogAnswer } from '@/services/ai/grounded-response';
import { parseUserQuery } from '@/services/ai/query-parser';
import { rankCatalogProductsByQuery } from '@/services/ai/catalog-search';
import { evaluateListingCoherence } from '@/services/verification/listing-coherence-ai';
import type { ListingIntelligenceRequest, ListingIntelligenceResponse } from '@/types/marketplace-ai';

export async function runListingIntelligence(
  input: ListingIntelligenceRequest
): Promise<ListingIntelligenceResponse> {
  const query = parseUserQuery(input.userQuery);
  const { vision, coherence } = await evaluateListingCoherence({
    name: input.listing.name,
    categorySlug: input.listing.categorySlug,
    description: input.listing.description,
    imageUrls: input.listing.imageUrls,
    locale: input.locale
  });

  const results = rankCatalogProductsByQuery({
    locale: input.locale,
    query,
    defaultCountry: input.country,
    defaultCity: input.city,
    maxResults: input.maxResults ?? 5
  });

  const answer = buildGroundedCatalogAnswer({
    locale: input.locale,
    query,
    results
  });

  return {
    vision,
    coherence,
    query,
    results,
    answer,
    fallbackUsed: vision.fallbackUsed
  };
}
