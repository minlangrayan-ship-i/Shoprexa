'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ProductCard } from '@/components/product-card';
import { WhatsAppFloat } from '@/components/whatsapp-float';
import { rankSellersByRating } from '@/lib/mock-marketplace';
import { useSite } from '@/components/site-context';

export default function HomePage() {
  const { country, city, products, reviews, t } = useSite();

  const featuredProducts = useMemo(() => {
    return products
      .filter((product) => product.sellerCountry === country)
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 8)
      .map((product) => ({
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
        averageRating: product.averageRating
      }));
  }, [country, products]);

  const topSellers = useMemo(() => rankSellersByRating(reviews, country).slice(0, 3), [country, reviews]);

  return (
    <>
      <section className="section py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">{t('Marketplace africaine premium', 'Premium African marketplace')}</p>
            <h1 className="text-4xl font-black leading-tight md:text-5xl">{t('Les meilleurs produits du quotidien, prets a convertir.', 'High-converting products for everyday life in Africa.')}</h1>
            <p className="mt-5 text-slate-600">{t('Catalogue visuel optimise pour', 'Visual-first catalog optimized for')} {city}, {country}. {t('Images nettes, vendeurs verifies, parcours rapide.', 'Sharp images, verified sellers, frictionless checkout flow.')}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white">{t('Voir le catalogue', 'Browse catalog')}</Link>
              <Link href="/auth/register" className="rounded-xl border px-5 py-3 font-semibold">{t('Creer un compte', 'Create account')}</Link>
            </div>
          </div>

          <div className="rounded-2xl border bg-gradient-to-br from-brand-600 to-dark p-8 text-white shadow-xl">
            <h3 className="text-2xl font-bold">{t('Pourquoi Min-shop ?', 'Why Min-shop?')}</h3>
            <ul className="mt-5 list-disc space-y-2 pl-5 text-sm marker:text-white">
              <li>{t('Produits adaptes aux realites africaines', 'Products tailored to African realities')}</li>
              <li>{t('Vendeurs verifies et notes visibles', 'Verified vendors with visible ratings')}</li>
              <li>{t('UX mobile-first orientee conversion', 'Mobile-first conversion-focused UX')}</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section py-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t('Produits populaires', 'Popular products')}</h2>
          <Link href="/shop" className="text-sm font-semibold text-brand-700">{t('Tout voir', 'View all')}</Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="section py-10">
        <h2 className="text-2xl font-bold">{t('Vendeurs mis en avant', 'Featured sellers')}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {topSellers.map((seller) => (
            <Link key={seller.id} href={`/seller/${seller.slug}`} className="rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-1">
              <p className="text-xs font-semibold text-emerald-700">{seller.verified ? t('Vendeur verifie', 'Verified seller') : t('Nouveau vendeur', 'New seller')}</p>
              <h3 className="mt-1 text-lg font-bold">{seller.company}</h3>
              <p className="text-sm text-slate-600">{seller.city}, {seller.country}</p>
              <p className="mt-2 text-sm">{t('Note', 'Rating')}: {seller.averageRating}/5</p>
            </Link>
          ))}
        </div>
      </section>

      <WhatsAppFloat />
    </>
  );
}
