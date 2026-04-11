'use client';

import { useMemo, useState } from 'react';
import { dropshippers, marketplaceProducts } from '@/lib/mock-marketplace';
import { formatPrice } from '@/lib/utils';
import { useSite } from '@/components/site-context';

export default function DropshippersPage() {
  const { country, t } = useSite();
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [zone, setZone] = useState<'all' | 'country'>('all');

  const filtered = useMemo(
    () =>
      dropshippers.filter((entry) => {
        if (zone === 'country' && entry.country !== country) return false;
        if (verifiedOnly && !entry.email.includes('@')) return false;
        return true;
      }),
    [country, verifiedOnly, zone]
  );

  return (
    <section className="section py-12">
      <h1 className="text-3xl font-bold">Dropshippers</h1>
      <p className="mt-2 text-slate-600">
        {t(
          'Les dropshippers proposent des produits que les vendeurs peuvent activer rapidement dans leur boutique.',
          'Dropshippers propose products that vendors can quickly activate in their store.'
        )}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <select value={zone} onChange={(event) => setZone(event.target.value as 'all' | 'country')} className="rounded-lg border px-2 py-1">
          <option value="all">{t('Tous pays', 'All countries')}</option>
          <option value="country">{t('Mon pays', 'My country')}</option>
        </select>
        <label className="inline-flex items-center gap-2 rounded-lg border px-2 py-1">
          <input type="checkbox" checked={verifiedOnly} onChange={(event) => setVerifiedOnly(event.target.checked)} />
          {t('Partenaires qualifies', 'Qualified partners')}
        </label>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {filtered.map((dropshipper) => {
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
