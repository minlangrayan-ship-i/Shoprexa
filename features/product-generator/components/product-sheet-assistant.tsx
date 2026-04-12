'use client';

import { FormEvent, useState } from 'react';
import type { Locale, ProductSheetResult } from '@/types/marketplace-ai';

type Props = {
  locale: Locale;
};

export function ProductSheetAssistant({ locale }: Props) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState<ProductSheetResult | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus('');

    const formData = new FormData(event.currentTarget);
    const payload = {
      locale,
      name: String(formData.get('name')),
      categorySlug: String(formData.get('categorySlug')),
      price: Number(formData.get('price') || 0),
      specs: String(formData.get('specs') || ''),
      benefits: String(formData.get('benefits') || ''),
      condition: String(formData.get('condition') || ''),
      salesZone: String(formData.get('salesZone') || ''),
      kind: String(formData.get('kind') || 'product'),
      draft: String(formData.get('draft') || '')
    };

    try {
      const res = await fetch('/api/ai/product-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('generator_error');
      setResult((await res.json()) as ProductSheetResult);
    } catch {
      setStatus(locale === 'fr' ? 'Generation indisponible, reessaye.' : 'Generation unavailable, try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setStatus(locale === 'fr' ? 'Contenu copie.' : 'Content copied.');
  };

  return (
    <section className="section py-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <form onSubmit={onSubmit} className="rounded-2xl border bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-bold">{locale === 'fr' ? 'Generateur de fiche produit/service' : 'Product/service sheet generator'}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {locale === 'fr'
              ? 'Ameliore ton texte avec un format vendeur clair et credible.'
              : 'Upgrade your listing with a clear and credible seller format.'}
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input required name="name" placeholder={locale === 'fr' ? 'Nom offre' : 'Offer name'} className="rounded-lg border px-3 py-2" />
            <select name="kind" className="rounded-lg border px-3 py-2">
              <option value="product">{locale === 'fr' ? 'Produit' : 'Product'}</option>
              <option value="service">{locale === 'fr' ? 'Service' : 'Service'}</option>
            </select>
            <select name="categorySlug" className="rounded-lg border px-3 py-2">
              <option value="energie">energie</option>
              <option value="cuisine">cuisine</option>
              <option value="securite">securite</option>
              <option value="mobilite">mobilite</option>
              <option value="fitness">fitness</option>
              <option value="organisation">organisation</option>
            </select>
            <input name="price" type="number" min="0" placeholder={locale === 'fr' ? 'Prix' : 'Price'} className="rounded-lg border px-3 py-2" />
            <input name="salesZone" placeholder={locale === 'fr' ? 'Zone de vente' : 'Sales zone'} className="rounded-lg border px-3 py-2 md:col-span-2" />
            <textarea name="specs" placeholder={locale === 'fr' ? 'Caracteristiques' : 'Specifications'} className="h-20 rounded-lg border px-3 py-2 md:col-span-2" />
            <textarea name="benefits" placeholder={locale === 'fr' ? 'Benefices client' : 'Customer benefits'} className="h-20 rounded-lg border px-3 py-2 md:col-span-2" />
            <textarea name="draft" placeholder={locale === 'fr' ? 'Texte brut a ameliorer (optionnel)' : 'Raw copy to improve (optional)'} className="h-24 rounded-lg border px-3 py-2 md:col-span-2" />
            <button disabled={loading} className="rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white md:col-span-2">
              {loading ? (locale === 'fr' ? 'Generation...' : 'Generating...') : locale === 'fr' ? 'Generer ma fiche' : 'Generate my listing'}
            </button>
          </div>

          {status ? <p className="mt-3 text-sm">{status}</p> : null}
        </form>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">{locale === 'fr' ? 'Resultat' : 'Result'}</h2>
          {!result ? (
            <p className="mt-3 text-sm text-slate-500">{locale === 'fr' ? 'Le resultat apparaitra ici.' : 'Generated content will appear here.'}</p>
          ) : (
            <div className="mt-3 space-y-4 text-sm">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-slate-500">{locale === 'fr' ? 'Titre optimise' : 'Optimized title'}</p>
                <p className="font-semibold">{result.optimizedTitle}</p>
                <button onClick={() => void copyText(result.optimizedTitle)} className="mt-2 rounded border px-2 py-1 text-xs">{locale === 'fr' ? 'Copier' : 'Copy'}</button>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-xs text-slate-500">{locale === 'fr' ? 'Description pro' : 'Professional description'}</p>
                <p>{result.polishedDescription}</p>
                <button onClick={() => void copyText(result.polishedDescription)} className="mt-2 rounded border px-2 py-1 text-xs">{locale === 'fr' ? 'Copier' : 'Copy'}</button>
              </div>

              <div className="rounded-lg border p-3">
                <p className="font-semibold">{locale === 'fr' ? 'Points forts' : 'Strengths'}</p>
                <ul className="mt-1 space-y-1 text-slate-700">
                  {result.sellingPoints.map((item, index) => <li key={index}>- {item}</li>)}
                </ul>
              </div>

              <div className="rounded-lg border p-3">
                <p className="font-semibold">{locale === 'fr' ? 'Arguments de vente' : 'Sales arguments'}</p>
                <ul className="mt-1 space-y-1 text-slate-700">
                  {result.salesArguments.map((item, index) => <li key={index}>- {item}</li>)}
                </ul>
              </div>

              {result.missingFields.length > 0 ? (
                <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
                  <p className="font-semibold">{locale === 'fr' ? 'Informations manquantes' : 'Missing information'}</p>
                  <p>{result.missingFields.join(', ')}</p>
                </div>
              ) : null}

              {result.cautionNotes.length > 0 ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="font-semibold">{locale === 'fr' ? 'Points de vigilance' : 'Caution notes'}</p>
                  <p>{result.cautionNotes.join(' | ')}</p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
