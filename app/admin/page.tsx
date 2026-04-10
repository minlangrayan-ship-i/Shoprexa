'use client';

import { FormEvent, useState } from 'react';
import { useSite } from '@/components/site-context';
import { formatPrice } from '@/lib/utils';

export default function AdminPage() {
  const { sessionUser, users, sellers, products, orders, adminChangeUserRole, adminDeleteUser, t } = useSite();
  const [status, setStatus] = useState('');

  if (!sessionUser || sessionUser.role !== 'admin') {
    return (
      <section className="section py-12">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold">{t('Acces refuse', 'Access denied')}</h1>
          <p className="mt-2 text-slate-600">{t('Seule la session admin peut voir les donnees sensibles et gerer les comptes.', 'Only admin can access sensitive data and manage accounts.')}</p>
        </div>
      </section>
    );
  }

  const onRoleChange = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = adminChangeUserRole(String(formData.get('userId')), String(formData.get('role')) as 'client' | 'seller' | 'admin');
    setStatus(result.message);
  };

  const clientAccounts = users.filter((user) => user.role === 'client');
  const sellerAccounts = users.filter((user) => user.role === 'seller');
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <section className="section space-y-8 py-12">
      <h1 className="text-3xl font-bold">Dashboard Admin</h1>
      <p className="text-slate-600">Connecte en admin: {sessionUser.name} ({sessionUser.email})</p>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">Utilisateurs</p><p className="text-xl font-bold">{users.length}</p></div>
        <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">Vendeurs actifs</p><p className="text-xl font-bold">{sellers.length}</p></div>
        <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">Produits</p><p className="text-xl font-bold">{products.length}</p></div>
        <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">CA simule</p><p className="text-xl font-bold">{formatPrice(totalRevenue)}</p></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <h2 className="text-xl font-semibold">Comptes clients</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {clientAccounts.map((account) => (
              <li key={account.id} className="rounded-lg border p-3">
                <p className="font-semibold">{account.name}</p>
                <p>{account.email}</p>
                <p>WhatsApp: {account.phone}</p>
                <p>Localisation: {account.city}, {account.country}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <h2 className="text-xl font-semibold">Comptes vendeurs</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {sellerAccounts.map((account) => (
              <li key={account.id} className="rounded-lg border p-3">
                <p className="font-semibold">{account.name}</p>
                <p>{account.email}</p>
                <p>WhatsApp: {account.phone}</p>
                <p>Localisation: {account.city}, {account.country}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5">
        <h2 className="text-xl font-semibold">Gestion des droits</h2>
        <form onSubmit={onRoleChange} className="mt-3 grid gap-3 md:grid-cols-3">
          <select name="userId" className="rounded-lg border px-3 py-2">
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
            ))}
          </select>
          <select name="role" className="rounded-lg border px-3 py-2">
            <option value="client">client</option>
            <option value="seller">seller</option>
            <option value="admin">admin</option>
          </select>
          <button className="rounded-lg bg-dark px-4 py-2 font-semibold text-white">Mettre a jour le role</button>
        </form>

        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {users.filter((user) => user.id !== sessionUser.id).map((user) => (
            <button
              key={user.id}
              onClick={() => setStatus(adminDeleteUser(user.id).message)}
              className="rounded-lg border px-3 py-2 text-left text-sm hover:bg-slate-50"
            >
              Supprimer: {user.name} ({user.role})
            </button>
          ))}
        </div>

        {status ? <p className="mt-3 text-sm">{status}</p> : null}
      </div>
    </section>
  );
}
