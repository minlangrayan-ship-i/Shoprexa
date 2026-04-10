'use client';

import { FormEvent, useState } from 'react';
import { useSite } from '@/components/site-context';
import { formatPrice } from '@/lib/utils';

export default function AdminPage() {
  const { sessionUser, users, sellers, products, orders, adminChangeUserRole, adminDeleteUser, adminAddProduct, adminUpdateProduct, adminDeleteProduct, t } = useSite();
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

  const onAddProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const images = String(formData.get('images') ?? '')
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);

    const result = adminAddProduct({
      sellerId: String(formData.get('sellerId')),
      name: String(formData.get('name')),
      description: String(formData.get('description')),
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
      categorySlug: String(formData.get('categorySlug')),
      images
    });
    setStatus(result.message);
    if (result.ok) event.currentTarget.reset();
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

      <div className="rounded-xl border bg-white p-5">
        <h2 className="text-xl font-semibold">Gestion globale des produits (Admin)</h2>
        <form onSubmit={onAddProduct} className="mt-3 grid gap-3 md:grid-cols-3">
          <select name="sellerId" className="rounded-lg border px-3 py-2">
            {sellers.map((seller) => (
              <option key={seller.id} value={seller.id}>{seller.company}</option>
            ))}
          </select>
          <input required name="name" placeholder="Nom produit" className="rounded-lg border px-3 py-2" />
          <input required name="price" type="number" min="1" placeholder="Prix" className="rounded-lg border px-3 py-2" />
          <input required name="stock" type="number" min="0" placeholder="Stock" className="rounded-lg border px-3 py-2" />
          <select name="categorySlug" className="rounded-lg border px-3 py-2">
            <option value="energie">energie</option>
            <option value="cuisine">cuisine</option>
            <option value="securite">securite</option>
            <option value="mobilite">mobilite</option>
            <option value="fitness">fitness</option>
            <option value="organisation">organisation</option>
          </select>
          <input name="images" placeholder="URLs images (virgule)" className="rounded-lg border px-3 py-2" />
          <textarea required name="description" placeholder="Description produit" className="h-20 rounded-lg border px-3 py-2 md:col-span-3" />
          <button className="rounded-lg bg-dark px-4 py-2 font-semibold text-white md:col-span-3">Ajouter produit (admin)</button>
        </form>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="py-2">Produit</th>
                <th className="py-2">Vendeur</th>
                <th className="py-2">Prix</th>
                <th className="py-2">Stock</th>
                <th className="py-2">Actions admin</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 30).map((product) => (
                <tr key={product.id} className="border-b">
                  <td className="py-2">{product.name}</td>
                  <td className="py-2">{product.companyName}</td>
                  <td className="py-2">{formatPrice(product.price)}</td>
                  <td className="py-2">{product.stock}</td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setStatus(adminUpdateProduct(product.id, { stock: product.stock + 1 }).message)} className="rounded border px-2 py-1 text-xs">+ stock</button>
                      <button onClick={() => setStatus(adminUpdateProduct(product.id, { stock: Math.max(0, product.stock - 1) }).message)} className="rounded border px-2 py-1 text-xs">- stock</button>
                      <button onClick={() => setStatus(adminUpdateProduct(product.id, { price: product.price + 500 }).message)} className="rounded border px-2 py-1 text-xs">+ prix</button>
                      <button onClick={() => setStatus(adminDeleteProduct(product.id).message)} className="rounded border px-2 py-1 text-xs text-red-600">Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
