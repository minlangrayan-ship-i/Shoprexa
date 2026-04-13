'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSite } from '@/components/site-context';
import { getSellerTrustStats } from '@/lib/mock-marketplace';

const links = [
  { href: '/seller/dashboard', fr: 'Tableau de bord', en: 'Dashboard' },
  { href: '/seller/products', fr: 'Gestion produits', en: 'Product management' },
  { href: '/seller/ai-generator', fr: 'Assistant fiches', en: 'Listing assistant' },
  { href: '/seller/stock', fr: 'Gestion stock', en: 'Stock management' },
  { href: '/seller/orders', fr: 'Commandes', en: 'Orders' },
  { href: '/seller/stats', fr: 'Statistiques', en: 'Statistics' },
  { href: '/seller/profile', fr: 'Profil vendeur', en: 'Seller profile' }
];

export function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { sessionUser, sellers, products, orders, reviews, complaints, t } = useSite();

  if (!sessionUser || sessionUser.role !== 'seller') {
    return (
      <section className="section py-12">
        <div className="card p-6">{t('Acces vendeur requis.', 'Seller access required.')}</div>
      </section>
    );
  }

  const currentSeller = sellers.find((seller) => seller.id === sessionUser.sellerId);
  const trust = currentSeller ? getSellerTrustStats(currentSeller, products, reviews, orders, complaints) : null;
  const showProfileWarning = Boolean(currentSeller) && !trust?.profileAccessible;

  return (
    <section className="section py-10">
      {showProfileWarning ? (
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">{t('Profil vendeur incomplet', 'Incomplete seller profile')}</p>
          <p className="mt-1">
            {t(
              'Votre profil n est pas encore finalise. Tant qu il n est pas valide, il ne sera accessible a personne sur la plateforme.',
              'Your seller profile is not finalized yet. Until it is validated, it will not be accessible to anyone on the platform.'
            )}
          </p>
          <Link href="/profile" className="mt-3 inline-block rounded-lg bg-dark px-3 py-2 text-xs font-semibold text-white">
            {t('Finaliser mon profil', 'Complete my profile')}
          </Link>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">{t('Espace vendeur', 'Seller area')}</p>
          <p className="mt-1 text-sm font-semibold">{sessionUser.name}</p>
          <nav className="mt-4 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-lg px-3 py-2 text-sm ${pathname === link.href ? 'bg-dark text-white' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                {t(link.fr, link.en)}
              </Link>
            ))}
          </nav>
        </aside>

        <div>{children}</div>
      </div>
    </section>
  );
}
