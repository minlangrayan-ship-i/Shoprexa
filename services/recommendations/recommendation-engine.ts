import { complementaryCategoryMap } from '@/db/mock-ai-data';
import { marketplaceProducts } from '@/lib/mock-marketplace';
import type { RecommendationBlock, RecommendationRequest, RecommendationResponse } from '@/types/marketplace-ai';

function mapLite() {
  return marketplaceProducts.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    category: product.category,
    categorySlug: product.categorySlug,
    city: product.sellerCity,
    country: product.sellerCountry,
    companyName: product.companyName,
    stock: product.stock,
    image: product.images[0],
    averageRating: product.averageRating,
    kind: product.kind ?? 'product',
    viewCount: product.viewCount,
    badges: product.badges
  }));
}

function scoreProduct(
  product: ReturnType<typeof mapLite>[number],
  context: RecommendationRequest,
  targetCategory?: string
) {
  let score = 0;
  if (context.country && product.country === context.country) score += 3;
  if (context.city && product.city === context.city) score += 2;
  if (context.budget && product.price <= context.budget) score += 2;
  if (targetCategory && product.categorySlug === targetCategory) score += 3;
  if (product.badges.includes('popular')) score += 2;
  score += product.averageRating;
  score += Math.min(2, product.viewCount / 250);
  return score;
}

export function buildRecommendations(input: RecommendationRequest, locale: 'fr' | 'en'): RecommendationResponse {
  const products = mapLite();
  const anchor = input.productId ? products.find((product) => product.id === input.productId) : undefined;
  const anchorCategory = input.viewedCategorySlug ?? anchor?.categorySlug;

  const similar = products
    .filter((product) => product.id !== input.productId)
    .map((product) => ({ product, score: scoreProduct(product, input, anchorCategory) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((entry) => entry.product);

  const complementaryCategories = anchorCategory ? complementaryCategoryMap[anchorCategory] ?? [] : [];
  const complementary = products
    .filter((product) => complementaryCategories.includes(product.categorySlug))
    .map((product) => ({ product, score: scoreProduct(product, input) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((entry) => entry.product);

  const popular = products
    .map((product) => ({ product, score: product.viewCount + product.averageRating * 40 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((entry) => entry.product);

  const regional = products
    .filter((product) => product.country === input.country)
    .map((product) => ({ product, score: scoreProduct(product, input) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((entry) => entry.product);

  const blocks: RecommendationBlock[] = [
    {
      key: 'similar',
      title: locale === 'fr' ? 'Produits similaires' : 'Similar products',
      items: similar
    },
    {
      key: 'popular',
      title: locale === 'fr' ? 'Les plus populaires' : 'Most popular',
      items: popular
    },
    {
      key: 'complementary',
      title: locale === 'fr' ? 'Souvent achetés ensemble' : 'Often bought together',
      items: complementary
    },
    {
      key: 'regional',
      title: locale === 'fr' ? 'Populaires dans votre region' : 'Popular in your region',
      items: regional
    }
  ];

  return { blocks };
}
