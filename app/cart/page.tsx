'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CartItem } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
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
      <h1 className="text-3xl font-bold">Votre panier</h1>
      {items.length === 0 ? <p className="mt-6">Panier vide.</p> : (
        <div className="mt-6 grid gap-8 md:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {items.map((i) => (
              <div key={i.id} className="card flex items-center justify-between p-4">
                <div><p className="font-semibold">{i.name}</p><p className="text-sm text-slate-500">{formatPrice(i.price)}</p></div>
                <div className="flex items-center gap-2">
                  <button onClick={() => persist(items.map((x) => x.id === i.id ? { ...x, quantity: Math.max(1, x.quantity - 1) } : x))} className="rounded border px-2">-</button>
                  <span>{i.quantity}</span>
                  <button onClick={() => persist(items.map((x) => x.id === i.id ? { ...x, quantity: x.quantity + 1 } : x))} className="rounded border px-2">+</button>
                  <button onClick={() => persist(items.filter((x) => x.id !== i.id))} className="rounded border px-2 text-red-600">Supprimer</button>
                </div>
              </div>
            ))}
          </div>
          <aside className="card h-fit p-5"><p className="text-sm">Total</p><p className="text-2xl font-bold">{formatPrice(total)}</p><a href="/checkout" className="mt-4 block rounded-xl bg-dark px-4 py-2 text-center font-semibold text-white">Passer au checkout</a></aside>
        </div>
      )}
    </section>
  );
}
