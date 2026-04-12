'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CartItem } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { useSite } from '@/components/site-context';

export default function CartPage() {
  const { country, sessionUser, t } = useSite();
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem('min-shop-cart');
    setItems(raw ? JSON.parse(raw) : []);
  }, []);

  const persist = (next: CartItem[]) => {
    setItems(next);
    localStorage.setItem('min-shop-cart', JSON.stringify(next));
    window.dispatchEvent(new Event('cart:update'));
  };

  const total = useMemo(() => items.reduce((acc, i) => acc + i.price * i.quantity, 0), [items]);

  return (
    <section className="section py-12">
      <h1 className="text-3xl font-bold">{t('Votre panier', 'Your cart')}</h1>
      {!sessionUser || sessionUser.role !== 'client' ? (
        <div className="mt-4 rounded-xl border bg-amber-50 p-4 text-sm text-amber-700">
          <p>{t('Seuls les comptes clients peuvent commander.', 'Only client accounts can place orders.')}</p>
          <Link href="/auth/login" className="mt-2 inline-block rounded-lg border border-amber-400 px-3 py-1 font-semibold">
            {t('Se connecter', 'Login')}
          </Link>
        </div>
      ) : null}
      {items.length === 0 ? <p className="mt-6">{t('Panier vide.', 'Empty cart.')}</p> : (
        <div className="mt-6 grid gap-8 md:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {items.map((i) => (
              <div key={i.id} className="card flex items-center justify-between p-4">
                <div><p className="font-semibold">{i.name}</p><p className="text-sm text-slate-500">{formatPrice(i.price, country)}</p></div>
                <div className="flex items-center gap-2">
                  <button onClick={() => persist(items.map((x) => x.id === i.id ? { ...x, quantity: Math.max(1, x.quantity - 1) } : x))} className="rounded border px-2">-</button>
                  <span>{i.quantity}</span>
                  <button onClick={() => persist(items.map((x) => x.id === i.id ? { ...x, quantity: x.quantity + 1 } : x))} className="rounded border px-2">+</button>
                  <button onClick={() => persist(items.filter((x) => x.id !== i.id))} className="rounded border px-2 text-red-600">{t('Supprimer', 'Remove')}</button>
                </div>
              </div>
            ))}
          </div>
          <aside className="card h-fit p-5">
            <p className="text-sm">{t('Total', 'Total')}</p>
            <p className="text-2xl font-bold">{formatPrice(total, country)}</p>
            {sessionUser && sessionUser.role === 'client' ? (
              <a href="/checkout" className="mt-4 block rounded-xl bg-dark px-4 py-2 text-center font-semibold text-white">{t('Passer au paiement', 'Proceed to checkout')}</a>
            ) : (
              <button disabled className="mt-4 block w-full rounded-xl bg-slate-300 px-4 py-2 text-center font-semibold text-slate-600">
                {t('Commande réservée aux comptes clients', 'Ordering is reserved for client accounts')}
              </button>
            )}
          </aside>
        </div>
      )}
    </section>
  );
}
