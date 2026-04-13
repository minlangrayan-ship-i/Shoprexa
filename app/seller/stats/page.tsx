'use client';

import { SellerLayout } from '@/components/seller-layout';
import { useSite } from '@/components/site-context';
import { getSellerEarningsBreakdown } from '@/lib/mock-marketplace';
import { formatPrice } from '@/lib/utils';

export default function SellerStatsPage() {
  const { sessionUser, sellers, products, orders, recruitmentOffers, t } = useSite();
  const sellerProducts = products.filter((product) => product.sellerId === sessionUser?.sellerId);
  const sellerOrders = orders.filter((order) => order.sellerId === sessionUser?.sellerId);
  const earningsRows = sessionUser?.sellerId
    ? getSellerEarningsBreakdown(sessionUser.sellerId, products, orders, recruitmentOffers, sellers)
    : [];

  const totalViews = sellerProducts.reduce((sum, product) => sum + product.viewCount, 0);
  const totalSales = sellerOrders.reduce((sum, order) => sum + order.total, 0);
  const averageOrder = sellerOrders.length ? totalSales / sellerOrders.length : 0;
  const validatedProfit = earningsRows.filter((row) => row.status === 'delivered').reduce((sum, row) => sum + row.netAmount, 0);

  return (
    <SellerLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t('Statistiques', 'Statistics')}</h1>

        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">{t('Vues produits', 'Product views')}</p><p className="text-2xl font-bold">{totalViews}</p></div>
          <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">{t('Ventes simulees', 'Simulated sales')}</p><p className="text-2xl font-bold">{formatPrice(totalSales)}</p></div>
          <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">{t('Panier moyen', 'Average basket')}</p><p className="text-2xl font-bold">{formatPrice(averageOrder)}</p></div>
          <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">{t('Benefice net valide', 'Validated net profit')}</p><p className="text-2xl font-bold">{formatPrice(validatedProfit)}</p></div>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold">{t('Benefices apres chaque vente validee', 'Profit after each validated sale')}</h2>
          <p className="mt-2 text-sm text-slate-500">
            {t(
              'Quand une vente entreprise passe par un dropshipper avec partenariat accepte, la commission du dropshipper est retiree avant le montant net vendeur.',
              'When a company sale goes through a dropshipper with an accepted partnership, the dropshipper commission is deducted before the seller net amount.'
            )}
          </p>
          <div className="mt-4 space-y-3">
            {earningsRows.slice(0, 10).map((row) => (
              <article key={row.orderId} className="rounded-xl border p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{row.productName}</p>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{row.status}</span>
                </div>
                <p className="mt-1 text-slate-500">{row.createdAt} - {row.buyerName}</p>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  <p>{t('Montant brut', 'Gross amount')}: {formatPrice(row.grossAmount)}</p>
                  <p>{t('Commission retiree', 'Commission deducted')}: {formatPrice(row.commissionAmount)} ({row.commissionRate}%)</p>
                  <p className="font-semibold">{t('Montant net', 'Net amount')}: {formatPrice(row.netAmount)}</p>
                </div>
                {row.counterpartyLabel ? <p className="mt-1 text-xs text-slate-500">{t('Dropshipper remunere', 'Dropshipper paid')}: {row.counterpartyLabel}</p> : null}
              </article>
            ))}
            {earningsRows.length === 0 ? <p className="text-sm text-slate-500">{t('Aucun revenu detaille pour le moment.', 'No detailed earnings yet.')}</p> : null}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold">{t('Performance produits', 'Product performance')}</h2>
          <div className="mt-4 space-y-3">
            {sellerProducts.map((product) => (
              <div key={product.id}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span>{product.name}</span>
                  <span>{product.viewCount} {t('vues', 'views')}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-brand-600" style={{ width: `${Math.min(100, Math.round((product.viewCount / 700) * 100))}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
