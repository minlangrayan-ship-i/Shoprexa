'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function PaymentReturnContent() {
  const searchParams = useSearchParams();
  const status = (searchParams.get('status') ?? '').toLowerCase();
  const orderId = searchParams.get('orderId');
  const provider = searchParams.get('provider');

  const isSuccess = status === 'successful' || status === 'success' || status === 'completed';

  return (
    <section className="section py-14">
      <div className="mx-auto max-w-xl rounded-2xl border bg-white p-7 shadow-sm">
        <h1 className="text-2xl font-bold">
          {isSuccess ? 'Paiement en cours de verification' : 'Retour de paiement enregistre'}
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Notre serveur verifie toujours la transaction via webhook avant de confirmer la commande.
        </p>
        <div className="mt-4 space-y-1 text-sm">
          <p>Provider: {provider ?? '-'}</p>
          <p>Order ID: {orderId ?? '-'}</p>
        </div>
        <div className="mt-6 flex gap-2">
          <Link href="/client/home" className="rounded-lg bg-dark px-4 py-2 text-sm font-semibold text-white">
            Retour a l accueil client
          </Link>
          <Link href="/shop" className="rounded-lg border px-4 py-2 text-sm font-semibold">
            Continuer les achats
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense
      fallback={
        <section className="section py-14">
          <div className="mx-auto max-w-xl rounded-2xl border bg-white p-7 shadow-sm text-sm text-slate-600">
            Chargement du statut de paiement...
          </div>
        </section>
      }
    >
      <PaymentReturnContent />
    </Suspense>
  );
}
