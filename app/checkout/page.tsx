'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { CartItem } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { paymentProviders } from '@/lib/payment';

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [status, setStatus] = useState('');
  const total = useMemo(() => items.reduce((acc, i) => acc + i.price * i.quantity, 0), [items]);

  useEffect(() => {
    const raw = localStorage.getItem('min-shop-cart');
    setItems(raw ? JSON.parse(raw) : []);
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, items }) });
    if (res.ok) {
      localStorage.removeItem('min-shop-cart');
      window.dispatchEvent(new Event('cart:update'));
      setStatus('Commande enregistrée. Paiement simulé avec succès.');
      setItems([]);
      e.currentTarget.reset();
    } else setStatus('Échec de la commande.');
  };

  return (
    <section className="section py-12">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <div className="mt-6 grid gap-8 md:grid-cols-[1fr_320px]">
        <form onSubmit={onSubmit} className="card space-y-3 p-6">
          <input required name="customerName" placeholder="Nom complet" className="w-full rounded-lg border px-3 py-2" />
          <input required type="email" name="customerEmail" placeholder="Email" className="w-full rounded-lg border px-3 py-2" />
          <input required name="customerPhone" placeholder="Téléphone" className="w-full rounded-lg border px-3 py-2" />
          <textarea required name="shippingAddress" placeholder="Adresse de livraison" className="h-24 w-full rounded-lg border px-3 py-2" />
          <select name="paymentProvider" className="w-full rounded-lg border px-3 py-2">{paymentProviders.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}</select>
          <button className="rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white">Valider la commande</button>
          {status && <p className="text-sm">{status}</p>}
        </form>
        <aside className="card h-fit p-5"><h2 className="font-semibold">Résumé commande</h2><div className="mt-3 space-y-2 text-sm">{items.map((i) => <p key={i.id}>{i.name} x{i.quantity}</p>)}</div><p className="mt-4 text-xl font-bold">{formatPrice(total)}</p></aside>
      </div>
    </section>
  );
}
