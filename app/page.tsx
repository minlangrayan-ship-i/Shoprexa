'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ProductCard } from '@/components/product-card';
import { WhatsAppFloat } from '@/components/whatsapp-float';
import { marketplaceCategories, marketplaceProducts, rankSellersByRating } from '@/lib/mock-marketplace';
import { useSite } from '@/components/site-context';

export default function HomePage() {
  const { country, city, reviews, t } = useSite();

  const featuredProducts = useMemo(() => {
    return marketplaceProducts
      .filter((product) => product.sellerCountry === country)
      .slice(0, 4)
      .map((product) => ({
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
  }, [country]);

  const topSellers = useMemo(() => rankSellersByRating(reviews, country).slice(0, 3), [country, reviews]);

  return (
    <>
      <section className="section py-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
              {t('Marketplace africaine de confiance', 'Trusted African marketplace')}
            </p>
            <h1 className="text-4xl font-black leading-tight md:text-5xl">
              {t('Acheter mieux. Vendre plus vite. Grandir en Afrique.', 'Buy smarter. Sell faster. Scale in Africa.')}
            </h1>
            <p className="mt-5 text-slate-600">
              {t('Produits utiles pour', 'Useful products for')} {city}, {country}. {t('Experience mobile-first orientee conversion.', 'Mobile-first experience built for conversion.')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white">
                {t('Decouvrir la boutique', 'Explore shop')}
              </Link>
              <Link href="/sellers" className="rounded-xl border px-5 py-3 font-semibold">
                {t('Voir les vendeurs', 'View vendors')}
              </Link>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-brand-600 to-dark p-8 text-white">
            <h3 className="text-2xl font-bold">{t('Pourquoi Min-shop ?', 'Why Min-shop?')}</h3>
            <ul className="mt-5 list-disc space-y-3 pl-5 text-sm text-slate-100 marker:text-white">
              <li>{t('Produits adaptes aux realites africaines', 'Products designed for African realities')}</li>
              <li>{t('Vendeurs verifies et notes visibles', 'Verified sellers with visible ratings')}</li>
              <li>{t('Support WhatsApp direct', 'Direct WhatsApp support')}</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section py-10">
        <h2 className="text-2xl font-bold">{t('Categories tendances', 'Trending categories')}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {marketplaceCategories.map((category) => (
            <Link key={category.slug} href={`/shop`} className="card p-4 font-semibold hover:border-brand-500">
              {category.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="section py-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t('Produits populaires', 'Popular products')}</h2>
          <Link href="/shop" className="text-sm font-semibold text-brand-700">
            {t('Voir tout', 'See all')}
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="section py-10">
        <h2 className="text-2xl font-bold">{t('Top vendeurs', 'Top vendors')}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {topSellers.map((seller) => (
            <div key={seller.id} className="card p-5">
              <p className="text-xs font-semibold text-emerald-700">{t('Vendeur verifie', 'Verified vendor')}</p>
              <h3 className="mt-1 text-lg font-bold">{seller.company}</h3>
              <p className="text-sm text-slate-600">{seller.city}, {seller.country}</p>
              <p className="mt-2 text-sm">{t('Note moyenne', 'Average rating')}: {seller.averageRating}/5</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section grid gap-5 py-10 md:grid-cols-3">
        {[t('Choisissez un produit', 'Choose a product'), t('Commandez en 2 minutes', 'Order in 2 minutes'), t('Recevez rapidement', 'Get fast delivery')].map((step, index) => (
          <div key={step} className="card p-6">
            <p className="text-xs font-semibold text-brand-600">{t('Etape', 'Step')} {index + 1}</p>
            <h3 className="mt-2 text-lg font-bold">{step}</h3>
          </div>
        ))}
      </section>

      <WhatsAppFloat />
    </>
  );
}
