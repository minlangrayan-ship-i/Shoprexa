import { marketplaceProducts } from '@/lib/mock-marketplace';
import type { ProductLite } from '@/types/marketplace-ai';

export function toProductLite(): ProductLite[] {
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
    kind: product.kind ?? 'product'
  }));
}
