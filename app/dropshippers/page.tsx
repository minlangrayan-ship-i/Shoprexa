'use client';

import { useMemo, useState } from 'react';
import { dropshippers, marketplaceProducts } from '@/lib/mock-marketplace';
import { formatPrice } from '@/lib/utils';
import { useSite } from '@/components/site-context';

export default function DropshippersPage() {
  const { country, sessionUser, dropshipperCatalogProposals, proposeDropshipperCatalog, t } = useSite();
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [zone, setZone] = useState<'all' | 'country'>('all');
  const [status, setStatus] = useState('');

  const canAccess =
    sessionUser?.role === 'admin' ||
    (sessionUser?.role === 'seller' && sessionUser.sellerType === 'dropshipper');

  const filtered = useMemo(
    () =>
      dropshippers.filter((entry) => {
        if (zone === 'country' && entry.country !== country) return false;
        if (verifiedOnly && !entry.email.includes('@')) return false;
        return true;
      }),
    [country, verifiedOnly, zone]
  );

  if (!canAccess) {
    return (
      <section className="section py-12">
        <div className="card p-6">
          <h1 className="text-2xl font-bold">{t('Accès réservé', 'Restricted access')}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {t(
              'Cet onglet est réservé aux comptes dropshipper et à l admin.',
              'This tab is restricted to dropshipper accounts and admin.'
            )}
          </p>
        </div>
      </section>
    );
  }

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
          {t('Partenaires qualifiés', 'Qualified partners')}
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
                    <p className="text-xs text-slate-500">{t('À proposer aux vendeurs pour', 'Can be offered to vendors for')} {product.problemTag}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  const result = proposeDropshipperCatalog({
                    dropshipperId: dropshipper.id,
                    dropshipperName: dropshipper.name,
                    productIds: products.map((product) => product.id)
                  });
                  setStatus(`${dropshipper.name}: ${result.message}`);
                }}
                className="mt-4 w-full rounded-lg bg-dark px-4 py-2 text-sm font-semibold text-white"
              >
                {t('Proposer ce catalogue aux vendeurs', 'Share this catalog with vendors')}
              </button>
            </article>
          );
        })}
      </div>

      {status ? <p className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-sm">{status}</p> : null}

      {sessionUser?.role === 'admin' ? (
        <div className="mt-8 rounded-xl border bg-white p-5">
          <h2 className="text-lg font-bold">{t('Vue d ensemble admin', 'Admin overview')}</h2>
          <p className="mt-1 text-sm text-slate-600">
            {dropshipperCatalogProposals.length} {t('proposition(s) de catalogue enregistrée(s).', 'catalog proposal(s) recorded.')}
          </p>
          <div className="mt-3 space-y-2 text-sm">
            {dropshipperCatalogProposals.slice(0, 8).map((proposal) => (
              <div key={proposal.id} className="rounded-lg border p-3">
                <p className="font-semibold">{proposal.dropshipperName}</p>
                <p className="text-slate-600">
                  {proposal.productIds.length} {t('produit(s) proposé(s)', 'product(s) proposed')} - {proposal.createdAt}
                </p>
              </div>
            ))}
            {dropshipperCatalogProposals.length === 0 ? (
              <p className="text-slate-500">{t('Aucune proposition pour le moment.', 'No proposals yet.')}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
