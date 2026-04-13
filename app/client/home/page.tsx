'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { ProductCard } from '@/components/product-card';
import { getRegionalDemandAdjustedRating, rankSellersByRating } from '@/lib/mock-marketplace';
import { useSite } from '@/components/site-context';

export default function ClientHomePage() {
  const { sessionUser, country, city, products, sellers, reviews, testimonials, users, addPlatformComment, getFollowedSellerIds, t } = useSite();
  const [commentStatus, setCommentStatus] = useState('');
  const followedSellerIds = getFollowedSellerIds();

  const localProducts = useMemo(() => {
    return products
      .filter((product) => product.sellerCountry === country && product.sellerCity === city)
      .sort((a, b) => {
        const aFollowed = followedSellerIds.includes(a.sellerId) ? 1 : 0;
        const bFollowed = followedSellerIds.includes(b.sellerId) ? 1 : 0;
        return bFollowed - aFollowed;
      })
      .slice(0, 6)
      .map((product) => ({
        id: product.id,
        slug: product.slug,
        name: product.name,
        categorySlug: product.categorySlug,
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
        averageRating: getRegionalDemandAdjustedRating(product, users, country, city, 'city'),
        kind: product.kind,
        serviceDuration: product.serviceDuration,
        serviceAvailability: product.serviceAvailability
      }));
  }, [city, country, followedSellerIds, products, users]);

  const preferenceProducts = useMemo(() => {
    const preferred = sessionUser?.preferences ?? [];
    if (preferred.length === 0) return localProducts;
    return localProducts.filter((product) => preferred.includes(product.categorySlug)).slice(0, 6);
  }, [localProducts, sessionUser?.preferences]);

  const regionalTestimonials = useMemo(
    () => testimonials.filter((entry) => entry.country === country).slice(0, 3),
    [country, testimonials]
  );
  const regionalReviewComments = useMemo(() => reviews.slice(0, 3), [reviews]);

  const topSeller = useMemo(() => rankSellersByRating(reviews, country, city, sellers)[0], [city, country, reviews, sellers]);

  const onPlatformCommentSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = addPlatformComment({
      rating: Number(formData.get('rating')),
      comment: String(formData.get('comment'))
    });
    setCommentStatus(result.message);
    if (result.ok) event.currentTarget.reset();
  };

  if (!sessionUser || sessionUser.role !== 'client') {
    return (
      <section className="section py-12">
        <div className="card p-6">
          <h1 className="text-2xl font-bold">{t('Espace client', 'Client area')}</h1>
          <p className="mt-2 text-slate-600">{t('Connectez-vous avec un compte client pour voir votre page d’accueil personnalisée.', 'Please login with a client account to view your personalized homepage.')}</p>
          <Link href="/auth/login" className="mt-4 inline-block rounded-lg bg-dark px-4 py-2 text-white">{t('Aller à la connexion', 'Go to login')}</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section py-12">
      <div className="card bg-gradient-to-r from-brand-600 to-dark p-6 text-white">
        <p className="text-sm uppercase opacity-80">{t('Homepage personnalisée', 'Personalized homepage')}</p>
        <h1 className="mt-2 text-3xl font-bold">{t('Bienvenue', 'Welcome')} {sessionUser.name}</h1>
        <p className="mt-2 text-sm opacity-90">{t('Nous vous présentons les meilleurs produits pour', 'We are showing you the best products for')} {city}, {country}.</p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="card p-4"><p className="text-sm text-slate-500">{t('Ville active', 'Active city')}</p><p className="text-xl font-bold">{city}</p></div>
        <div className="card p-4"><p className="text-sm text-slate-500">{t('Pays actif', 'Active country')}</p><p className="text-xl font-bold">{country}</p></div>
        <div className="card p-4"><p className="text-sm text-slate-500">{t('Top vendeur local', 'Top local seller')}</p><p className="text-xl font-bold">{topSeller ? topSeller.company : '-'}</p></div>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold">{t('Produits recommandés selon vos préférences', 'Recommended products from your preferences')}</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{preferenceProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        <p className="mt-3 text-xs text-slate-500">
          {t(
            'Suggestion anonyme : des clients au profil proche du vôtre ont aussi acheté des produits Énergie et Sécurité cette semaine.',
            'Anonymous hint: customers with a similar profile also bought Energy and Security products this week.'
          )}
        </p>
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

      <div className="mt-10 rounded-xl border bg-white p-5">
        <h3 className="text-lg font-bold">{t('Témoignages clients de votre région', 'Testimonials from your region')}</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {(regionalTestimonials.length > 0
            ? regionalTestimonials.map((item) => ({
                id: item.id,
                title: `${item.name} - ${item.city}`,
                rating: item.rating,
                comment: item.comment
              }))
            : regionalReviewComments.map((item) => ({
                id: item.id,
                title: `${item.customerName} - ${country}`,
                rating: item.rating,
                comment: item.comment
              }))
          ).map((item) => (
            <article key={item.id} className="rounded-lg border p-3 text-sm">
              <p className="font-semibold">{item.title}</p>
              <p className="text-amber-600">{item.rating}/5</p>
              <p className="text-slate-600">{item.comment}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-10 rounded-xl border bg-white p-5">
        <h3 className="text-lg font-bold">{t('Donner votre avis sur Min-shop', 'Share your feedback about Min-shop')}</h3>
        <p className="mt-2 text-sm text-slate-600">
          {t(
            'Vous pouvez commenter la plateforme à tout moment. Les avis sur un vendeur restent réservés aux achats finalisés.',
            'You can comment on the platform at any time. Vendor reviews remain reserved for completed purchases.'
          )}
        </p>
        <form onSubmit={onPlatformCommentSubmit} className="mt-4 grid gap-3 md:grid-cols-2">
          <select name="rating" required className="rounded-lg border px-3 py-2">
            <option value="">{t('Votre note globale', 'Your overall rating')}</option>
            {[5, 4, 3, 2, 1].map((rate) => <option key={rate} value={rate}>{rate}/5</option>)}
          </select>
          <input name="comment" required placeholder={t('Votre commentaire sur la plateforme', 'Your platform comment')} className="rounded-lg border px-3 py-2" />
          <button className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white md:col-span-2">
            {t('Envoyer mon commentaire', 'Submit my comment')}
          </button>
          {commentStatus ? <p className="text-sm md:col-span-2">{commentStatus}</p> : null}
        </form>
      </div>
    </section>
  );
}
