'use client';

import Link from 'next/link';
import { useSite } from '@/components/site-context';

export function Footer() {
  const { t } = useSite();

  return (
    <footer className="mt-20 border-t bg-dark text-slate-200">
      <div className="section grid gap-8 py-12 md:grid-cols-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Min-shop</h3>
          <p className="mt-3 text-sm">
            {t(
              'Marketplace mobile-first pour connecter clients, vendeurs et dropshippers avec une expérience fiable et orientée conversion.',
              'Mobile-first marketplace connecting customers, sellers, and dropshippers with a trusted conversion-focused experience.'
            )}
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-white">{t('Plateforme', 'Platform')}</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/shop">{t('Boutique', 'Shop')}</Link></li>
            <li><Link href="/sellers">{t('Vendeurs', 'Sellers')}</Link></li>
            <li><Link href="/dropshippers">Dropshippers</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white">{t('Entreprise', 'Company')}</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/about">{t('À propos', 'About')}</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/auth/login">{t('Connexion', 'Login')}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white">Support</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>+237 692714985</li>
            <li>min-shop@gmail.com</li>
            <li>{t('Basé à Yaoundé, Cameroun', 'Based in Yaounde, Cameroon')}</li>
          </ul>
        </div>
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs">{new Date().getFullYear()} Min-shop. {t('Tous droits réservés.', 'All rights reserved.')}</p>
    </footer>
  );
}
