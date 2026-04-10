'use client';

import { useSite } from '@/components/site-context';

export default function AdminPage() {
  const { sessionUser, users, sellers, t } = useSite();

  if (!sessionUser || sessionUser.role !== 'admin') {
    return (
      <section className="section py-12">
        <div className="card p-6">
          <h1 className="text-2xl font-bold">{t('Acces refuse', 'Access denied')}</h1>
          <p className="mt-2 text-slate-600">
            {t('Seule la session admin peut voir les donnees clients et vendeurs.', 'Only the admin session can view clients and vendors data.')}
          </p>
        </div>
      </section>
    );
  }

  const clientAccounts = users.filter((user) => user.role === 'client');
  const sellerAccounts = users.filter((user) => user.role === 'seller');

  return (
    <section className="section space-y-8 py-12">
      <h1 className="text-3xl font-bold">Dashboard Admin</h1>
      <p className="text-slate-600">Connecte en admin: {sessionUser.name} ({sessionUser.email})</p>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-xl font-semibold">Comptes clients</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {clientAccounts.map((account) => (
              <li key={account.id} className="rounded-lg border p-3">
                <p className="font-semibold">{account.name}</p>
                <p>{account.email}</p>
                <p>Localisation: {account.city}, {account.country}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5">
          <h2 className="text-xl font-semibold">Comptes vendeurs</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {sellerAccounts.map((account) => (
              <li key={account.id} className="rounded-lg border p-3">
                <p className="font-semibold">{account.name}</p>
                <p>{account.email}</p>
                <p>Localisation: {account.city}, {account.country}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-xl font-semibold">Fiches vendeurs verifiees</h2>
        <ul className="mt-3 grid gap-3 md:grid-cols-3">
          {sellers.map((seller) => (
            <li key={seller.id} className="rounded-lg border p-3 text-sm">
              <p className="font-semibold">{seller.company}</p>
              <p>{seller.name}</p>
              <p>{seller.email}</p>
              <p>{seller.city}, {seller.country}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
