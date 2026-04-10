'use client';

import Link from 'next/link';
import { ShoppingCart, MessageCircle, Globe2, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { africaCountries } from '@/lib/mock-marketplace';
import { useSite } from '@/components/site-context';

const WHATSAPP_NUMBER = '237692714985';

export function Navbar() {
  const [count, setCount] = useState(0);
  const { locale, setLocale, country, city, setCountry, setCity, availableCities, sessionUser, logout, t } = useSite();

  useEffect(() => {
    const sync = () => {
      const raw = localStorage.getItem('min-shop-cart');
      const items = raw ? JSON.parse(raw) : [];
      setCount(items.reduce((acc: number, item: { quantity: number }) => acc + item.quantity, 0));
    };

    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('cart:update', sync as EventListener);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('cart:update', sync as EventListener);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <nav className="section flex flex-col gap-3 py-3 md:h-20 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-xl font-black text-dark">
            Min-shop
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 px-2 py-1 text-xs">
            <Globe2 size={14} />
            <button
              onClick={() => setLocale('fr')}
              className={`rounded-full px-2 py-1 ${locale === 'fr' ? 'bg-dark text-white' : 'text-slate-600'}`}
            >
              FR
            </button>
            <button
              onClick={() => setLocale('en')}
              className={`rounded-full px-2 py-1 ${locale === 'en' ? 'bg-dark text-white' : 'text-slate-600'}`}
            >
              EN
            </button>
          </div>
        </div>

        <div className="grid w-full gap-2 md:w-auto md:grid-cols-2">
          <select
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {africaCountries.map((entry) => (
              <option key={entry.country} value={entry.country}>
                {entry.country}
              </option>
            ))}
          </select>
          <select value={city} onChange={(event) => setCity(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            {availableCities.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-700">
          <Link href="/shop">{t('Boutique', 'Shop')}</Link>

          <details className="relative">
            <summary className="cursor-pointer list-none rounded-lg border px-3 py-1.5">{t('Categories', 'Categories')}</summary>
            <div className="absolute right-0 mt-2 w-44 rounded-xl border bg-white p-2 shadow-xl">
              <Link href="/sellers" className="block rounded-lg px-3 py-2 hover:bg-slate-100">
                {t('Vendeurs', 'Vendors')}
              </Link>
              <Link href="/dropshippers" className="block rounded-lg px-3 py-2 hover:bg-slate-100">
                Dropshippers
              </Link>
            </div>
          </details>

          <Link href="/about">{t('A propos', 'About')}</Link>
          <Link href="/contact">{t('Contact', 'Contact')}</Link>
          {sessionUser?.role === 'admin' && <Link href="/admin">Admin</Link>}

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            className="hidden items-center gap-1 rounded-full border px-3 py-1.5 md:flex"
          >
            <MessageCircle size={14} /> WhatsApp
          </a>

          <Link href="/cart" className="relative">
            <ShoppingCart size={20} />
            {count > 0 && <span className="absolute -right-2 -top-2 rounded-full bg-accent px-1.5 text-xs text-white">{count}</span>}
          </Link>

          {sessionUser ? (
            <div className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs">
              <UserRound size={14} />
              <span>{sessionUser.name}</span>
              <button onClick={logout} className="font-semibold text-brand-700">
                {t('Deconnexion', 'Logout')}
              </button>
            </div>
          ) : (
            <Link href="/auth/login" className="rounded-full border px-3 py-1.5 text-xs font-semibold">
              {t('Connexion', 'Login')}
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
