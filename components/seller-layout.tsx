'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSite } from '@/components/site-context';

const links = [
  { href: '/seller/dashboard', label: 'Tableau de bord' },
  { href: '/seller/products', label: 'Gestion produits' },
  { href: '/seller/stock', label: 'Gestion stock' },
  { href: '/seller/orders', label: 'Commandes' },
  { href: '/seller/stats', label: 'Statistiques' },
  { href: '/seller/profile', label: 'Profil vendeur' }
];

export function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { sessionUser } = useSite();

  if (!sessionUser || sessionUser.role !== 'seller') {
    return <section className="section py-12"><div className="card p-6">Acces vendeur requis.</div></section>;
  }

  return (
    <section className="section py-10">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Espace vendeur</p>
          <p className="mt-1 text-sm font-semibold">{sessionUser.name}</p>
          <nav className="mt-4 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-lg px-3 py-2 text-sm ${pathname === link.href ? 'bg-dark text-white' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div>{children}</div>
      </div>
    </section>
  );
}
