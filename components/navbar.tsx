'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Globe2, UserRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSite } from '@/components/site-context';

type NavItem = { href: string; fr: string; en: string };

export function Navbar() {
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  const { locale, setLocale, city, setCity, availableCities, sessionUser, logout, t } = useSite();

  const canAccessDropshipperTab =
    sessionUser?.role === 'admin' ||
    (sessionUser?.role === 'seller' && sessionUser.sellerType === 'dropshipper');

  const navItems = useMemo<NavItem[]>(() => {
    const base: NavItem[] = [
      { href: '/shop', fr: 'Catalogue', en: 'Catalog' },
      { href: '/sellers', fr: 'Vendeurs', en: 'Sellers' },
      { href: '/assistant', fr: 'Shopyia', en: 'Shopyia' },
      { href: '/about', fr: 'À propos', en: 'About' }
    ];

    if (canAccessDropshipperTab) {
      base.splice(2, 0, { href: '/dropshippers', fr: 'Dropshippers', en: 'Dropshippers' });
    }

    return base;
  }, [canAccessDropshipperTab]);

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

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <nav className="section flex flex-col gap-3 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-black tracking-tight text-dark">Min-shop</Link>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-slate-200 px-2 py-1 text-xs">
            <Globe2 size={13} />
            <button onClick={() => setLocale('fr')} className={`rounded-full px-2 py-1 ${locale === 'fr' ? 'bg-dark text-white' : 'text-slate-600'}`}>FR</button>
            <button onClick={() => setLocale('en')} className={`rounded-full px-2 py-1 ${locale === 'en' ? 'bg-dark text-white' : 'text-slate-600'}`}>EN</button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <select value={city} onChange={(event) => setCity(event.target.value)} className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs">
            {availableCities.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
          </select>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Link href="/cart" className="relative rounded-lg border px-2.5 py-1.5 text-xs font-semibold text-slate-700">
              <span className="inline-flex items-center gap-1"><ShoppingCart size={14} /> {t('Panier', 'Cart')}</span>
              {count > 0 ? <span className="absolute -right-1.5 -top-1.5 rounded-full bg-accent px-1.5 text-[10px] text-white">{count}</span> : null}
            </Link>

            {sessionUser ? (
              <>
                {sessionUser.role === 'client' ? <Link href="/client/home" className="rounded-lg border px-2.5 py-1.5 text-xs font-semibold">{t('Accueil client', 'Client home')}</Link> : null}
                {sessionUser.role === 'seller' ? <Link href="/seller/dashboard" className="rounded-lg border px-2.5 py-1.5 text-xs font-semibold">{t('Espace vendeur', 'Seller area')}</Link> : null}
                {sessionUser.role === 'admin' ? <Link href="/admin" className="rounded-lg border px-2.5 py-1.5 text-xs font-semibold">Admin</Link> : null}
                <Link href="/profile" className="rounded-lg border px-2.5 py-1.5 text-xs font-semibold">{t('Profil', 'Profile')}</Link>
                <button onClick={logout} className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold">
                  <UserRound size={12} /> {t('Déconnexion', 'Logout')}
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="rounded-lg border px-2.5 py-1.5 text-xs font-semibold">{t('Connexion', 'Login')}</Link>
                <Link href="/auth/register" className="rounded-lg bg-brand-600 px-2.5 py-1.5 text-xs font-semibold text-white">{t('Inscription', 'Sign up')}</Link>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${isActive(item.href) ? 'bg-dark text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              {t(item.fr, item.en)}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
