'use client';

import Image from 'next/image';
import { ChangeEvent, FormEvent, useState } from 'react';
import { fileToImageAsset } from '@/lib/image-quality';
import type { UploadedImageAsset } from '@/lib/image-quality';
import type { VerificationResponse } from '@/types/marketplace-ai';

type Props = {
  locale: 'fr' | 'en';
};

export function ProductVerificationPanel({ locale }: Props) {
  const [result, setResult] = useState<VerificationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [images, setImages] = useState<UploadedImageAsset[]>([]);

  const onFilesChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const nextImages = await Promise.all(Array.from(files).map((file) => fileToImageAsset(file)));
      setImages((current) => [...current, ...nextImages]);
      setStatus('');
    } catch {
      setStatus(locale === 'fr' ? 'Impossible de lire cette image.' : 'Could not read this image.');
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus('');

    const formData = new FormData(event.currentTarget);

    try {
      const res = await fetch('/api/product-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          name: String(formData.get('name')),
          categorySlug: String(formData.get('categorySlug')),
          description: String(formData.get('description')),
          images: images.map((image) => image.meta)
        })
      });

      if (!res.ok) throw new Error('verification_failed');
      const payload = (await res.json()) as VerificationResponse;
      setResult(payload);
    } catch {
      setStatus(locale === 'fr' ? 'Vérification indisponible, réessayez.' : 'Verification unavailable, try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl border bg-white p-4">
      <h3 className="text-lg font-bold">{locale === 'fr' ? 'Vérification nom/catégorie/image' : 'Name/category/image verification'}</h3>
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
        <div className="rounded-lg border p-3 md:col-span-2">
          <p className="text-sm font-semibold">{locale === 'fr' ? 'Images à analyser' : 'Images to analyze'}</p>
          <input type="file" accept="image/*" multiple onChange={onFilesChange} className="mt-2 w-full text-sm" />
          {images.length > 0 ? (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {images.map((image, index) => (
                <div key={`${index}-${image.src.slice(0, 24)}`} className="relative overflow-hidden rounded-lg border">
                  <Image src={image.src} alt={`verification-${index + 1}`} width={240} height={160} unoptimized className="h-20 w-full object-contain bg-white p-2" />
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <button disabled={loading} className="rounded-lg bg-dark px-4 py-2 text-sm font-semibold text-white md:col-span-2">
          {loading ? (locale === 'fr' ? 'Vérification...' : 'Checking...') : locale === 'fr' ? 'Vérifier la cohérence' : 'Check consistency'}
        </button>
      </form>

      {status ? <p className="mt-3 text-sm text-red-600">{status}</p> : null}

      {result ? (
        <div className="mt-4 rounded-lg border bg-slate-50 p-3 text-sm">
          <p className="font-semibold">{locale === 'fr' ? 'Résultat' : 'Result'}: {result.status} ({result.score}/100)</p>
          <p>{locale === 'fr' ? 'Confiance' : 'Confidence'}: {result.confidence}</p>
          {result.alerts.length > 0 ? <p className="mt-2">{locale === 'fr' ? 'Alertes' : 'Alerts'}: {result.alerts.join(' | ')}</p> : null}
          {result.recommendations.length > 0 ? <p className="mt-2">{locale === 'fr' ? 'Recommandations' : 'Recommendations'}: {result.recommendations.join(' | ')}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
