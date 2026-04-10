'use client';

import { SellerLayout } from '@/components/seller-layout';
import { useSite } from '@/components/site-context';

export default function SellerStockPage() {
  const { sessionUser, products, updateSellerStock } = useSite();
  const sellerProducts = products.filter((product) => product.sellerId === sessionUser?.sellerId);

  return (
    <SellerLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Gestion du stock</h1>

        <div className="rounded-xl border bg-white p-4">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="py-2">Produit</th>
                <th className="py-2">Stock actuel</th>
                <th className="py-2">Alerte</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellerProducts.map((product) => (
                <tr key={product.id} className="border-b">
                  <td className="py-2">{product.name}</td>
                  <td className="py-2 font-semibold">{product.stock}</td>
                  <td className="py-2">
                    {product.stock === 0 ? <span className="text-red-600">Rupture</span> : product.stock <= 10 ? <span className="text-amber-600">Stock faible</span> : <span className="text-emerald-700">OK</span>}
                  </td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <button onClick={() => updateSellerStock(product.id, Math.max(0, product.stock - 1))} className="rounded border px-2 py-1">-1</button>
                      <button onClick={() => updateSellerStock(product.id, product.stock + 1)} className="rounded border px-2 py-1">+1</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SellerLayout>
  );
}
