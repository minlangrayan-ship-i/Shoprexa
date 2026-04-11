'use client';

import { FormEvent, useMemo, useState } from 'react';
import { SellerLayout } from '@/components/seller-layout';
import { useSite } from '@/components/site-context';
import { formatPrice } from '@/lib/utils';

export default function SellerDashboardPage() {
  const { sessionUser, sellers, products, orders, recruitmentOffers, companySendRecruitmentOffer, respondRecruitmentOffer, t } = useSite();
  const [status, setStatus] = useState('');

  const sellerId = sessionUser?.sellerId;
  const sellerProducts = products.filter((product) => product.sellerId === sellerId);
  const sellerOrders = orders.filter((order) => order.sellerId === sellerId);

  const totalStock = sellerProducts.reduce((sum, product) => sum + product.stock, 0);
  const lowStock = sellerProducts.filter((product) => product.stock <= 10).length;
  const totalSales = sellerOrders.reduce((sum, order) => sum + order.total, 0);
  const totalViews = sellerProducts.reduce((sum, product) => sum + product.viewCount, 0);

  const mySeller = sellers.find((seller) => seller.id === sellerId);
  const isCompany = mySeller?.sellerType === 'company';

  const incomingOffers = recruitmentOffers.filter((offer) => offer.targetSellerId === sellerId && offer.status === 'pending');
  const companyProducts = products.filter((product) => product.sellerId === sellerId);
  const recruitmentTargets = sellers.filter((seller) => seller.id !== sellerId && seller.sellerType !== 'company');

  const onSendOffer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const targetSellerId = String(formData.get('targetSellerId'));
    const productIds = String(formData.get('productIds'))
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);

    const result = companySendRecruitmentOffer(targetSellerId, productIds);
    setStatus(result.message);
    if (result.ok) event.currentTarget.reset();
  };

  const offersWithCompanies = useMemo(
    () =>
      incomingOffers.map((offer) => ({
        ...offer,
        company: sellers.find((entry) => entry.id === offer.companySellerId)
      })),
    [incomingOffers, sellers]
  );

  return (
    <SellerLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t('Tableau de bord vendeur', 'Seller dashboard')}</h1>

        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">{t('Produits', 'Products')}</p><p className="text-xl font-bold">{sellerProducts.length}</p></div>
          <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">{t('Stock total', 'Total stock')}</p><p className="text-xl font-bold">{mySeller?.sellerType === 'dropshipper' ? 'N/A' : totalStock}</p></div>
          <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">{t('Stock faible', 'Low stock')}</p><p className="text-xl font-bold text-amber-600">{mySeller?.sellerType === 'dropshipper' ? 0 : lowStock}</p></div>
          <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">{t('Commandes', 'Orders')}</p><p className="text-xl font-bold">{sellerOrders.length}</p></div>
          <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">{t('Ventes', 'Sales')}</p><p className="text-xl font-bold">{formatPrice(totalSales)}</p></div>
          <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">{t('Vues produit', 'Product views')}</p><p className="text-xl font-bold">{totalViews}</p></div>
        </div>

        {isCompany ? (
          <div className="rounded-xl border bg-white p-4">
            <h2 className="font-semibold">{t('Recruter vendeurs / dropshippers', 'Recruit sellers / dropshippers')}</h2>
            <p className="mt-1 text-xs text-slate-500">{t('Envoie une offre de collaboration. Le vendeur peut accepter/refuser directement.', 'Send a collaboration offer. The seller can accept/reject directly.')}</p>
            <form onSubmit={onSendOffer} className="mt-3 grid gap-3 md:grid-cols-2">
              <select name="targetSellerId" className="rounded-lg border px-3 py-2">
                {recruitmentTargets.map((seller) => (
                  <option key={seller.id} value={seller.id}>{seller.company} ({seller.sellerType})</option>
                ))}
              </select>
              <input
                name="productIds"
                placeholder={t('IDs produits a proposer (ex: prod-5,prod-6)', 'Product IDs to propose (ex: prod-5,prod-6)')}
                className="rounded-lg border px-3 py-2"
                defaultValue={companyProducts.slice(0, 2).map((entry) => entry.id).join(',')}
              />
              <button className="rounded-lg bg-dark px-4 py-2 text-sm font-semibold text-white md:col-span-2">{t('Envoyer offre', 'Send offer')}</button>
            </form>
          </div>
        ) : (
          <div className="rounded-xl border bg-white p-4">
            <h2 className="font-semibold">{t('Offres de collaboration recues', 'Received collaboration offers')}</h2>
            <div className="mt-3 space-y-2 text-sm">
              {offersWithCompanies.map((offer) => (
                <div key={offer.id} className="rounded-lg border p-3">
                  <p className="font-semibold">{t('Entreprise', 'Company')}: {offer.company?.company ?? offer.companySellerId}</p>
                  <p>{t('Produits proposes', 'Proposed products')}: {offer.productIds.join(', ')}</p>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => setStatus(respondRecruitmentOffer(offer.id, 'accepted').message)} className="rounded border px-3 py-1 text-xs text-emerald-700">{t('Accepter', 'Accept')}</button>
                    <button onClick={() => setStatus(respondRecruitmentOffer(offer.id, 'rejected').message)} className="rounded border px-3 py-1 text-xs text-red-600">{t('Refuser', 'Reject')}</button>
                  </div>
                </div>
              ))}
              {offersWithCompanies.length === 0 ? <p className="text-slate-500">{t('Aucune offre en attente.', 'No pending offers.')}</p> : null}
            </div>
          </div>
        )}

        {status ? <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm">{status}</p> : null}
      </div>
    </SellerLayout>
  );
}
