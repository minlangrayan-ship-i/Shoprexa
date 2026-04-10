'use client';

import { SellerLayout } from '@/components/seller-layout';
import { useSite } from '@/components/site-context';
import { formatPrice } from '@/lib/utils';

export default function SellerDashboardPage() {
  const { sessionUser, products, orders } = useSite();
  const sellerId = sessionUser?.sellerId;

  const sellerProducts = products.filter((product) => product.sellerId === sellerId);
  const sellerOrders = orders.filter((order) => order.sellerId === sellerId);

  const totalStock = sellerProducts.reduce((sum, product) => sum + product.stock, 0);
  const lowStock = sellerProducts.filter((product) => product.stock <= 10).length;
  const totalSales = sellerOrders.reduce((sum, order) => sum + order.total, 0);
  const totalViews = sellerProducts.reduce((sum, product) => sum + product.viewCount, 0);

  return (
    <SellerLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Tableau de bord vendeur</h1>

        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">Produits</p><p className="text-xl font-bold">{sellerProducts.length}</p></div>
          <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">Stock total</p><p className="text-xl font-bold">{totalStock}</p></div>
          <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">Stock faible</p><p className="text-xl font-bold text-amber-600">{lowStock}</p></div>
          <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">Commandes</p><p className="text-xl font-bold">{sellerOrders.length}</p></div>
          <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">Ventes</p><p className="text-xl font-bold">{formatPrice(totalSales)}</p></div>
          <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">Vues produit</p><p className="text-xl font-bold">{totalViews}</p></div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-white p-4">
            <h2 className="font-semibold">Alertes stock</h2>
            <div className="mt-3 space-y-2 text-sm">
              {sellerProducts.filter((product) => product.stock <= 10).slice(0, 5).map((product) => (
                <p key={product.id} className="rounded-lg bg-amber-50 px-3 py-2">{product.name} - stock {product.stock}</p>
              ))}
              {sellerProducts.every((product) => product.stock > 10) ? <p className="text-slate-500">Aucune alerte stock.</p> : null}
            </div>
          </div>

          <div className="rounded-xl border bg-white p-4">
            <h2 className="font-semibold">Commandes recentes</h2>
            <div className="mt-3 space-y-2 text-sm">
              {sellerOrders.slice(0, 5).map((order) => (
                <p key={order.id} className="rounded-lg border px-3 py-2">
                  {order.customerName} - {order.status} - {formatPrice(order.total)}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
