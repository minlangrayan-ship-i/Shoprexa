'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import Image from 'next/image';
import { SellerLayout } from '@/components/seller-layout';
import { useSite } from '@/components/site-context';
import { ProductVerificationPanel } from '@/features/product-verification/components/verification-panel';
import { formatPrice } from '@/lib/utils';

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function SellerProductsPage() {
  const { sessionUser, products, addSellerProduct, updateSellerProduct, deleteSellerProduct, locale, t } = useSite();
  const [status, setStatus] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageStatus, setImageStatus] = useState('');

  const sellerProducts = products.filter((product) => product.sellerId === sessionUser?.sellerId);

  const onFilesChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const nextImages = await Promise.all(Array.from(files).map((file) => fileToBase64(file)));
      setUploadedImages((current) => Array.from(new Set([...current, ...nextImages])));
      setImageStatus(
        t(
          `${nextImages.length} image(s) ajoutée(s) depuis votre machine.`,
          `${nextImages.length} image(s) added from your device.`
        )
      );
    } catch {
      setImageStatus(t('Impossible de lire une image. Réessaie.', 'Could not read one image. Please retry.'));
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const result = addSellerProduct({
      name: String(formData.get('name')),
      description: String(formData.get('description')),
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
      categorySlug: String(formData.get('categorySlug')),
      images: uploadedImages,
      kind: String(formData.get('kind')) as 'product' | 'service',
      serviceDuration: String(formData.get('serviceDuration') ?? ''),
      serviceAvailability: String(formData.get('serviceAvailability') ?? ''),
      targetCountries: String(formData.get('targetCountries') ?? '')
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
    });

    setStatus(result.message);
    if (result.ok) {
      event.currentTarget.reset();
      setUploadedImages([]);
      setImageStatus('');
    }
  };

  return (
    <SellerLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t('Gestion des produits', 'Product management')}</h1>

        <form onSubmit={onSubmit} className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold">{t('Ajouter une offre', 'Add an offer')}</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input required name="name" placeholder={t('Nom produit/service', 'Product/service name')} className="rounded-lg border px-3 py-2" />
            <input required name="price" type="number" min="1" placeholder={t('Prix', 'Price')} className="rounded-lg border px-3 py-2" />
            <input required name="stock" type="number" min="0" placeholder={t('Stock', 'Stock')} className="rounded-lg border px-3 py-2" />
            <select name="kind" className="rounded-lg border px-3 py-2">
              <option value="product">{t('Produit', 'Product')}</option>
              <option value="service">{t('Service', 'Service')}</option>
            </select>
            <select name="categorySlug" className="rounded-lg border px-3 py-2">
              <option value="energie">Énergie</option>
              <option value="cuisine">Cuisine</option>
              <option value="securite">Sécurité</option>
              <option value="mobilite">Mobilité</option>
              <option value="fitness">Fitness</option>
              <option value="organisation">Organisation</option>
            </select>
            <input name="serviceDuration" placeholder={t('Durée service (optionnel)', 'Service duration (optional)')} className="rounded-lg border px-3 py-2 md:col-span-2" />
            <input name="serviceAvailability" placeholder={t('Disponibilité service (optionnel)', 'Service availability (optional)')} className="rounded-lg border px-3 py-2 md:col-span-2" />
            <textarea required name="description" placeholder={t('Description', 'Description')} className="h-24 rounded-lg border px-3 py-2 md:col-span-2" />

            <div className="rounded-lg border p-3 md:col-span-2">
              <p className="text-sm font-semibold">{t('Photos du produit', 'Product photos')}</p>
              <p className="mt-1 text-xs text-slate-500">{t('Ajoute des images directement depuis ta machine.', 'Add images directly from your device.')}</p>
              <input type="file" accept="image/*" multiple onChange={onFilesChange} className="mt-2 w-full text-sm" />
              {imageStatus ? <p className="mt-2 text-xs text-slate-600">{imageStatus}</p> : null}

              {uploadedImages.length > 0 ? (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {uploadedImages.map((src, index) => (
                    <div key={`${index}-${src.slice(0, 24)}`} className="relative overflow-hidden rounded-lg border">
                      <Image src={src} alt={`upload-${index + 1}`} width={240} height={160} unoptimized className="h-20 w-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <input name="targetCountries" placeholder={t('Pays cibles (virgules)', 'Target countries (comma separated)')} className="rounded-lg border px-3 py-2 md:col-span-2" />
            <button className="rounded-lg bg-dark px-4 py-2 font-semibold text-white md:col-span-2">{t('Ajouter l’offre', 'Add offer')}</button>
            {status ? <p className="text-sm md:col-span-2">{status}</p> : null}
          </div>
        </form>

        <ProductVerificationPanel locale={locale} />

        <div className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold">{t('Mes offres', 'My offers')}</h2>
          <div className="mt-3 space-y-3">
            {sellerProducts.map((product) => (
              <div key={product.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.kind === 'service' ? t('Service', 'Service') : t('Produit', 'Product')} - {formatPrice(product.price)} - {t('Stock', 'Stock')} {product.stock}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateSellerProduct(product.id, { stock: product.stock + 1 })} className="rounded border px-3 py-1 text-xs">+ {t('Stock', 'Stock')}</button>
                    <button onClick={() => deleteSellerProduct(product.id)} className="rounded border px-3 py-1 text-xs text-red-600">{t('Supprimer', 'Delete')}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
