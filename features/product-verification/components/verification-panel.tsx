'use client';

import { FormEvent, useState } from 'react';
import type { VerificationResponse } from '@/types/marketplace-ai';

type Props = {
  locale: 'fr' | 'en';
};

export function ProductVerificationPanel({ locale }: Props) {
  const [result, setResult] = useState<VerificationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus('');

    const formData = new FormData(event.currentTarget);
    const imageUrls = String(formData.get('imageUrls') ?? '')
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/product-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          name: String(formData.get('name')),
          categorySlug: String(formData.get('categorySlug')),
          description: String(formData.get('description')),
          imageUrls
        })
      });

      if (!res.ok) throw new Error('verification_failed');
      const payload = (await res.json()) as VerificationResponse;
      setResult(payload);
    } catch {
      setStatus(locale === 'fr' ? 'Verification indisponible, reessaye.' : 'Verification unavailable, try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl border bg-white p-4">
      <h3 className="text-lg font-bold">{locale === 'fr' ? 'Verification nom/categorie/image' : 'Name/category/image verification'}</h3>
      <form onSubmit={onSubmit} className="mt-3 grid gap-3 md:grid-cols-2">
        <input required name="name" placeholder={locale === 'fr' ? 'Nom du produit' : 'Product name'} className="rounded-lg border px-3 py-2" />
        <select name="categorySlug" className="rounded-lg border px-3 py-2">
          <option value="energie">energie</option>
          <option value="cuisine">cuisine</option>
          <option value="securite">securite</option>
          <option value="mobilite">mobilite</option>
          <option value="fitness">fitness</option>
          <option value="organisation">organisation</option>
        </select>
        <textarea name="description" placeholder={locale === 'fr' ? 'Description courte' : 'Short description'} className="h-20 rounded-lg border px-3 py-2 md:col-span-2" />
        <input name="imageUrls" placeholder={locale === 'fr' ? 'URLs images (separees par virgule)' : 'Image URLs (comma separated)'} className="rounded-lg border px-3 py-2 md:col-span-2" />
        <button disabled={loading} className="rounded-lg bg-dark px-4 py-2 text-sm font-semibold text-white md:col-span-2">
          {loading ? (locale === 'fr' ? 'Verification...' : 'Checking...') : locale === 'fr' ? 'Verifier la coherence' : 'Check consistency'}
        </button>
      </form>

      {status ? <p className="mt-3 text-sm text-red-600">{status}</p> : null}

      {result ? (
        <div className="mt-4 rounded-lg border bg-slate-50 p-3 text-sm">
          <p className="font-semibold">{locale === 'fr' ? 'Resultat' : 'Result'}: {result.status} ({result.score}/100)</p>
          <p>{locale === 'fr' ? 'Confiance' : 'Confidence'}: {result.confidence}</p>
          {result.alerts.length > 0 ? <p className="mt-2">{locale === 'fr' ? 'Alertes' : 'Alerts'}: {result.alerts.join(' | ')}</p> : null}
          {result.recommendations.length > 0 ? <p className="mt-2">{locale === 'fr' ? 'Recommandations' : 'Recommendations'}: {result.recommendations.join(' | ')}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
