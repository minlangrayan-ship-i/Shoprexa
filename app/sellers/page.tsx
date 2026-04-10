'use client';

import { FormEvent, useState } from 'react';

export default function SellersPage() {
  const [status, setStatus] = useState('');

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(e.currentTarget).entries());
    const res = await fetch('/api/seller-applications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setStatus(res.ok ? 'Votre demande a été reçue.' : 'Impossible de soumettre la demande.');
    if (res.ok) e.currentTarget.reset();
  };

  return (
    <section className="section py-12">
      <h1 className="text-3xl font-bold">Devenir partenaire vendeur</h1>
      <p className="mt-3 text-slate-600">Rejoignez Min-shop pour augmenter vos ventes et votre visibilité digitale.</p>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div className="space-y-3">{['Audience qualifiée', 'Paiements évolutifs', 'Support opérationnel'].map((b) => <div key={b} className="card p-4 font-medium">{b}</div>)}</div>
        <form onSubmit={onSubmit} className="card space-y-3 p-6">
          <input required name="fullName" placeholder="Nom complet" className="w-full rounded-lg border px-3 py-2" />
          <input required name="businessName" placeholder="Nom business" className="w-full rounded-lg border px-3 py-2" />
          <input required type="email" name="email" placeholder="Email" className="w-full rounded-lg border px-3 py-2" />
          <input required name="phone" placeholder="Téléphone" className="w-full rounded-lg border px-3 py-2" />
          <input required name="category" placeholder="Catégorie" className="w-full rounded-lg border px-3 py-2" />
          <input required name="city" placeholder="Ville" className="w-full rounded-lg border px-3 py-2" />
          <textarea name="message" placeholder="Message" className="h-24 w-full rounded-lg border px-3 py-2" />
          <button className="rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white">Soumettre</button>
          {status && <p className="text-sm">{status}</p>}
        </form>
      </div>
    </section>
  );
}
