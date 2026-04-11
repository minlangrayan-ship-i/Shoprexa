'use client';

import { useMemo, useState } from 'react';
import { ProductCard } from '@/components/product-card';
import { marketplaceCategories } from '@/lib/mock-marketplace';
import { useSite } from '@/components/site-context';

export default function ShopPage() {
  const { country, city, products, t } = useSite();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [offerType, setOfferType] = useState<'all' | 'product' | 'service'>('all');
  const [sort, setSort] = useState<'popular' | 'price_asc' | 'price_desc' | 'rating'>('popular');

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => product.sellerCountry === country && product.sellerCity === city);

    if (result.length === 0) {
      result = products.filter((product) => product.sellerCountry === country);
    }

    if (query.trim()) {
      const normalized = query.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(normalized) ||
          product.problemTag.toLowerCase().includes(normalized) ||
          product.companyName.toLowerCase().includes(normalized)
      );
    }

    if (category) result = result.filter((product) => product.categorySlug === category);
    if (offerType !== 'all') result = result.filter((product) => (product.kind ?? 'product') === offerType);

    if (sort === 'price_asc') result = [...result].sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') result = [...result].sort((a, b) => b.price - a.price);
    if (sort === 'popular') result = [...result].sort((a, b) => b.viewCount - a.viewCount);
    if (sort === 'rating') result = [...result].sort((a, b) => b.averageRating - a.averageRating);

    return result.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      price: product.price,
      oldPrice: product.oldPrice,
      stock: product.stock,
      images: product.images,
      category: { name: product.category },
      seller: {
        id: product.sellerId,
        companyName: product.companyName,
        country: product.sellerCountry,
        city: product.sellerCity
      },
        badges: product.badges,
        averageRating: product.averageRating,
        kind: product.kind,
        serviceDuration: product.serviceDuration,
        serviceAvailability: product.serviceAvailability
      }));
  }, [category, city, country, offerType, products, query, sort]);

  return (
    <section className="section py-10">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('Catalogue produits', 'Product catalog')}</h1>
          <p className="text-sm text-slate-600">{t('Affichage optimise pour', 'Optimized listing for')} {city}, {country}</p>
        </div>
      </div>

      <div className="card mt-6 grid gap-3 p-4 md:grid-cols-5">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('Rechercher un produit, vendeur ou besoin', 'Search product, seller, or use case')}
          className="rounded-lg border px-3 py-2"
        />

        <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-lg border px-3 py-2">
          <option value="">{t('Toutes categories', 'All categories')}</option>
          {marketplaceCategories.map((item) => (
            <option key={item.slug} value={item.slug}>{item.label}</option>
          ))}
        </select>

        <select value={sort} onChange={(event) => setSort(event.target.value as 'popular' | 'price_asc' | 'price_desc' | 'rating')} className="rounded-lg border px-3 py-2">
          <option value="popular">{t('Populaires', 'Most viewed')}</option>
          <option value="rating">{t('Mieux notes', 'Top rated')}</option>
          <option value="price_asc">{t('Prix croissant', 'Price low to high')}</option>
          <option value="price_desc">{t('Prix decroissant', 'Price high to low')}</option>
        </select>

        <select value={offerType} onChange={(event) => setOfferType(event.target.value as 'all' | 'product' | 'service')} className="rounded-lg border px-3 py-2">
          <option value="all">{t('Produits + Services', 'Products + Services')}</option>
          <option value="product">{t('Produits uniquement', 'Products only')}</option>
          <option value="service">{t('Services uniquement', 'Services only')}</option>
        </select>

        <div className="rounded-lg border border-dashed px-3 py-2 text-sm text-slate-600">{filteredProducts.length} {t('produits disponibles', 'products available')}</div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="card mt-8 p-6 text-sm text-slate-600">
          {t('Aucun produit pour cette zone. Essaie une autre ville via la navbar.', 'No products for this location yet. Try another city in the navbar.')}
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
