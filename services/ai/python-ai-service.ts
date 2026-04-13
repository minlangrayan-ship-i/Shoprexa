import { env } from '@/lib/env';
import { marketplaceProducts } from '@/lib/mock-marketplace';
import type { AssistantIntent, Locale, ProductLite } from '@/types/marketplace-ai';

type PythonAiIntentLabel =
  | 'product_search'
  | 'product_question'
  | 'delivery_question'
  | 'greeting'
  | 'unknown';

type PythonAiSearchProduct = {
  id: string;
  title: string;
  category: string;
  price: number;
  region: string;
  availability: number;
  trust_score: number;
  trust_status: 'valid' | 'needs_review' | 'suspect';
  semantic_score: number;
  business_score: number;
  final_score: number;
  justification: string;
};

type PythonAiSearchResponse = {
  intent: {
    label: PythonAiIntentLabel;
    confidence: number;
  };
  products: PythonAiSearchProduct[];
  message: string;
  total_found: number;
};

export type PythonAiCatalogResult = {
  intent: PythonAiIntentLabel;
  answer: string;
  suggestions: ProductLite[];
};

function mapSearchIntent(label: PythonAiIntentLabel): AssistantIntent {
  if (label === 'delivery_question') return 'faq_delivery';
  if (label === 'product_search' || label === 'product_question') return 'product_search';
  return 'general_help';
}

function buildPythonCatalog() {
  return marketplaceProducts.map((product) => ({
    id: product.id,
    title: product.name,
    description: product.description,
    category: product.categorySlug,
    price: product.price,
    region: product.sellerCity,
    availability: product.stock,
    popularity: Math.min(product.viewCount / 700, 1),
    trust_score: Math.round(product.averageRating * 20),
    trust_status: (product.averageRating >= 4.4
      ? 'valid'
      : product.averageRating >= 3.8
        ? 'needs_review'
        : 'suspect') as 'valid' | 'needs_review' | 'suspect',
    tags: [
      product.category,
      product.problemTag,
      product.companyName,
      product.sellerCountry,
      product.sellerCity
    ]
  }));
}

function toSuggestion(productId: string): ProductLite | null {
  const product = marketplaceProducts.find((entry) => entry.id === productId);
  if (!product) return null;

  return {
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
    kind: product.kind ?? 'product'
  };
}

export async function searchProductsViaPythonAi(params: {
  query: string;
  locale: Locale;
  topK?: number;
}): Promise<PythonAiCatalogResult | null> {
  try {
    const response = await fetch(`${env.MINSHOP_AI_SERVICE_URL}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: params.query,
        top_k: params.topK ?? 4,
        products: buildPythonCatalog()
      }),
      cache: 'no-store'
    });

    if (!response.ok) return null;
    const payload = (await response.json()) as PythonAiSearchResponse;

    const suggestions = payload.products
      .map((product) => toSuggestion(product.id))
      .filter((product): product is ProductLite => Boolean(product));

    return {
      intent: payload.intent.label,
      answer: payload.message,
      suggestions
    };
  } catch {
    return null;
  }
}

export { mapSearchIntent };
