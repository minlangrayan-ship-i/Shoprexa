'use client';

import { SellerLayout } from '@/components/seller-layout';
import { useSite } from '@/components/site-context';
import { formatPrice } from '@/lib/utils';

export default function SellerStatsPage() {
  const { sessionUser, products, orders } = useSite();
  const sellerProducts = products.filter((product) => product.sellerId === sessionUser?.sellerId);
  const sellerOrders = orders.filter((order) => order.sellerId === sessionUser?.sellerId);

  const totalViews = sellerProducts.reduce((sum, product) => sum + product.viewCount, 0);
  const totalSales = sellerOrders.reduce((sum, order) => sum + order.total, 0);
  const averageOrder = sellerOrders.length ? totalSales / sellerOrders.length : 0;

  return (
    <SellerLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Statistiques</h1>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">Vues produits</p><p className="text-2xl font-bold">{totalViews}</p></div>
          <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">Ventes simulees</p><p className="text-2xl font-bold">{formatPrice(totalSales)}</p></div>
          <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">Panier moyen</p><p className="text-2xl font-bold">{formatPrice(averageOrder)}</p></div>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold">Performance produits</h2>
          <div className="mt-4 space-y-3">
            {sellerProducts.map((product) => (
              <div key={product.id}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span>{product.name}</span>
                  <span>{product.viewCount} vues</span>
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
