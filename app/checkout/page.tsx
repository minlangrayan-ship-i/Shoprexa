'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { CartItem } from '@/lib/types';
import { estimateDelivery, formatPrice } from '@/lib/utils';
import { paymentProviders } from '@/lib/payment';
import { useSite } from '@/components/site-context';
import { getCityDistricts, getDeliveryInfo, getLaunchCities, launchCountryName } from '@/lib/geo-config';
import type { Locale } from '@/types/marketplace-ai';

function fieldLabel(locale: Locale, key: string) {
  const mapFr: Record<string, string> = {
    customerName: 'nom complet',
    customerEmail: 'email',
    customerPhone: 'telephone',
    shippingAddress: 'adresse de livraison',
    paymentProvider: 'mode de paiement',
    items: 'panier'
  };
  const mapEn: Record<string, string> = {
    customerName: 'full name',
    customerEmail: 'email',
    customerPhone: 'phone',
    shippingAddress: 'shipping address',
    paymentProvider: 'payment method',
    items: 'cart'
  };
  return locale === 'fr' ? mapFr[key] ?? key : mapEn[key] ?? key;
}

function parseOrderErrorMessage(locale: Locale, httpStatus: number, payload: unknown) {
  const data = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null;
  const rawError = data?.error;

  if (httpStatus === 400 && rawError && typeof rawError === 'object') {
    const fieldErrors = (rawError as { fieldErrors?: Record<string, string[]> }).fieldErrors ?? {};
    const failingFields = Object.entries(fieldErrors)
      .filter(([, messages]) => Array.isArray(messages) && messages.length > 0)
      .map(([key]) => fieldLabel(locale, key));

    if (failingFields.length > 0) {
      return locale === 'fr'
        ? `Commande refusee: verifie ${failingFields.join(', ')}.`
        : `Order rejected: please check ${failingFields.join(', ')}.`;
    }

    return locale === 'fr'
      ? 'Commande refusee: certaines informations sont invalides.'
      : 'Order rejected: some information is invalid.';
  }

  if (httpStatus === 401) {
    return locale === 'fr'
      ? 'Commande refusee: connecte-toi avec un compte client.'
      : 'Order rejected: log in with a client account.';
  }

  if (httpStatus === 403) {
    return locale === 'fr'
      ? 'Commande refusee: ton compte ne peut pas effectuer cette action.'
      : 'Order rejected: your account is not allowed to do this.';
  }

  if (httpStatus >= 500) {
    return locale === 'fr'
      ? 'Serveur indisponible, reessaie dans quelques minutes.'
      : 'Server unavailable, please try again in a few minutes.';
  }

  return locale === 'fr' ? 'Echec de la commande.' : 'Order failed.';
}

function parsePaymentErrorMessage(locale: Locale, httpStatus: number, payload: unknown) {
  const data = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null;
  const code = typeof data?.error === 'string' ? data.error : '';

  if (code === 'order_not_found') {
    return locale === 'fr'
      ? 'Paiement refuse: commande introuvable.'
      : 'Payment rejected: order not found.';
  }
  if (code === 'forbidden_order') {
    return locale === 'fr'
      ? 'Paiement refuse: cette commande ne t appartient pas.'
      : 'Payment rejected: this order does not belong to you.';
  }
  if (code === 'payment_checkout_unavailable') {
    return locale === 'fr'
      ? 'Commande creee, mais le service de paiement est temporairement indisponible.'
      : 'Order created, but the payment service is temporarily unavailable.';
  }

  if (httpStatus === 400) {
    return locale === 'fr'
      ? 'Paiement refuse: informations de paiement invalides.'
      : 'Payment rejected: invalid payment information.';
  }
  if (httpStatus === 401 || httpStatus === 403) {
    return locale === 'fr'
      ? 'Paiement refuse: autorisation insuffisante.'
      : 'Payment rejected: insufficient authorization.';
  }
  if (httpStatus >= 500) {
    return locale === 'fr'
      ? 'Serveur paiement indisponible, reessaie plus tard.'
      : 'Payment server unavailable, please try later.';
  }

  return locale === 'fr'
    ? 'Commande creee mais paiement indisponible.'
    : 'Order created but payment is unavailable.';
}

export default function CheckoutPage() {
  const { country, city, products, sessionUser, recordClientOrder, t, locale } = useSite();
  const [items, setItems] = useState<CartItem[]>([]);
  const [clientCountry] = useState(launchCountryName);
  const [clientCity, setClientCity] = useState(city);
  const [clientDistrict, setClientDistrict] = useState(getCityDistricts(city)[0] ?? '');
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
  const formCities = useMemo(() => getLaunchCities(), []);
  const formDistricts = useMemo(() => getCityDistricts(clientCity), [clientCity]);
  const deliveryInfo = useMemo(() => getDeliveryInfo(clientCity, clientDistrict), [clientCity, clientDistrict]);

  useEffect(() => {
    const raw = localStorage.getItem('min-shop-cart');
    setItems(raw ? JSON.parse(raw) : []);
  }, []);

  useEffect(() => {
    const cities = getLaunchCities();
    if (cities.length > 0 && !cities.includes(clientCity)) {
      setClientCity(cities[0]);
    }
  }, [clientCity, clientCountry]);

  useEffect(() => {
    const nextDistricts = getCityDistricts(clientCity);
    if (nextDistricts.length > 0 && !nextDistricts.includes(clientDistrict)) {
      setClientDistrict(nextDistricts[0]);
    }
  }, [clientCity, clientDistrict]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!sessionUser || sessionUser.role !== 'client') {
      setStatus(t('Commande reservee aux comptes clients.', 'Ordering is reserved for client accounts.'));
      return;
    }

    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const orderRes = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, country: launchCountryName, city: clientCity, district: clientDistrict, currency: 'XAF', items })
    });

    if (!orderRes.ok) {
      let payload: unknown = null;
      try {
        payload = await orderRes.json();
      } catch {
        payload = null;
      }
      setStatus(parseOrderErrorMessage(locale, orderRes.status, payload));
      return;
    }

    const orderPayload = (await orderRes.json()) as {
      id: string;
      paymentProvider: 'MOCK' | 'FLUTTERWAVE' | 'CINETPAY' | 'PAYSTACK';
    };

    const paymentRes = await fetch('/api/payments/create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: orderPayload.id, provider: orderPayload.paymentProvider })
    });

    if (!paymentRes.ok) {
      let payload: unknown = null;
      try {
        payload = await paymentRes.json();
      } catch {
        payload = null;
      }
      setStatus(parsePaymentErrorMessage(locale, paymentRes.status, payload));
      return;
    }

    const paymentPayload = (await paymentRes.json()) as { checkoutUrl?: string | null; alreadyPaid?: boolean };
    if (paymentPayload.alreadyPaid) {
      recordClientOrder(items);
      localStorage.removeItem('min-shop-cart');
      window.dispatchEvent(new Event('cart:update'));
      setStatus(t('Commande payee et confirmee.', 'Order paid and confirmed.'));
      setItems([]);
      e.currentTarget.reset();
      return;
    }

    if (paymentPayload.checkoutUrl) {
      window.location.href = paymentPayload.checkoutUrl;
      return;
    }

    setStatus(t('Lien de paiement introuvable.', 'Payment link is missing.'));
  };

  return (
    <section className="section py-12">
      <h1 className="text-3xl font-bold">{t('Paiement', 'Checkout')}</h1>
      {!sessionUser || sessionUser.role !== 'client' ? (
        <div className="mt-4 rounded-xl border bg-amber-50 p-4 text-sm text-amber-700">
          <p>{t('Acces au paiement reserve aux clients connectes.', 'Checkout access is restricted to logged-in client accounts.')}</p>
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

          <select value={clientCountry} disabled className="w-full rounded-lg border bg-slate-50 px-3 py-2 text-slate-600">
            <option value={launchCountryName}>{launchCountryName}</option>
          </select>

          <select value={clientCity} onChange={(event) => setClientCity(event.target.value)} className="w-full rounded-lg border px-3 py-2">
            {formCities.map((entry) => (
              <option key={entry} value={entry}>{entry}</option>
            ))}
          </select>

          <select value={clientDistrict} onChange={(event) => setClientDistrict(event.target.value)} className="w-full rounded-lg border px-3 py-2">
            {formDistricts.map((entry) => (
              <option key={entry} value={entry}>{entry}</option>
            ))}
          </select>

          <textarea required name="shippingAddress" placeholder={t('Adresse de livraison', 'Shipping address')} className="h-24 w-full rounded-lg border px-3 py-2" />
          <select name="paymentProvider" className="w-full rounded-lg border px-3 py-2">{paymentProviders.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}</select>

          <div className="rounded-lg bg-slate-50 p-3 text-sm">
            <p>{t('Zone logistique', 'Logistics zone')}: <span className="font-semibold">{deliveryInfo.zoneLogistique}</span></p>
            <p>{t('Moyen de transport', 'Transport mode')}: <span className="font-semibold">{shipping.transport}</span></p>
            <p>{t('Delai estime', 'Estimated delay')}: <span className="font-semibold">{deliveryInfo.estimatedDelay}</span></p>
            <p>{t('Date estimee de livraison', 'Estimated delivery date')}: <span className="font-semibold">{etaDate}</span></p>
            <p>{t('Cout de livraison', 'Delivery cost')}: <span className="font-semibold">{formatPrice(shipping.deliveryCost, clientCountry)}</span></p>
            <p className="text-xs text-slate-500">{deliveryInfo.messageUtilisateur}</p>
          </div>

          <button disabled={!sessionUser || sessionUser.role !== 'client'} className="rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{t('Valider la commande', 'Confirm order')}</button>
          {status && <p className="text-sm">{status}</p>}
        </form>

        <aside className="card h-fit p-5">
          <h2 className="font-semibold">{t('Resume de commande', 'Order summary')}</h2>
          <div className="mt-3 space-y-2 text-sm">{items.map((i) => <p key={i.id}>{i.name} x{i.quantity}</p>)}</div>
          <p className="mt-3 text-sm">{t('Sous-total', 'Subtotal')}: {formatPrice(total, clientCountry)}</p>
          <p className="text-sm">{t('Livraison', 'Shipping')}: {formatPrice(shipping.deliveryCost, clientCountry)}</p>
          <p className="mt-4 text-xl font-bold">{formatPrice(finalTotal, clientCountry)}</p>
        </aside>
      </div>
    </section>
  );
}
