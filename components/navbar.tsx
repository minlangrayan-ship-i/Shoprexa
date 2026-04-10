'use client';

import Link from 'next/link';
import { ShoppingCart, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Navbar() {
  const [count, setCount] = useState(0);

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
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <nav className="section flex h-16 items-center justify-between">
        <Link href="/" className="text-xl font-bold text-dark">Min-shop</Link>
        <div className="flex items-center gap-5 text-sm font-medium text-slate-700">
          <Link href="/shop">Boutique</Link>
          <Link href="/sellers">Vendeurs</Link>
          <Link href="/about">À propos</Link>
          <Link href="/contact">Contact</Link>
          <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '237690000000'}`} className="hidden items-center gap-1 rounded-full border px-3 py-1.5 md:flex"><MessageCircle size={14} /> WhatsApp</a>
          <Link href="/cart" className="relative">
            <ShoppingCart size={20} />
            {count > 0 && <span className="absolute -right-2 -top-2 rounded-full bg-accent px-1.5 text-xs text-white">{count}</span>}
          </Link>
        </div>
      </nav>
    </header>
  );
}
