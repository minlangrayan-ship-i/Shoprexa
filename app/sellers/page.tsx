'use client';

import { FormEvent, useMemo, useState } from 'react';
import {
  getSellerDashboardData,
  getSellerProducts,
  rankSellersByRating,
  sellerProfiles,
  type MarketplaceSeller
} from '@/lib/mock-marketplace';
import { formatPrice } from '@/lib/utils';
import { useSite } from '@/components/site-context';

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1 text-amber-500">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index}>{index < Math.round(value) ? '?' : '?'}</span>
      ))}
      <span className="ml-1 text-xs text-slate-600">{value.toFixed(1)}/5</span>
    </div>
  );
}

function SellerProducts({ seller }: { seller: MarketplaceSeller }) {
  const products = getSellerProducts(seller.id);
  return (
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      {products.map((product) => (
        <div key={product.id} className="rounded-xl border p-3 text-sm">
          <p className="font-semibold">{product.name}</p>
          <p className="text-slate-600">{formatPrice(product.price)} - Stock: {product.stock}</p>
          <p className="text-xs text-slate-500">{product.problemTag}</p>
        </div>
      ))}
    </div>
  );
}

export default function SellersPage() {
  const { country, city, sessionUser, reviews, addReview, t } = useSite();
  const [selectedSellerId, setSelectedSellerId] = useState<string>('seller-1');
  const [reviewStatus, setReviewStatus] = useState('');

  const rankedSellers = useMemo(() => rankSellersByRating(reviews, country, city), [city, country, reviews]);
  const selectedSeller = useMemo(
    () => sellerProfiles.find((seller) => seller.id === selectedSellerId) ?? rankedSellers[0],
    [rankedSellers, selectedSellerId]
  );

  const dashboard = selectedSeller ? getSellerDashboardData(selectedSeller.id, reviews) : null;

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
          <p className="text-slate-600">
            {t('Classement local pour', 'Local ranking for')} {city}, {country}
          </p>
        </div>
        <p className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">{t('UX orientee confiance', 'Trust-first UX')}</p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {rankedSellers.map((seller) => {
          const sellerReviewCount = reviews.filter((review) => review.sellerId === seller.id).length;
          return (
            <article key={seller.id} className="card p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">{seller.name}</h2>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">{t('Vendeur verifie', 'Verified vendor')}</span>
              </div>

              <p className="mt-2 text-sm text-slate-600">{seller.company}</p>
              <p className="text-xs text-slate-500">{seller.city}, {seller.country}</p>
              {sessionUser?.role === 'admin' ? (
                <>
                  <p className="mt-1 text-xs text-slate-500">Email: {seller.email}</p>
                  <p className="text-xs text-slate-500">{t('Mot de passe test', 'Test password')}: {seller.password}</p>
                </>
              ) : (
                <p className="mt-1 text-xs text-slate-500">{t('Coordonnees privees (admin uniquement)', 'Private details (admin only)')}</p>
              )}

              <div className="mt-3">
                <Stars value={seller.averageRating} />
                <p className="text-xs text-slate-500">{sellerReviewCount} {t('avis clients', 'customer reviews')}</p>
              </div>

              <SellerProducts seller={seller} />

              <button onClick={() => setSelectedSellerId(seller.id)} className="mt-4 w-full rounded-lg bg-dark px-4 py-2 text-sm font-semibold text-white">
                {t('Ouvrir dashboard vendeur', 'Open seller dashboard')}
              </button>
            </article>
          );
        })}
      </div>

      {dashboard && selectedSeller && (
        <section className="card mt-10 p-6">
          <h3 className="text-2xl font-bold">{t('Dashboard vendeur', 'Seller dashboard')} - {selectedSeller.company}</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">{t('Produits actifs', 'Active products')}</p>
              <p className="text-xl font-bold">{dashboard.products.length}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">{t('Stock total', 'Total stock')}</p>
              <p className="text-xl font-bold">{dashboard.totalStock}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">{t('Ventes simulees', 'Simulated sales')}</p>
              <p className="text-xl font-bold">{dashboard.simulatedSales}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">{t('CA simule', 'Simulated revenue')}</p>
              <p className="text-xl font-bold">{formatPrice(dashboard.revenue)}</p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="py-2">{t('Produit', 'Product')}</th>
                  <th className="py-2">{t('Stock', 'Stock')}</th>
                  <th className="py-2">{t('Prix', 'Price')}</th>
                  <th className="py-2">{t('Usage local', 'Local use case')}</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.products.map((product) => (
                  <tr key={product.id} className="border-b">
                    <td className="py-2">{product.name}</td>
                    <td className="py-2">{product.stock}</td>
                    <td className="py-2">{formatPrice(product.price)}</td>
                    <td className="py-2">{product.problemTag}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <p className="font-semibold">{t('Avis recents', 'Recent reviews')}</p>
            <div className="mt-3 space-y-2 text-sm">
              {dashboard.sellerReviews.slice(0, 4).map((review) => (
                <div key={review.id} className="rounded-lg border p-3">
                  <p className="font-semibold">{review.customerName} - {review.rating}/5</p>
                  <p className="text-slate-600">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="card mt-10 p-6">
        <h3 className="text-xl font-bold">{t('Noter un vendeur', 'Rate a vendor')}</h3>
        <form onSubmit={onReviewSubmit} className="mt-4 grid gap-3 md:grid-cols-2">
          <select name="sellerId" required className="rounded-lg border px-3 py-2">
            <option value="">{t('Choisir un vendeur', 'Choose a vendor')}</option>
            {sellerProfiles.map((seller) => (
              <option key={seller.id} value={seller.id}>
                {seller.company}
              </option>
            ))}
          </select>

          <input
            name="customerName"
            required
            defaultValue={sessionUser?.name ?? ''}
            placeholder={t('Votre nom', 'Your name')}
            className="rounded-lg border px-3 py-2"
          />

          <select name="rating" required className="rounded-lg border px-3 py-2">
            <option value="">{t('Votre note', 'Your rating')}</option>
            {[5, 4, 3, 2, 1].map((rate) => (
              <option key={rate} value={rate}>
                {rate}/5
              </option>
            ))}
          </select>

          <input name="comment" required placeholder={t('Votre commentaire', 'Your comment')} className="rounded-lg border px-3 py-2" />

          <button className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white md:col-span-2">{t('Envoyer mon avis', 'Submit review')}</button>
          {reviewStatus && <p className="text-sm md:col-span-2">{reviewStatus}</p>}
        </form>
      </section>
    </section>
  );
}
