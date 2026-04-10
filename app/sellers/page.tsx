'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { getSellerDashboardData, getSellerProducts, rankSellersByRating } from '@/lib/mock-marketplace';
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
  const { country, city, sessionUser, sellers, products, orders, reviews, addReview, t } = useSite();
  const [selectedSellerId, setSelectedSellerId] = useState<string>('');
  const [reviewStatus, setReviewStatus] = useState('');

  const rankedSellers = useMemo(() => rankSellersByRating(reviews, country, city), [city, country, reviews]);

  const selectedSeller = useMemo(
    () => sellers.find((seller) => seller.id === selectedSellerId) ?? rankedSellers[0] ?? sellers[0],
    [rankedSellers, selectedSellerId, sellers]
  );

  const dashboard = selectedSeller
    ? getSellerDashboardData(selectedSeller.id, products, reviews, orders)
    : null;

  const onReviewSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const sellerId = String(formData.get('sellerId'));
    const customerName = String(formData.get('customerName'));
    const rating = Number(formData.get('rating'));
    const comment = String(formData.get('comment'));

    if (!sellerId || !customerName || !rating || !comment) {
      setReviewStatus(t('Tous les champs sont requis.', 'All fields are required.'));
      return;
    }

    addReview({ sellerId, customerName, rating, comment });
    setReviewStatus(t('Avis enregistre. Merci !', 'Review submitted. Thank you!'));
    event.currentTarget.reset();
  };

  return (
    <section className="section py-12">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('Vendeurs verifies', 'Verified vendors')}</h1>
          <p className="text-slate-600">{t('Classement local pour', 'Local ranking for')} {city}, {country}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {rankedSellers.map((seller) => {
          const sellerReviewCount = reviews.filter((review) => review.sellerId === seller.id).length;
          const sellerProducts = getSellerProducts(products, seller.id);

          return (
            <article key={seller.id} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">{seller.company}</h2>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">{seller.verified ? t('Verifie', 'Verified') : t('Nouveau', 'New')}</span>
              </div>

              <p className="mt-2 text-sm text-slate-600">{seller.name}</p>
              <p className="text-xs text-slate-500">{seller.city}, {seller.country}</p>
              <p className="text-xs font-semibold text-slate-500">Type: {seller.sellerType}</p>
              <p className="mt-1 text-xs text-slate-500">{seller.about}</p>

              <div className="mt-3">
                <Stars value={seller.averageRating} />
                <p className="text-xs text-slate-500">{sellerReviewCount} {t('avis clients', 'customer reviews')}</p>
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

      {dashboard && selectedSeller ? (
        <section className="mt-10 rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-bold">{t('Apercu vendeur', 'Seller overview')} - {selectedSeller.company}</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Produits</p><p className="text-xl font-bold">{dashboard.products.length}</p></div>
            <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Stock total</p><p className="text-xl font-bold">{dashboard.totalStock}</p></div>
            <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Commandes</p><p className="text-xl font-bold">{dashboard.orders.length}</p></div>
            <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">CA simule</p><p className="text-xl font-bold">{formatPrice(dashboard.revenue)}</p></div>
          </div>
        </section>
      ) : null}

      <section className="mt-10 rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="text-xl font-bold">{t('Noter un vendeur', 'Rate a vendor')}</h3>
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

          <button className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white md:col-span-2">{t('Envoyer mon avis', 'Submit review')}</button>
          {reviewStatus ? <p className="text-sm md:col-span-2">{reviewStatus}</p> : null}
        </form>
      </section>
    </section>
  );
}
