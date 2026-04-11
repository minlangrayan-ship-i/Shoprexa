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
      <h1 className="text-3xl font-bold">{t('Dashboard Admin', 'Admin Dashboard')}</h1>
      <p className="text-slate-600">{t('Connecte en admin', 'Logged in as admin')}: {sessionUser.name} ({sessionUser.email})</p>

      <div className="grid gap-3 md:grid-cols-5">
        <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">{t('Utilisateurs', 'Users')}</p><p className="text-xl font-bold">{users.length}</p></div>
        <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">{t('Vendeurs actifs', 'Active sellers')}</p><p className="text-xl font-bold">{sellers.length}</p></div>
        <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">{t('Vendeurs badges', 'Sellers with badge')}</p><p className="text-xl font-bold">{withBadge}</p></div>
        <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">{t('Sans badge', 'Without badge')}</p><p className="text-xl font-bold">{withoutBadge}</p></div>
        <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">{t('Visites site', 'Site visits')}</p><p className="text-xl font-bold">{siteVisits}</p></div>
      </div>

      <div className="rounded-xl border bg-white p-5">
        <h2 className="text-xl font-semibold">{t('Analyse ventes et CA', 'Sales and revenue analysis')}</h2>
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
          <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{t('Ventes periode', 'Sales in period')}</p><p className="text-xl font-bold">{totalSales}</p></div>
          <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{t('CA periode', 'Revenue in period')}</p><p className="text-xl font-bold">{formatPrice(totalRevenue, countryFilter || 'Cameroun')}</p></div>
          <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{t('Plaintes', 'Complaints')}</p><p className="text-xl font-bold">{complaints.length}</p></div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5">
        <h2 className="text-xl font-semibold">{t('Entites inscrites', 'Registered entities')}</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="py-2">{t('Nom', 'Name')}</th>
                <th className="py-2">Email</th>
                <th className="py-2">{t('Statut', 'Status')}</th>
                <th className="py-2">{t('Pays', 'Country')}</th>
                <th className="py-2">{t('Depuis', 'Since')}</th>
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
        <h2 className="text-xl font-semibold">{t('Badge verification automatique', 'Automatic verification badge')}</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="py-2">{t('Vendeur', 'Seller')}</th>
                <th className="py-2">{t('Badge', 'Badge')}</th>
                <th className="py-2">{t('Source badge', 'Badge source')}</th>
                <th className="py-2">{t('Commandes reussies', 'Successful orders')}</th>
                <th className="py-2">{t('Satisfaction', 'Satisfaction')}</th>
                <th className="py-2">{t('Clients satisfaits', 'Satisfied clients')}</th>
                <th className="py-2">{t('Plaintes', 'Complaints')}</th>
              </tr>
            </thead>
            <tbody>
              {sellerTrustRows.map(({ seller, trust }) => (
                <tr key={seller.id} className="border-b">
                  <td className="py-2">{seller.company}</td>
                  <td className="py-2">{trust.hasBadge ? (trust.badgeSource === 'admin' ? t('Verifie Min-shop (provisoire)', 'Min-shop Verified (provisional)') : t('Verifie Min-shop', 'Min-shop Verified')) : t('Sans badge', 'No badge')}</td>
                  <td className="py-2">{trust.badgeSource === 'admin' ? t('Admin', 'Admin') : trust.badgeSource === 'performance' ? t('Performance', 'Performance') : '-'}</td>
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
          <h2 className="text-xl font-semibold">{t('Comptes clients', 'Client accounts')}</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {clientAccounts.map((account) => (
              <li key={account.id} className="rounded-lg border p-3">
                <p className="font-semibold">{account.name}</p>
                <p>{account.email}</p>
                <p>WhatsApp: {account.phone}</p>
                <p>{t('Localisation', 'Location')}: {account.city}, {account.country}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <h2 className="text-xl font-semibold">{t('Comptes vendeurs', 'Seller accounts')}</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {sellerAccounts.map((account) => (
              <li key={account.id} className="rounded-lg border p-3">
                <p className="font-semibold">{account.name}</p>
                <p>{account.email}</p>
                <p>WhatsApp: {account.phone}</p>
                <p>{t('Localisation', 'Location')}: {account.city}, {account.country}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5">
        <h2 className="text-xl font-semibold">{t('Gestion des droits', 'Role management')}</h2>
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
          <button className="rounded-lg bg-dark px-4 py-2 font-semibold text-white">{t('Mettre a jour le role', 'Update role')}</button>
        </form>

        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {users.filter((user) => user.id !== sessionUser.id).map((user) => (
            <button
              key={user.id}
              onClick={() => setStatus(adminDeleteUser(user.id).message)}
              className="rounded-lg border px-3 py-2 text-left text-sm hover:bg-slate-50"
            >
              {t('Supprimer', 'Delete')}: {user.name} ({user.role})
            </button>
          ))}
        </div>

        {status ? <p className="mt-3 text-sm">{status}</p> : null}
      </div>

      <div className="rounded-xl border bg-white p-5">
        <h2 className="text-xl font-semibold">{t('Gestion globale des produits et services (Admin)', 'Global products/services management (Admin)')}</h2>
        <form onSubmit={onAddProduct} className="mt-3 grid gap-3 md:grid-cols-3">
          <select name="sellerId" className="rounded-lg border px-3 py-2">
            {sellers.map((seller) => (
              <option key={seller.id} value={seller.id}>{seller.company}</option>
            ))}
          </select>
          <input required name="name" placeholder={t('Nom produit/service', 'Product/service name')} className="rounded-lg border px-3 py-2" />
          <input required name="price" type="number" min="1" placeholder={t('Prix', 'Price')} className="rounded-lg border px-3 py-2" />
          <input required name="stock" type="number" min="0" placeholder={t('Stock', 'Stock')} className="rounded-lg border px-3 py-2" />
          <select name="categorySlug" className="rounded-lg border px-3 py-2">
            <option value="energie">energie</option>
            <option value="cuisine">cuisine</option>
            <option value="securite">securite</option>
            <option value="mobilite">mobilite</option>
            <option value="fitness">fitness</option>
            <option value="organisation">organisation</option>
          </select>
          <select name="kind" className="rounded-lg border px-3 py-2">
            <option value="product">{t('Produit', 'Product')}</option>
            <option value="service">Service</option>
          </select>
          <input name="serviceDuration" placeholder={t('Duree service (optionnel)', 'Service duration (optional)')} className="rounded-lg border px-3 py-2" />
          <input name="serviceAvailability" placeholder={t('Disponibilite service (optionnel)', 'Service availability (optional)')} className="rounded-lg border px-3 py-2" />
          <input name="targetCountries" placeholder={t('Pays cibles (virgules)', 'Target countries (comma separated)')} className="rounded-lg border px-3 py-2 md:col-span-2" />
          <input name="images" placeholder={t('URLs images (virgule)', 'Image URLs (comma separated)')} className="rounded-lg border px-3 py-2" />
          <textarea required name="description" placeholder={t('Description produit/service', 'Product/service description')} className="h-20 rounded-lg border px-3 py-2 md:col-span-3" />
          <button className="rounded-lg bg-dark px-4 py-2 font-semibold text-white md:col-span-3">{t('Ajouter offre (admin)', 'Add offer (admin)')}</button>
        </form>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="py-2">{t('Offre', 'Offer')}</th>
                <th className="py-2">{t('Type', 'Type')}</th>
                <th className="py-2">{t('Vendeur', 'Seller')}</th>
                <th className="py-2">{t('Prix', 'Price')}</th>
                <th className="py-2">{t('Stock', 'Stock')}</th>
                <th className="py-2">{t('Actions admin', 'Admin actions')}</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 30).map((product) => (
                <tr key={product.id} className="border-b">
                  <td className="py-2">{product.name}</td>
                  <td className="py-2">{product.kind === 'service' ? t('Service', 'Service') : t('Produit', 'Product')}</td>
                  <td className="py-2">{product.companyName}</td>
                  <td className="py-2">{formatPrice(product.price)}</td>
                  <td className="py-2">{product.stock}</td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setStatus(adminUpdateProduct(product.id, { stock: product.stock + 1 }).message)} className="rounded border px-2 py-1 text-xs">+ stock</button>
                      <button onClick={() => setStatus(adminUpdateProduct(product.id, { stock: Math.max(0, product.stock - 1) }).message)} className="rounded border px-2 py-1 text-xs">- stock</button>
                      <button onClick={() => setStatus(adminUpdateProduct(product.id, { price: product.price + 500 }).message)} className="rounded border px-2 py-1 text-xs">+ prix</button>
                      <button onClick={() => setStatus(adminDeleteProduct(product.id).message)} className="rounded border px-2 py-1 text-xs text-red-600">{t('Supprimer', 'Delete')}</button>
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
