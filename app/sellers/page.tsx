'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  getSellerDashboardData,
  getSellerProducts,
  getSellerTrustStats,
  marketplaceCategories,
  rankSellersByRating
} from '@/lib/mock-marketplace';
import { formatPrice } from '@/lib/utils';
import { useSite } from '@/components/site-context';

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1 text-amber-500">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index}>{index < Math.round(value) ? '*' : 'o'}</span>
      ))}
      <span className="ml-1 text-xs text-slate-600">{value.toFixed(1)}/5</span>
    </div>
  );
}

export default function SellersPage() {
  const { country, city, sessionUser, sellers, products, orders, reviews, complaints, addReview, t } = useSite();
  const [selectedSellerId, setSelectedSellerId] = useState<string>('');
  const [reviewStatus, setReviewStatus] = useState('');
  const [sellerType, setSellerType] = useState<'all' | 'min_shop' | 'dropshipper' | 'company'>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [niche, setNiche] = useState('');
  const [zone, setZone] = useState<'city' | 'country' | 'all'>('country');
  const dashboardRef = useRef<HTMLElement | null>(null);

  const resetFilters = () => {
    setZone('country');
    setSellerType('all');
    setNiche('');
    setVerifiedOnly(false);
  };

  const rankedSellers = useMemo(() => {
    const base = zone === 'city'
      ? rankSellersByRating(reviews, country, city, sellers)
      : zone === 'country'
        ? rankSellersByRating(reviews, country, undefined, sellers)
        : rankSellersByRating(reviews, undefined, undefined, sellers);

    return base.filter((seller) => {
      if (sellerType !== 'all' && seller.sellerType !== sellerType) return false;
      if (verifiedOnly && !seller.verified) return false;
      if (niche) {
        const sellerProducts = getSellerProducts(products, seller.id);
        if (!sellerProducts.some((product) => product.categorySlug === niche)) return false;
      }
      return true;
    });
  }, [city, country, niche, products, reviews, sellerType, sellers, verifiedOnly, zone]);

  const selectedSeller = useMemo(
    () => sellers.find((seller) => seller.id === selectedSellerId) ?? rankedSellers[0] ?? sellers[0],
    [rankedSellers, selectedSellerId, sellers]
  );

  const dashboard = selectedSeller
    ? getSellerDashboardData(selectedSeller.id, products, reviews, orders)
    : null;
  const canViewSensitiveSellerMetrics =
    sessionUser?.role === 'admin' ||
    (sessionUser?.role === 'seller' && sessionUser.sellerId === selectedSeller?.id);

  useEffect(() => {
    if (!selectedSellerId || !dashboardRef.current) return;
    dashboardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selectedSellerId]);

  const onReviewSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!sessionUser || sessionUser.role !== 'client') {
      setReviewStatus(t('Connecte-toi avec un compte client pour laisser un avis.', 'Please login with a client account to leave a review.'));
      return;
    }

    const formData = new FormData(event.currentTarget);
    const sellerId = String(formData.get('sellerId'));
    const customerName = String(formData.get('customerName'));
    const rating = Number(formData.get('rating'));
    const comment = String(formData.get('comment'));

    if (!sellerId || !customerName || !rating || !comment) {
      setReviewStatus(t('Tous les champs sont requis.', 'All fields are required.'));
      return;
    }

    const result = addReview({ sellerId, customerName, rating, comment });
    setReviewStatus(result.message);
    if (!result.ok) return;
    event.currentTarget.reset();
  };

  return (
    <section className="section py-12">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('Vendeurs vérifiés', 'Verified vendors')}</h1>
          <p className="text-slate-600">{t('Classement local pour', 'Local ranking for')} {city}, {country}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
          <select value={zone} onChange={(event) => setZone(event.target.value as 'city' | 'country' | 'all')} className="rounded-lg border px-2 py-1 text-xs">
            <option value="city">{t('Ma ville', 'My city')}</option>
            <option value="country">{t('Mon pays', 'My country')}</option>
            <option value="all">{t('Tous pays', 'All countries')}</option>
          </select>
          <select value={sellerType} onChange={(event) => setSellerType(event.target.value as 'all' | 'min_shop' | 'dropshipper' | 'company')} className="rounded-lg border px-2 py-1 text-xs">
            <option value="all">{t('Tous types', 'All types')}</option>
            <option value="min_shop">Vendeur Min-shop</option>
            <option value="dropshipper">Dropshipper</option>
            <option value="company">{t('Entreprise', 'Company')}</option>
          </select>
          <select value={niche} onChange={(event) => setNiche(event.target.value)} className="rounded-lg border px-2 py-1 text-xs">
            <option value="">{t('Toutes niches', 'All niches')}</option>
            {marketplaceCategories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.label}
              </option>
            ))}
          </select>
          <label className="inline-flex items-center gap-2 rounded-lg border px-2 py-1 text-xs">
            <input type="checkbox" checked={verifiedOnly} onChange={(event) => setVerifiedOnly(event.target.checked)} />
            {t('Vérifiés uniquement', 'Verified only')}
          </label>
        </div>
        <button onClick={resetFilters} className="rounded-lg border px-3 py-1 text-xs font-semibold">
          {t('Réinitialiser les filtres', 'Reset filters')}
        </button>
      </div>

      <p className="mt-3 text-xs text-slate-500">{rankedSellers.length} {t('vendeurs trouvés', 'sellers found')}</p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {rankedSellers.map((seller) => {
          const sellerReviewCount = reviews.filter((review) => review.sellerId === seller.id).length;
          const sellerProducts = getSellerProducts(products, seller.id);
          const trust = getSellerTrustStats(seller, products, reviews, orders, complaints);

          return (
            <article key={seller.id} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">{seller.company}</h2>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                  {trust.hasBadge
                    ? trust.badgeSource === 'admin'
                      ? t('Vérifié Min-shop (provisoire)', 'Min-shop Verified (provisional)')
                      : t('Vérifié Min-shop', 'Min-shop Verified')
                    : t('Sans badge', 'No badge')}
                </span>
              </div>
              {trust.hasBadge ? (
                <p className="mt-2 text-xs font-semibold text-emerald-700">{t('Badge Vérifié Min-shop visible dans le classement', 'Min-shop Verified badge visible in ranking')}</p>
              ) : null}

              <p className="mt-2 text-sm text-slate-600">{seller.name}</p>
              <p className="text-xs text-slate-500">{seller.city}, {seller.country}</p>
              <p className="text-xs font-semibold text-slate-500">Type: {seller.sellerType}</p>
              <p className="mt-1 text-xs text-slate-500">{seller.about}</p>
              <p className="mt-1 text-xs text-slate-500">
                {trust.satisfiedClients > 0
                  ? `+${trust.satisfiedClients} ${t('clients satisfaits', 'satisfied clients')}`
                  : t('Données de satisfaction en cours', 'Satisfaction data in progress')}
              </p>

              <div className="mt-3">
                <Stars value={seller.averageRating} />
                <p className="text-xs text-slate-500">{sellerReviewCount} {t('avis clients', 'customer reviews')}</p>
                <p className="text-xs text-slate-500">{t('Satisfaction', 'Satisfaction')}: {trust.satisfactionRate}%</p>
              </div>

              <div className="mt-3 space-y-1 text-xs text-slate-600">
                {sellerProducts.slice(0, 3).map((product) => (
                  <p key={product.id}>{product.name} - {formatPrice(product.price)}</p>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <button onClick={() => setSelectedSellerId(seller.id)} className="flex-1 rounded-lg bg-dark px-3 py-2 text-xs font-semibold text-white">
                  {t('Dashboard', 'Dashboard')}
                </button>
                <Link href={`/seller/${seller.slug}`} className="rounded-lg border px-3 py-2 text-xs font-semibold">
                  {t('Boutique', 'Store')}
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {rankedSellers.length === 0 ? (
        <div className="mt-6 rounded-xl border bg-white p-4 text-sm text-slate-600">
          {t('Aucun vendeur pour ces filtres. Réinitialise les filtres.', 'No sellers for these filters. Reset filters.')}
        </div>
      ) : null}

      {dashboard && selectedSeller ? (
        <section ref={dashboardRef} className="mt-10 rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-bold">{t('Aperçu vendeur', 'Seller overview')} - {selectedSeller.company}</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Produits</p><p className="text-xl font-bold">{dashboard.products.length}</p></div>
            <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Stock total</p><p className="text-xl font-bold">{dashboard.totalStock}</p></div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Commandes</p>
              <p className="text-xl font-bold">{canViewSensitiveSellerMetrics ? dashboard.orders.length : t('Privé', 'Private')}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">CA simulé</p>
              <p className="text-xl font-bold">{canViewSensitiveSellerMetrics ? formatPrice(dashboard.revenue) : t('Privé', 'Private')}</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mt-10 rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="text-xl font-bold">{t('Noter un vendeur', 'Rate a vendor')}</h3>
        {!sessionUser || sessionUser.role !== 'client' ? (
          <p className="mt-2 text-sm text-slate-600">
            {t('Seuls les clients inscrits et connectés peuvent noter un vendeur.', 'Only registered, logged-in clients can rate a seller.')}
          </p>
        ) : null}
        <form onSubmit={onReviewSubmit} className="mt-4 grid gap-3 md:grid-cols-2">
          <select name="sellerId" required className="rounded-lg border px-3 py-2">
            <option value="">{t('Choisir un vendeur', 'Choose a vendor')}</option>
            {sellers.map((seller) => (
              <option key={seller.id} value={seller.id}>{seller.company}</option>
            ))}
          </select>

          <input name="customerName" required defaultValue={sessionUser?.name ?? ''} placeholder={t('Votre nom', 'Your name')} className="rounded-lg border px-3 py-2" />

          <select name="rating" required className="rounded-lg border px-3 py-2">
            <option value="">{t('Votre note', 'Your rating')}</option>
            {[5, 4, 3, 2, 1].map((rate) => <option key={rate} value={rate}>{rate}/5</option>)}
          </select>

          <input name="comment" required placeholder={t('Votre commentaire', 'Your comment')} className="rounded-lg border px-3 py-2" />

          <button disabled={!sessionUser || sessionUser.role !== 'client'} className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 md:col-span-2">{t('Envoyer mon avis', 'Submit review')}</button>
          {reviewStatus ? <p className="text-sm md:col-span-2">{reviewStatus}</p> : null}
        </form>
      </section>
    </section>
  );
}
