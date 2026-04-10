'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ProductCard } from '@/components/product-card';
import { rankSellersByRating } from '@/lib/mock-marketplace';
import { useSite } from '@/components/site-context';

export default function ClientHomePage() {
  const { sessionUser, country, city, products, sellers, reviews, t } = useSite();

  const localProducts = useMemo(() => {
    return products
      .filter((product) => product.sellerCountry === country && product.sellerCity === city)
      .slice(0, 6)
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
  }, [city, country, products]);

  const topSeller = useMemo(() => rankSellersByRating(reviews, country, city)[0], [city, country, reviews]);

  if (!sessionUser || sessionUser.role !== 'client') {
    return (
      <section className="section py-12">
        <div className="card p-6">
          <h1 className="text-2xl font-bold">{t('Espace client', 'Client area')}</h1>
          <p className="mt-2 text-slate-600">{t('Connecte-toi avec un compte client pour voir ta homepage personnalisee.', 'Please login with a client account to view your personalized homepage.')}</p>
          <Link href="/auth/login" className="mt-4 inline-block rounded-lg bg-dark px-4 py-2 text-white">{t('Aller a la connexion', 'Go to login')}</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section py-12">
      <div className="card bg-gradient-to-r from-brand-600 to-dark p-6 text-white">
        <p className="text-sm uppercase opacity-80">{t('Homepage personnalisee', 'Personalized homepage')}</p>
        <h1 className="mt-2 text-3xl font-bold">{t('Bonjour', 'Hello')} {sessionUser.name}</h1>
        <p className="mt-2 text-sm opacity-90">{t('Nous te montrons les meilleurs produits pour', 'We are showing the best products for')} {city}, {country}.</p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="card p-4"><p className="text-sm text-slate-500">{t('Ville active', 'Active city')}</p><p className="text-xl font-bold">{city}</p></div>
        <div className="card p-4"><p className="text-sm text-slate-500">{t('Pays actif', 'Active country')}</p><p className="text-xl font-bold">{country}</p></div>
        <div className="card p-4"><p className="text-sm text-slate-500">{t('Top vendeur local', 'Top local seller')}</p><p className="text-xl font-bold">{topSeller ? topSeller.company : '-'}</p></div>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold">{t('Produits recommandes', 'Recommended products')}</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{localProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </div>

      <div className="mt-10 rounded-xl border bg-white p-5">
        <h3 className="text-lg font-bold">{t('Vendeurs proches', 'Nearby sellers')}</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {sellers.filter((seller) => seller.country === country).slice(0, 3).map((seller) => (
            <Link key={seller.id} href={`/seller/${seller.slug}`} className="rounded-lg border p-3 text-sm hover:bg-slate-50">
              <p className="font-semibold">{seller.company}</p>
              <p className="text-slate-600">{seller.city}, {seller.country}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
