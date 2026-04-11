'use client';

import Link from 'next/link';
import { SellerLayout } from '@/components/seller-layout';
import { useSite } from '@/components/site-context';
import { getSellerTrustStats } from '@/lib/mock-marketplace';

export default function SellerProfilePage() {
  const { sessionUser, sellers, products, orders, reviews, complaints } = useSite();
  const seller = sellers.find((entry) => entry.id === sessionUser?.sellerId);
  const trust = seller ? getSellerTrustStats(seller, products, reviews, orders, complaints) : null;

  return (
    <SellerLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Profil vendeur</h1>

        <div className="rounded-xl border bg-white p-5 text-sm">
          <p><span className="font-semibold">Type:</span> {seller?.sellerType ?? '-'}</p>
          <p><span className="font-semibold">Boutique:</span> {seller?.company ?? '-'}</p>
          <p><span className="font-semibold">Nom:</span> {seller?.name ?? '-'}</p>
          <p><span className="font-semibold">Email:</span> {seller?.email ?? '-'}</p>
          <p><span className="font-semibold">Telephone:</span> {seller?.phone ?? '-'}</p>
          <p><span className="font-semibold">Ville/Pays:</span> {seller?.city}, {seller?.country}</p>
          <p><span className="font-semibold">Badge:</span> {trust?.hasBadge ? (trust.badgeSource === 'admin' ? 'Verifie Min-shop (provisoire)' : 'Verifie Min-shop') : 'Sans badge'}</p>
          <p><span className="font-semibold">Clients satisfaits:</span> {(trust?.satisfiedClients ?? 0) > 0 ? trust?.satisfiedClients : 'Donnees en cours'}</p>
          <p><span className="font-semibold">Satisfaction:</span> {trust?.satisfactionRate ?? 0}%</p>
          <p className="mt-2 text-slate-600">{seller?.about}</p>

          <Link href="/profile" className="mt-4 inline-block rounded-lg bg-dark px-4 py-2 font-semibold text-white">
            Modifier mon profil
          </Link>
        </div>
      </div>
    </SellerLayout>
  );
}
