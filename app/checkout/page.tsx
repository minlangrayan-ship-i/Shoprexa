'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { CartItem } from '@/lib/types';
import { estimateDelivery, formatPrice } from '@/lib/utils';
import { paymentProviders } from '@/lib/payment';
import { useSite } from '@/components/site-context';
import { africaCountries } from '@/lib/mock-marketplace';
import Link from 'next/link';

export default function CheckoutPage() {
  const { country, city, products, sessionUser, t } = useSite();
  const [items, setItems] = useState<CartItem[]>([]);
  const [clientCountry, setClientCountry] = useState(country);
  const [clientCity, setClientCity] = useState(city);
  const [status, setStatus] = useState('');
  const total = useMemo(() => items.reduce((acc, i) => acc + i.price * i.quantity, 0), [items]);

  const sellerZone = useMemo(() => {
    const first = items[0];
    const product = products.find((entry) => entry.id === first?.id);
    return {
      sellerCountry: product?.sellerCountry ?? country,
      sellerCity: product?.sellerCity ?? city
    };
  }, [city, country, items, products]);

  const shipping = useMemo(
    () =>
      estimateDelivery({
        clientCountry,
        clientCity,
        sellerCountry: sellerZone.sellerCountry,
        sellerCity: sellerZone.sellerCity,
        subtotal: total
      }),
    [clientCity, clientCountry, sellerZone.sellerCity, sellerZone.sellerCountry, total]
  );

  const finalTotal = total + shipping.deliveryCost;
  const etaDate = new Date(Date.now() + shipping.etaDays * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR');
  const formCities = useMemo(
    () => africaCountries.find((entry) => entry.country === clientCountry)?.cities ?? [clientCity],
    [clientCity, clientCountry]
  );

  useEffect(() => {
    const raw = localStorage.getItem('min-shop-cart');
    setItems(raw ? JSON.parse(raw) : []);
  }, []);

  useEffect(() => {
    const cities = africaCountries.find((entry) => entry.country === clientCountry)?.cities ?? [];
    if (cities.length > 0 && !cities.includes(clientCity)) {
      setClientCity(cities[0]);
    }
  }, [clientCity, clientCountry]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!sessionUser || sessionUser.role !== 'client') {
      setStatus(t('Commande reservee aux comptes clients.', 'Ordering is reserved for client accounts.'));
      return;
    }
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, items }) });
    if (res.ok) {
      localStorage.removeItem('min-shop-cart');
      window.dispatchEvent(new Event('cart:update'));
      setStatus(t('Commande enregistree. Paiement simule avec succes.', 'Order recorded. Simulated payment completed.'));
      setItems([]);
      e.currentTarget.reset();
    } else {
      setStatus(t('Echec de la commande.', 'Order failed.'));
    }
  };

  return (
    <section className="section py-12">
      <h1 className="text-3xl font-bold">{t('Paiement', 'Checkout')}</h1>
      {!sessionUser || sessionUser.role !== 'client' ? (
        <div className="mt-4 rounded-xl border bg-amber-50 p-4 text-sm text-amber-700">
          <p>{t('Acces checkout reserve aux clients connectes.', 'Checkout access is restricted to logged-in client accounts.')}</p>
          <Link href="/auth/login" className="mt-2 inline-block rounded-lg border border-amber-400 px-3 py-1 font-semibold">
            {t('Se connecter', 'Login')}
          </Link>
        </div>
      ) : null}
      <div className="mt-6 grid gap-8 md:grid-cols-[1fr_320px]">
        <form onSubmit={onSubmit} className="card space-y-3 p-6">
          <input required name="customerName" placeholder={t('Nom complet', 'Full name')} className="w-full rounded-lg border px-3 py-2" />
          <input required type="email" name="customerEmail" placeholder="Email" className="w-full rounded-lg border px-3 py-2" />
          <input required name="customerPhone" placeholder={t('Telephone', 'Phone')} className="w-full rounded-lg border px-3 py-2" />

          <select value={clientCountry} onChange={(event) => setClientCountry(event.target.value)} className="w-full rounded-lg border px-3 py-2">
            {['Cameroun', 'Cote d\'Ivoire', 'Senegal', 'Congo', 'Tchad', 'Nigeria', 'Kenya'].map((entry) => (
              <option key={entry} value={entry}>{entry}</option>
            ))}
          </select>

          <select value={clientCity} onChange={(event) => setClientCity(event.target.value)} className="w-full rounded-lg border px-3 py-2">
            {formCities.map((entry) => (
              <option key={entry} value={entry}>{entry}</option>
            ))}
          </select>

          <textarea required name="shippingAddress" placeholder={t('Adresse de livraison', 'Shipping address')} className="h-24 w-full rounded-lg border px-3 py-2" />
          <select name="paymentProvider" className="w-full rounded-lg border px-3 py-2">{paymentProviders.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}</select>

          <div className="rounded-lg bg-slate-50 p-3 text-sm">
            <p>{t('Moyen de transport', 'Transport mode')}: <span className="font-semibold">{shipping.transport}</span></p>
            <p>{t('Delai estime', 'Estimated delay')}: <span className="font-semibold">{shipping.delay}</span></p>
            <p>{t('Date estimee de livraison', 'Estimated delivery date')}: <span className="font-semibold">{etaDate}</span></p>
            <p>{t('Cout livraison', 'Delivery cost')}: <span className="font-semibold">{formatPrice(shipping.deliveryCost, clientCountry)}</span></p>
          </div>

          <button disabled={!sessionUser || sessionUser.role !== 'client'} className="rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{t('Valider la commande', 'Confirm order')}</button>
          {status && <p className="text-sm">{status}</p>}
        </form>

        <aside className="card h-fit p-5">
          <h2 className="font-semibold">{t('Resume commande', 'Order summary')}</h2>
          <div className="mt-3 space-y-2 text-sm">{items.map((i) => <p key={i.id}>{i.name} x{i.quantity}</p>)}</div>
          <p className="mt-3 text-sm">{t('Sous-total', 'Subtotal')}: {formatPrice(total, clientCountry)}</p>
          <p className="text-sm">{t('Livraison', 'Shipping')}: {formatPrice(shipping.deliveryCost, clientCountry)}</p>
          <p className="mt-4 text-xl font-bold">{formatPrice(finalTotal, clientCountry)}</p>
        </aside>
      </div>
    </section>
  );
}
