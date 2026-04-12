import { marketplaceProducts } from '@/lib/mock-marketplace';
import { toProductLite } from '@/services/marketplace-data';
import { verifyProductConsistency } from '@/services/verification/product-consistency';
import type { Locale, ParsedUserQuery, RankedCatalogProduct } from '@/types/marketplace-ai';

function keywordScore(haystack: string, terms: string[]) {
  let score = 0;
  for (const term of terms) {
    if (haystack.includes(term)) score += 1;
  }
  return score;
}

export function rankCatalogProductsByQuery(params: {
  locale: Locale;
  query: ParsedUserQuery;
  defaultCountry: string;
  defaultCity: string;
  maxResults: number;
}): RankedCatalogProduct[] {
  const liteProducts = toProductLite();
  const maxResults = Math.max(1, Math.min(10, params.maxResults));

  const ranked = liteProducts.map((product) => {
    const full = marketplaceProducts.find((entry) => entry.id === product.id);
    const verification = verifyProductConsistency(
      {
        name: full?.name ?? product.name,
        categorySlug: full?.categorySlug ?? product.categorySlug,
        description: full?.description ?? '',
        imageUrls: full?.images ?? [product.image]
      },
      params.locale
    );

    let matchScore = 0;
    const reasons: string[] = [];
    const countryTarget = params.query.country ?? params.defaultCountry;
    const cityTarget = params.query.city ?? params.defaultCity;

    if (product.country === countryTarget) {
      matchScore += 4;
      reasons.push(`country:${countryTarget}`);
    }
    if (product.city === cityTarget) {
      matchScore += 3;
      reasons.push(`city:${cityTarget}`);
    }
    if (params.query.categorySlug && product.categorySlug === params.query.categorySlug) {
      matchScore += 5;
      reasons.push(`category:${params.query.categorySlug}`);
    }
    if (params.query.budgetMax !== null && product.price <= params.query.budgetMax) {
      matchScore += 4;
      reasons.push(`budget<=${params.query.budgetMax}`);
    }
    if (params.query.budgetMax !== null && product.price > params.query.budgetMax) {
      matchScore -= 2;
    }

    const searchableText = `${product.name} ${product.category} ${product.companyName} ${full?.description ?? ''} ${full?.problemTag ?? ''}`.toLowerCase();
    const hits = keywordScore(searchableText, params.query.needs);
    if (hits > 0) {
      matchScore += hits * 1.5;
      reasons.push(`needs_hits:${hits}`);
    }

    if (product.stock > 0) {
      matchScore += 1;
      reasons.push('in_stock');
    } else {
      matchScore -= 2;
    }

    const coherenceScore = verification.score;
    const finalScore = Number((matchScore * 10 + coherenceScore).toFixed(1));

    return {
      product,
      matchScore: Number(matchScore.toFixed(1)),
      coherenceScore,
      finalScore,
      reasons
    };
  });

  return ranked
    .sort((a, b) => b.finalScore - a.finalScore || b.coherenceScore - a.coherenceScore)
    .slice(0, maxResults);
}
