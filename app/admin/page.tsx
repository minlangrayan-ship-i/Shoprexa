'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { getSellerTrustStats, marketplaceCategories } from '@/lib/mock-marketplace';
import { formatPrice } from '@/lib/utils';
import { useSite } from '@/components/site-context';
import { verifyProductConsistency } from '@/services/verification/product-consistency';
import { buildAiHealthAlerts } from '@/services/ai/health-alerts';
import type { AiHealthSnapshot, AiHealthWindow } from '@/types/marketplace-ai';

type AdminTab = 'overview' | 'ai';
type TrustFilter = 'all' | 'valid' | 'needs_review' | 'suspect';
type TrustSort = 'suspect_first' | 'score_asc' | 'score_desc';

export default function AdminPage() {
  const {
    locale,
    sessionUser,
    users,
    sellers,
    products,
    orders,
    reviews,
    complaints,
    testimonials,
    adminNotifications,
    siteVisits,
    adminChangeUserRole,
    adminDeleteUser,
    adminAddProduct,
    adminUpdateProduct,
    adminDeleteProduct,
    t
  } = useSite();

  const [status, setStatus] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [countryFilter, setCountryFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [fromDate, setFromDate] = useState('2026-03-01');
  const [toDate, setToDate] = useState('2026-04-30');
  const [aiHealth, setAiHealth] = useState<AiHealthSnapshot | null>(null);
  const [aiHealthStatus, setAiHealthStatus] = useState('');
  const [aiWindow, setAiWindow] = useState<AiHealthWindow>('today');
  const [trustFilter, setTrustFilter] = useState<TrustFilter>('all');
  const [trustSort, setTrustSort] = useState<TrustSort>('suspect_first');

  const fetchAiHealth = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/ai-health', { cache: 'no-store' });
      if (!response.ok) throw new Error('ai_health_fetch_failed');
      const payload = (await response.json()) as AiHealthSnapshot;
      setAiHealth(payload);
      setAiHealthStatus('');
    } catch {
      setAiHealthStatus(t('Métriques IA indisponibles pour le moment.', 'AI metrics are currently unavailable.'));
    }
  }, [t]);

  useEffect(() => {
    void fetchAiHealth();
    const timer = setInterval(() => {
      void fetchAiHealth();
    }, 20000);
    return () => clearInterval(timer);
  }, [fetchAiHealth]);

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
      oldPrice: Number(formData.get('oldPrice') || 0) || null,
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

  const productTrustRows = useMemo(
    () =>
      products.slice(0, 30).map((product) => ({
        product,
        trust: verifyProductConsistency(
          {
            name: product.name,
            categorySlug: product.categorySlug,
            description: product.description,
            images: product.images.map((src, index) => ({
              src,
              ...(product.imageMeta?.[index] ?? { source: 'catalog' as const })
            }))
          },
          locale
        )
      })),
    [locale, products]
  );

  const filteredTrustRows = useMemo(() => {
    const filtered = productTrustRows.filter((row) => (trustFilter === 'all' ? true : row.trust.status === trustFilter));

    const statusRank = (statusValue: TrustFilter) => {
      if (statusValue === 'suspect') return 0;
      if (statusValue === 'needs_review') return 1;
      return 2;
    };

    return [...filtered].sort((a, b) => {
      if (trustSort === 'score_asc') return a.trust.score - b.trust.score;
      if (trustSort === 'score_desc') return b.trust.score - a.trust.score;
      const rankDiff = statusRank(a.trust.status) - statusRank(b.trust.status);
      if (rankDiff !== 0) return rankDiff;
      return a.trust.score - b.trust.score;
    });
  }, [productTrustRows, trustFilter, trustSort]);

  const listingStatusCounts = useMemo(
    () => ({
      suspect: productTrustRows.filter((row) => row.trust.status === 'suspect').length,
      needsReview: productTrustRows.filter((row) => row.trust.status === 'needs_review').length,
      valid: productTrustRows.filter((row) => row.trust.status === 'valid').length
    }),
    [productTrustRows]
  );

  const activeAiWindow = aiHealth?.windows[aiWindow] ?? null;
  const aiAlerts = useMemo(
    () =>
      activeAiWindow
        ? buildAiHealthAlerts({
            metrics: activeAiWindow,
            listings: {
              suspect: listingStatusCounts.suspect,
              needsReview: listingStatusCounts.needsReview
            }
          })
        : [],
    [activeAiWindow, listingStatusCounts]
  );

  const getRouteRequests = (route: string) => activeAiWindow?.modules.find((module) => module.route === route)?.requests ?? 0;
  const aiKpis = {
    chatsLaunched: getRouteRequests('/api/ai/chat'),
    generatedSheets: getRouteRequests('/api/ai/product-generator'),
    suspectListings: listingStatusCounts.suspect,
    deliveryConsultations: getRouteRequests('/api/delivery-estimate'),
    recommendationClicks: activeAiWindow?.events.recommendationClicks ?? 0
  };

  if (!sessionUser || sessionUser.role !== 'admin') {
    return (
      <section className="section py-12">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold">{t('Accès refusé', 'Access denied')}</h1>
          <p className="mt-2 text-slate-600">{t('Seule la session admin peut voir les données sensibles et gérer les comptes.', 'Only admin can access sensitive data and manage accounts.')}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section space-y-8 py-12">
      <h1 className="text-3xl font-bold">{t('Dashboard Admin', 'Admin Dashboard')}</h1>
      <p className="text-slate-600">{t('Connecté en admin', 'Logged in as admin')}: {sessionUser.name} ({sessionUser.email})</p>

      <div className="inline-flex rounded-xl border bg-white p-1 text-sm">
        <button onClick={() => setActiveTab('overview')} className={`rounded-lg px-3 py-1.5 font-semibold ${activeTab === 'overview' ? 'bg-dark text-white' : 'text-slate-700'}`}>
          {t('Vue générale', 'Overview')}
        </button>
        <button onClick={() => setActiveTab('ai')} className={`rounded-lg px-3 py-1.5 font-semibold ${activeTab === 'ai' ? 'bg-dark text-white' : 'text-slate-700'}`}>
          {t('Onglet IA', 'AI tab')}
        </button>
      </div>

      {activeTab === 'ai' ? (
        <div className="space-y-5 rounded-xl border bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">{t('Santé IA', 'AI health')}</h2>
            <div className="flex items-center gap-2">
              <select value={aiWindow} onChange={(event) => setAiWindow(event.target.value as AiHealthWindow)} className="rounded border px-2 py-1 text-xs">
                <option value="today">{t('Aujourd’hui', 'Today')}</option>
                <option value="7d">{t('7 derniers jours', 'Last 7 days')}</option>
                <option value="30d">{t('30 derniers jours', 'Last 30 days')}</option>
              </select>
              <button onClick={() => void fetchAiHealth()} className="rounded border px-3 py-1 text-xs font-semibold">{t('Rafraîchir', 'Refresh')}</button>
            </div>
          </div>

          {aiHealthStatus ? <p className="text-sm text-red-600">{aiHealthStatus}</p> : null}

          {activeAiWindow ? (
            <>
              <div className="grid gap-3 md:grid-cols-5">
                <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{t('Chats lancés', 'Chats launched')}</p><p className="text-xl font-bold">{aiKpis.chatsLaunched}</p></div>
                <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{t('Fiches générées', 'Generated listings')}</p><p className="text-xl font-bold">{aiKpis.generatedSheets}</p></div>
                <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{t('Produits suspects', 'Suspect listings')}</p><p className="text-xl font-bold">{aiKpis.suspectListings}</p></div>
                <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{t('Consultations délai', 'Delivery estimate views')}</p><p className="text-xl font-bold">{aiKpis.deliveryConsultations}</p></div>
                <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{t('Clics recommandations', 'Recommendation clicks')}</p><p className="text-xl font-bold">{aiKpis.recommendationClicks}</p></div>
              </div>

              <div className="grid gap-3 md:grid-cols-5">
                <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{t('Requêtes IA', 'AI requests')}</p><p className="text-xl font-bold">{activeAiWindow.totalRequests}</p></div>
                <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{t('Fallbacks', 'Fallbacks')}</p><p className="text-xl font-bold">{activeAiWindow.totalFallbacks}</p></div>
                <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{t('Erreurs', 'Errors')}</p><p className="text-xl font-bold">{activeAiWindow.totalErrors}</p></div>
                <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{t('Taux fallback', 'Fallback rate')}</p><p className="text-xl font-bold">{activeAiWindow.fallbackRate}%</p></div>
                <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{t('Taux erreur', 'Error rate')}</p><p className="text-xl font-bold">{activeAiWindow.errorRate}%</p></div>
              </div>

              <div className="rounded-lg border bg-slate-50 p-3">
                <p className="text-sm font-semibold">{t('Alertes', 'Alerts')}</p>
                <div className="mt-2 space-y-2 text-sm">
                  {aiAlerts.map((alert) => (
                    <p key={alert.id} className={`rounded px-2 py-1 ${alert.level === 'critical' ? 'bg-red-100 text-red-700' : alert.level === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      [{alert.level.toUpperCase()}] {alert.message}
                    </p>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-slate-500">
                      <th className="py-2">Endpoint</th>
                      <th className="py-2">{t('Requêtes', 'Requests')}</th>
                      <th className="py-2">{t('Fallbacks', 'Fallbacks')}</th>
                      <th className="py-2">{t('Erreurs', 'Errors')}</th>
                      <th className="py-2">{t('Taux fallback', 'Fallback rate')}</th>
                      <th className="py-2">{t('Dernière requête', 'Last request')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeAiWindow.modules.map((module) => (
                      <tr key={module.route} className="border-b">
                        <td className="py-2 font-mono text-xs">{module.route}</td>
                        <td className="py-2">{module.requests}</td>
                        <td className="py-2">{module.fallbacks}</td>
                        <td className="py-2">{module.errors}</td>
                        <td className="py-2">{module.fallbackRate}%</td>
                        <td className="py-2">{module.lastRequestAt ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">{t('Aucune donnée IA pour le moment.', 'No AI health data yet.')}</p>
          )}
        </div>
      ) : null}

      {activeTab === 'overview' ? (
        <>
          <div className="grid gap-3 md:grid-cols-5">
            <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">{t('Utilisateurs', 'Users')}</p><p className="text-xl font-bold">{users.length}</p></div>
            <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">{t('Vendeurs actifs', 'Active sellers')}</p><p className="text-xl font-bold">{sellers.length}</p></div>
            <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">{t('Vendeurs badges', 'Sellers with badge')}</p><p className="text-xl font-bold">{withBadge}</p></div>
            <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">{t('Sans badge', 'Without badge')}</p><p className="text-xl font-bold">{withoutBadge}</p></div>
            <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">{t('Visites site', 'Site visits')}</p><p className="text-xl font-bold">{siteVisits}</p></div>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <h2 className="text-xl font-semibold">{t('Notifications transactions', 'Transaction notifications')}</h2>
            <div className="mt-3 space-y-2 text-sm">
              {adminNotifications.slice(0, 10).map((item) => (
                <p key={item.id} className="rounded-lg border px-3 py-2">{item.createdAt} - {item.message}</p>
              ))}
              {adminNotifications.length === 0 ? <p className="text-slate-500">{t('Aucune notification pour le moment.', 'No notifications yet.')}</p> : null}
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <h2 className="text-xl font-semibold">{t('Commentaires plateforme', 'Platform comments')}</h2>
            <div className="mt-3 space-y-3 text-sm">
              {testimonials.slice(0, 8).map((item) => (
                <article key={item.id} className="rounded-lg border p-3">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.city}, {item.country}</p>
                  <p className="text-xs text-amber-600">{item.rating}/5</p>
                  <p className="mt-1 text-slate-600">{item.comment}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <h2 className="text-xl font-semibold">{t('Analyse ventes et CA', 'Sales and revenue analysis')}</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-4">
              <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="rounded-lg border px-3 py-2" />
              <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="rounded-lg border px-3 py-2" />
              <select value={countryFilter} onChange={(event) => setCountryFilter(event.target.value)} className="rounded-lg border px-3 py-2">
                <option value="">{t('Toutes régions', 'All regions')}</option>
                {['Cameroun', 'Cote d\'Ivoire', 'Senegal', 'Congo', 'Tchad', 'Nigeria', 'Kenya'].map((entry) => <option key={entry} value={entry}>{entry}</option>)}
              </select>
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-lg border px-3 py-2">
                <option value="">{t('Toutes catégories', 'All categories')}</option>
                {marketplaceCategories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{t('Ventes période', 'Sales in period')}</p><p className="text-xl font-bold">{totalSales}</p></div>
              <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{t('CA période', 'Revenue in period')}</p><p className="text-xl font-bold">{formatPrice(totalRevenue, countryFilter || 'Cameroun')}</p></div>
              <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{t('Plaintes', 'Complaints')}</p><p className="text-xl font-bold">{complaints.length}</p></div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <h2 className="text-xl font-semibold">{t('Entités inscrites', 'Registered entities')}</h2>
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
            <h2 className="text-xl font-semibold">{t('Badge vérification automatique', 'Automatic verification badge')}</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="py-2">{t('Vendeur', 'Seller')}</th>
                    <th className="py-2">{t('Badge', 'Badge')}</th>
                    <th className="py-2">{t('Source badge', 'Badge source')}</th>
                    <th className="py-2">{t('Commandes réussies', 'Successful orders')}</th>
                    <th className="py-2">{t('Satisfaction', 'Satisfaction')}</th>
                    <th className="py-2">{t('Clients satisfaits', 'Satisfied clients')}</th>
                    <th className="py-2">{t('Plaintes', 'Complaints')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sellerTrustRows.map(({ seller, trust }) => (
                    <tr key={seller.id} className="border-b">
                      <td className="py-2">{seller.company}</td>
                      <td className="py-2">{trust.hasBadge ? (trust.badgeSource === 'admin' ? t('Vérifié Min-shop (provisoire)', 'Min-shop Verified (provisional)') : t('Vérifié Min-shop', 'Min-shop Verified')) : t('Sans badge', 'No badge')}</td>
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
              <button className="rounded-lg bg-dark px-4 py-2 font-semibold text-white">{t('Mettre à jour le rôle', 'Update role')}</button>
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
              <input name="oldPrice" type="number" min="1" placeholder={t('Prix avant réduction (optionnel)', 'Price before discount (optional)')} className="rounded-lg border px-3 py-2" />
              <input required name="stock" type="number" min="0" placeholder={t('Stock', 'Stock')} className="rounded-lg border px-3 py-2" />
              <select name="categorySlug" className="rounded-lg border px-3 py-2">
                {marketplaceCategories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.label}
                  </option>
                ))}
              </select>
              <select name="kind" className="rounded-lg border px-3 py-2">
                <option value="product">{t('Produit', 'Product')}</option>
                <option value="service">Service</option>
              </select>
              <input name="serviceDuration" placeholder={t('Durée service (optionnel)', 'Service duration (optional)')} className="rounded-lg border px-3 py-2" />
              <input name="serviceAvailability" placeholder={t('Disponibilité service (optionnel)', 'Service availability (optional)')} className="rounded-lg border px-3 py-2" />
              <input name="targetCountries" placeholder={t('Pays cibles (virgules)', 'Target countries (comma separated)')} className="rounded-lg border px-3 py-2 md:col-span-2" />
              <input name="images" placeholder={t('URLs images (virgule)', 'Image URLs (comma separated)')} className="rounded-lg border px-3 py-2" />
              <textarea required name="description" placeholder={t('Description produit/service', 'Product/service description')} className="h-20 rounded-lg border px-3 py-2 md:col-span-3" />
              <button className="rounded-lg bg-dark px-4 py-2 font-semibold text-white md:col-span-3">{t('Ajouter offre (admin)', 'Add offer (admin)')}</button>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <select value={trustFilter} onChange={(event) => setTrustFilter(event.target.value as TrustFilter)} className="rounded border px-2 py-1">
                <option value="all">{t('Tous statuts', 'All statuses')}</option>
                <option value="valid">valid</option>
                <option value="needs_review">needs_review</option>
                <option value="suspect">suspect</option>
              </select>
              <select value={trustSort} onChange={(event) => setTrustSort(event.target.value as TrustSort)} className="rounded border px-2 py-1">
                <option value="suspect_first">{t('Priorité suspects', 'Suspects first')}</option>
                <option value="score_asc">{t('Score croissant', 'Score ascending')}</option>
                <option value="score_desc">{t('Score décroissant', 'Score descending')}</option>
              </select>
              <span className="rounded border px-2 py-1 text-slate-600">{filteredTrustRows.length} {t('offres affichées', 'offers shown')}</span>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[1100px] text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="py-2">{t('Offre', 'Offer')}</th>
                    <th className="py-2">{t('Type', 'Type')}</th>
                    <th className="py-2">{t('Vendeur', 'Seller')}</th>
                    <th className="py-2">{t('Prix', 'Price')}</th>
                    <th className="py-2">{t('Stock', 'Stock')}</th>
                    <th className="py-2">{t('Confiance listing', 'Listing trust')}</th>
                    <th className="py-2">{t('Statut', 'Status')}</th>
                    <th className="py-2">{t('Actions admin', 'Admin actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrustRows.map(({ product, trust }) => (
                    <tr key={product.id} className={`border-b ${trust.status === 'suspect' ? 'bg-red-50/60' : ''}`}>
                      <td className="py-2">{product.name}</td>
                      <td className="py-2">{product.kind === 'service' ? t('Service', 'Service') : t('Produit', 'Product')}</td>
                      <td className="py-2">{product.companyName}</td>
                      <td className="py-2">
                        <div className="flex flex-col">
                          <span>{formatPrice(product.price)}</span>
                          {product.oldPrice ? <span className="text-xs text-slate-400 line-through">{formatPrice(product.oldPrice)}</span> : null}
                        </div>
                      </td>
                      <td className="py-2">{product.stock}</td>
                      <td className="py-2 font-semibold">{trust.score}/100</td>
                      <td className="py-2">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${trust.status === 'valid' ? 'bg-emerald-100 text-emerald-700' : trust.status === 'needs_review' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {trust.status}
                        </span>
                      </td>
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
        </>
      ) : null}
    </section>
  );
}
