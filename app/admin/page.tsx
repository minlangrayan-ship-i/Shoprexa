'use client';

import { FormEvent, useMemo, useState } from 'react';
import { getSellerTrustStats } from '@/lib/mock-marketplace';
import { formatPrice } from '@/lib/utils';
import { useSite } from '@/components/site-context';

export default function AdminPage() {
  const {
    sessionUser,
    users,
    sellers,
    products,
    orders,
    reviews,
    complaints,
    siteVisits,
    adminChangeUserRole,
    adminDeleteUser,
    adminAddProduct,
    adminUpdateProduct,
    adminDeleteProduct,
    t
  } = useSite();

  const [status, setStatus] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [fromDate, setFromDate] = useState('2026-03-01');
  const [toDate, setToDate] = useState('2026-04-30');

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
      images,
      kind: String(formData.get('kind')) as 'product' | 'service',
      serviceDuration: String(formData.get('serviceDuration') ?? ''),
      serviceAvailability: String(formData.get('serviceAvailability') ?? ''),
      targetCountries: String(formData.get('targetCountries') ?? '')
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
    });
    setStatus(result.message);
    if (result.ok) event.currentTarget.reset();
  };

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const product = products.find((entry) => entry.id === order.productId);
        if (!product) return false;
        if (countryFilter && product.sellerCountry !== countryFilter) return false;
        if (categoryFilter && product.categorySlug !== categoryFilter) return false;
        if (order.createdAt < fromDate || order.createdAt > toDate) return false;
        return true;
      }),
    [categoryFilter, countryFilter, fromDate, orders, products, toDate]
  );

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalSales = filteredOrders.length;
  const clientAccounts = users.filter((user) => user.role === 'client');
  const sellerAccounts = users.filter((user) => user.role === 'seller');

  const sellerTrustRows = sellers.map((seller) => ({
    seller,
    trust: getSellerTrustStats(seller, products, reviews, orders, complaints)
  }));
  const withBadge = sellerTrustRows.filter((entry) => entry.trust.hasBadge).length;
  const withoutBadge = sellerTrustRows.length - withBadge;

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

  return (
    <section className="section space-y-8 py-12">
      <h1 className="text-3xl font-bold">Dashboard Admin</h1>
      <p className="text-slate-600">Connecte en admin: {sessionUser.name} ({sessionUser.email})</p>

      <div className="grid gap-3 md:grid-cols-5">
        <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">Utilisateurs</p><p className="text-xl font-bold">{users.length}</p></div>
        <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">Vendeurs actifs</p><p className="text-xl font-bold">{sellers.length}</p></div>
        <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">Vendeurs badges</p><p className="text-xl font-bold">{withBadge}</p></div>
        <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">Sans badge</p><p className="text-xl font-bold">{withoutBadge}</p></div>
        <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">Visites site</p><p className="text-xl font-bold">{siteVisits}</p></div>
      </div>

      <div className="rounded-xl border bg-white p-5">
        <h2 className="text-xl font-semibold">Analyse ventes et CA</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="rounded-lg border px-3 py-2" />
          <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="rounded-lg border px-3 py-2" />
          <select value={countryFilter} onChange={(event) => setCountryFilter(event.target.value)} className="rounded-lg border px-3 py-2">
            <option value="">{t('Toutes regions', 'All regions')}</option>
            {['Cameroun', 'Cote d\'Ivoire', 'Senegal', 'Congo', 'Tchad', 'Nigeria', 'Kenya'].map((entry) => <option key={entry} value={entry}>{entry}</option>)}
          </select>
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-lg border px-3 py-2">
            <option value="">{t('Toutes categories', 'All categories')}</option>
            <option value="energie">Energie</option>
            <option value="cuisine">Cuisine</option>
            <option value="securite">Securite</option>
            <option value="mobilite">Mobilite</option>
            <option value="fitness">Fitness</option>
            <option value="organisation">Organisation</option>
          </select>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Ventes periode</p><p className="text-xl font-bold">{totalSales}</p></div>
          <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">CA periode</p><p className="text-xl font-bold">{formatPrice(totalRevenue, countryFilter || 'Cameroun')}</p></div>
          <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Plaintes</p><p className="text-xl font-bold">{complaints.length}</p></div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5">
        <h2 className="text-xl font-semibold">Entites inscrites</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="py-2">Nom</th>
                <th className="py-2">Email</th>
                <th className="py-2">Statut</th>
                <th className="py-2">Pays</th>
                <th className="py-2">Depuis</th>
              </tr>
            </thead>
            <tbody>
              {users.map((account) => (
                <tr key={account.id} className="border-b">
                  <td className="py-2">{account.name}</td>
                  <td className="py-2">{account.email}</td>
                  <td className="py-2">{account.role}{account.sellerType ? ` (${account.sellerType})` : ''}</td>
                  <td className="py-2">{account.country}</td>
                  <td className="py-2">{account.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5">
        <h2 className="text-xl font-semibold">Badge verification automatique</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="py-2">Vendeur</th>
                <th className="py-2">Badge</th>
                <th className="py-2">Source badge</th>
                <th className="py-2">Commandes reussies</th>
                <th className="py-2">Satisfaction</th>
                <th className="py-2">Clients satisfaits</th>
                <th className="py-2">Plaintes</th>
              </tr>
            </thead>
            <tbody>
              {sellerTrustRows.map(({ seller, trust }) => (
                <tr key={seller.id} className="border-b">
                  <td className="py-2">{seller.company}</td>
                  <td className="py-2">{trust.hasBadge ? (trust.badgeSource === 'admin' ? 'Verifie Min-shop (provisoire)' : 'Verifie Min-shop') : 'Sans badge'}</td>
                  <td className="py-2">{trust.badgeSource === 'admin' ? 'Admin' : trust.badgeSource === 'performance' ? 'Performance' : '-'}</td>
                  <td className="py-2">{trust.successfulOrders}</td>
                  <td className="py-2">{trust.satisfactionRate}%</td>
                  <td className="py-2">{trust.satisfiedClients}</td>
                  <td className="py-2">{trust.complaintCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
        <h2 className="text-xl font-semibold">Gestion globale des produits et services (Admin)</h2>
        <form onSubmit={onAddProduct} className="mt-3 grid gap-3 md:grid-cols-3">
          <select name="sellerId" className="rounded-lg border px-3 py-2">
            {sellers.map((seller) => (
              <option key={seller.id} value={seller.id}>{seller.company}</option>
            ))}
          </select>
          <input required name="name" placeholder="Nom produit/service" className="rounded-lg border px-3 py-2" />
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
          <select name="kind" className="rounded-lg border px-3 py-2">
            <option value="product">Produit</option>
            <option value="service">Service</option>
          </select>
          <input name="serviceDuration" placeholder="Duree service (optionnel)" className="rounded-lg border px-3 py-2" />
          <input name="serviceAvailability" placeholder="Disponibilite service (optionnel)" className="rounded-lg border px-3 py-2" />
          <input name="targetCountries" placeholder="Pays cibles (virgules)" className="rounded-lg border px-3 py-2 md:col-span-2" />
          <input name="images" placeholder="URLs images (virgule)" className="rounded-lg border px-3 py-2" />
          <textarea required name="description" placeholder="Description produit/service" className="h-20 rounded-lg border px-3 py-2 md:col-span-3" />
          <button className="rounded-lg bg-dark px-4 py-2 font-semibold text-white md:col-span-3">Ajouter offre (admin)</button>
        </form>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="py-2">Offre</th>
                <th className="py-2">Type</th>
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
                  <td className="py-2">{product.kind === 'service' ? 'Service' : 'Produit'}</td>
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
