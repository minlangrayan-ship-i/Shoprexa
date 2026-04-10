'use client';

import { dropshippers, marketplaceProducts } from '@/lib/mock-marketplace';
import { formatPrice } from '@/lib/utils';
import { useSite } from '@/components/site-context';

export default function DropshippersPage() {
  const { t } = useSite();

  return (
    <section className="section py-12">
      <h1 className="text-3xl font-bold">Dropshippers</h1>
      <p className="mt-2 text-slate-600">
        {t(
          'Les dropshippers proposent des produits que les vendeurs peuvent activer rapidement dans leur boutique.',
          'Dropshippers propose products that vendors can quickly activate in their store.'
        )}
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {dropshippers.map((dropshipper) => {
          const products = marketplaceProducts.filter((product) => dropshipper.productIds.includes(product.id));
          return (
            <article key={dropshipper.id} className="card p-6">
              <h2 className="text-xl font-bold">{dropshipper.name}</h2>
              <p className="text-sm text-slate-600">{dropshipper.city}, {dropshipper.country}</p>
              <p className="text-sm text-slate-600">{dropshipper.email}</p>

              <div className="mt-4 space-y-2">
                {products.map((product) => (
                  <div key={product.id} className="rounded-lg border p-3 text-sm">
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-slate-600">{formatPrice(product.price)} - {product.category}</p>
                    <p className="text-xs text-slate-500">{t('A proposer aux vendeurs pour', 'Can be offered to vendors for')} {product.problemTag}</p>
                  </div>
                ))}
              </div>

              <button className="mt-4 w-full rounded-lg bg-dark px-4 py-2 text-sm font-semibold text-white">
                {t('Proposer ce catalogue aux vendeurs', 'Share this catalog with vendors')}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
