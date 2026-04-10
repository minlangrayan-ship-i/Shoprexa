import { marketplaceCategories, marketplaceProducts } from '@/lib/mock-marketplace';

export type DemoCategory = {
  id: string;
  name: string;
  slug: string;
};

export type DemoProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  featured: boolean;
  images: string[];
  category: DemoCategory;
  seller: {
    id: string;
    companyName: string;
    country: string;
    city: string;
  };
};

export const demoCategories: DemoCategory[] = marketplaceCategories.map((category, index) => ({
  id: `cat-${index + 1}`,
  name: category.label,
  slug: category.slug
}));

const categoryBySlug = Object.fromEntries(demoCategories.map((category) => [category.slug, category]));

export const demoProducts: DemoProduct[] = marketplaceProducts.map((product, index) => ({
  id: product.id,
  slug: product.slug,
  name: product.name,
  description: product.description,
  price: product.price,
  oldPrice: product.oldPrice,
  stock: product.stock,
  featured: index < 8,
  images: [product.image],
  category: categoryBySlug[product.categorySlug] ?? demoCategories[0],
  seller: {
    id: product.sellerId,
    companyName: product.companyName,
    country: product.sellerCountry,
    city: product.sellerCity
  }
}));
