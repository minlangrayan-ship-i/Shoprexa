'use client';

import { useMemo, useState } from 'react';
import { ProductCard } from '@/components/product-card';
import { marketplaceCategories, marketplaceProducts } from '@/lib/mock-marketplace';
import { useSite } from '@/components/site-context';

export default function ShopPage() {
  const { country, city, t } = useSite();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState<'popular' | 'price_asc' | 'price_desc'>('popular');

  const filteredProducts = useMemo(() => {
    let result = marketplaceProducts.filter((product) => product.sellerCountry === country && product.sellerCity === city);

    if (query.trim()) {
      const normalized = query.toLowerCase();
      result = result.filter((product) => product.name.toLowerCase().includes(normalized) || product.problemTag.toLowerCase().includes(normalized));
    }

    if (category) result = result.filter((product) => product.categorySlug === category);

    if (sort === 'price_asc') result = [...result].sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') result = [...result].sort((a, b) => b.price - a.price);
    if (sort === 'popular') result = [...result].sort((a, b) => b.stock - a.stock);

    return result.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice,
      stock: product.stock,
      images: [product.image],
      category: { name: product.category },
      seller: {
        id: product.sellerId,
        companyName: product.companyName,
        country: product.sellerCountry,
        city: product.sellerCity
      }
    }));
  }, [category, city, country, query, sort]);

  return (
    <section className="section py-10">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('Boutique Min-shop', 'Min-shop Marketplace')}</h1>
          <p className="text-sm text-slate-600">
            {t('Produits recommandes pour', 'Products recommended for')} {city}, {country}
          </p>
        </div>
      </div>

      <div className="card mt-6 grid gap-3 p-4 md:grid-cols-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('Rechercher un produit ou un besoin', 'Search products or use cases')}
          className="rounded-lg border px-3 py-2"
        />

        <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-lg border px-3 py-2">
          <option value="">{t('Toutes categories', 'All categories')}</option>
          {marketplaceCategories.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.label}
            </option>
          ))}
        </select>

        <select value={sort} onChange={(event) => setSort(event.target.value as 'popular' | 'price_asc' | 'price_desc')} className="rounded-lg border px-3 py-2">
          <option value="popular">{t('Populaires', 'Most popular')}</option>
          <option value="price_asc">{t('Prix croissant', 'Price low to high')}</option>
          <option value="price_desc">{t('Prix decroissant', 'Price high to low')}</option>
        </select>

        <div className="rounded-lg border border-dashed px-3 py-2 text-sm text-slate-600">{filteredProducts.length} {t('produits trouves', 'products found')}</div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="card mt-8 p-6 text-sm text-slate-600">
          {t(
            'Aucun produit pour cette zone. Essaie une autre ville dans la barre du haut.',
            'No product for this location yet. Try another city using the top selector.'
          )}
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
