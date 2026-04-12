'use client';

import Link from 'next/link';
import { SellerLayout } from '@/components/seller-layout';
import { useSite } from '@/components/site-context';
import { getSellerTrustStats } from '@/lib/mock-marketplace';

export default function SellerProfilePage() {
  const { sessionUser, sellers, products, orders, reviews, complaints, t } = useSite();
  const seller = sellers.find((entry) => entry.id === sessionUser?.sellerId);
  const trust = seller ? getSellerTrustStats(seller, products, reviews, orders, complaints) : null;

  return (
    <SellerLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t('Profil vendeur', 'Seller profile')}</h1>

        <div className="rounded-xl border bg-white p-5 text-sm">
          <p><span className="font-semibold">{t('Type', 'Type')}:</span> {seller?.sellerType ?? '-'}</p>
          <p><span className="font-semibold">{t('Boutique', 'Store')}:</span> {seller?.company ?? '-'}</p>
          <p><span className="font-semibold">{t('Nom', 'Name')}:</span> {seller?.name ?? '-'}</p>
          <p><span className="font-semibold">{t('Email', 'Email')}:</span> {seller?.email ?? '-'}</p>
          <p><span className="font-semibold">{t('Téléphone', 'Phone')}:</span> {seller?.phone ?? '-'}</p>
          <p><span className="font-semibold">{t('Ville/Pays', 'City/Country')}:</span> {seller?.city}, {seller?.country}</p>
          <p><span className="font-semibold">{t('Badge', 'Badge')}:</span> {trust?.hasBadge ? (trust.badgeSource === 'admin' ? t('Vérifié Min-shop (provisoire)', 'Min-shop Verified (provisional)') : t('Vérifié Min-shop', 'Min-shop Verified')) : t('Sans badge', 'No badge')}</p>
          <p><span className="font-semibold">{t('Clients satisfaits', 'Satisfied clients')}:</span> {(trust?.satisfiedClients ?? 0) > 0 ? trust?.satisfiedClients : t('Données en cours', 'Data in progress')}</p>
          <p><span className="font-semibold">{t('Satisfaction', 'Satisfaction')}:</span> {trust?.satisfactionRate ?? 0}%</p>
          <p className="mt-2 text-slate-600">{seller?.about}</p>

          <Link href="/profile" className="mt-4 inline-block rounded-lg bg-dark px-4 py-2 font-semibold text-white">
            {t('Modifier mon profil', 'Edit my profile')}
          </Link>
        </div>
      </div>
    </SellerLayout>
  );
}
