'use client';

import { SellerLayout } from '@/components/seller-layout';
import { useSite } from '@/components/site-context';
import { formatPrice } from '@/lib/utils';

export default function SellerOrdersPage() {
  const { sessionUser, orders, products } = useSite();
  const sellerOrders = orders.filter((order) => order.sellerId === sessionUser?.sellerId);

  return (
    <SellerLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Commandes recues</h1>
        <div className="rounded-xl border bg-white p-4">
          <div className="space-y-3">
            {sellerOrders.map((order) => {
              const product = products.find((entry) => entry.id === order.productId);
              return (
                <div key={order.id} className="rounded-lg border p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{order.customerName} - {product?.name ?? order.productId}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold">{order.status}</span>
                  </div>
                  <p className="text-slate-600">Quantite: {order.quantity} - Total: {formatPrice(order.total)}</p>
                  <p className="text-xs text-slate-500">{order.createdAt}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
