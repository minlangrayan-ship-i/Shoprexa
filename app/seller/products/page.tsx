'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import Image from 'next/image';
import { SellerLayout } from '@/components/seller-layout';
import { useSite } from '@/components/site-context';
import { ProductVerificationPanel } from '@/features/product-verification/components/verification-panel';
import { fileToImageAsset, getProductImageFitClass, validateUploadedImages } from '@/lib/image-quality';
import { marketplaceCategories } from '@/lib/mock-marketplace';
import { formatPrice } from '@/lib/utils';
import type { UploadedImageAsset } from '@/lib/image-quality';
import type { VerificationResponse } from '@/types/marketplace-ai';

export default function SellerProductsPage() {
  const { sessionUser, products, addSellerProduct, updateSellerProduct, deleteSellerProduct, locale, t } = useSite();
  const [status, setStatus] = useState('');
  const [uploadedImages, setUploadedImages] = useState<UploadedImageAsset[]>([]);
  const [imageStatus, setImageStatus] = useState('');

  const sellerProducts = products.filter((product) => product.sellerId === sessionUser?.sellerId);

  const onFilesChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const nextImages = await Promise.all(Array.from(files).map((file) => fileToImageAsset(file)));
      const quality = validateUploadedImages(nextImages.map((image) => image.meta), locale);

      if (!quality.ok) {
        setImageStatus(quality.message);
        return;
      }

      setUploadedImages((current) => [...current, ...nextImages]);
      setImageStatus(
        t(
          `${nextImages.length} image(s) ajoutée(s) depuis votre machine.`,
          `${nextImages.length} image(s) added from your device.`
        )
      );
    } catch {
      setImageStatus(t('Impossible de lire une image. Réessayez.', 'Could not read one image. Please retry.'));
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const imageValidation = validateUploadedImages(
      uploadedImages.map((image) => image.meta),
      locale
    );

    if (!imageValidation.ok) {
      setStatus(imageValidation.message);
      return;
    }

    let verification: VerificationResponse | null = null;

    try {
      const verificationResponse = await fetch('/api/product-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          name: String(formData.get('name')),
          categorySlug: String(formData.get('categorySlug')),
          description: String(formData.get('description')),
          images: uploadedImages.map((image) => image.meta)
        })
      });

      if (!verificationResponse.ok) {
        throw new Error('verification_failed');
      }

      verification = (await verificationResponse.json()) as VerificationResponse;
    } catch {
      setStatus(t('La vérification de l’offre est indisponible. Réessayez.', 'Offer verification is unavailable. Please retry.'));
      return;
    }

    if (verification.status === 'suspect') {
      setStatus(
        verification.alerts[0] ??
          t('Offre non validée : remplacez l’image par une version plus nette.', 'Offer not validated: replace the image with a clearer version.')
      );
      return;
    }

    const result = addSellerProduct({
      name: String(formData.get('name')),
      description: String(formData.get('description')),
      price: Number(formData.get('price')),
      oldPrice: Number(formData.get('oldPrice') || 0) || null,
      stock: Number(formData.get('stock')),
      categorySlug: String(formData.get('categorySlug')),
      images: uploadedImages.map((image) => image.src),
      imageMeta: uploadedImages.map((image) => image.meta),
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
            <input name="oldPrice" type="number" min="1" placeholder={t('Prix avant réduction (optionnel)', 'Price before discount (optional)')} className="rounded-lg border px-3 py-2" />
            <input required name="stock" type="number" min="0" placeholder={t('Stock', 'Stock')} className="rounded-lg border px-3 py-2" />
            <select name="kind" className="rounded-lg border px-3 py-2">
              <option value="product">{t('Produit', 'Product')}</option>
              <option value="service">{t('Service', 'Service')}</option>
            </select>
            <select name="categorySlug" className="rounded-lg border px-3 py-2">
              {marketplaceCategories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.label}
                </option>
              ))}
            </select>
            <input name="serviceDuration" placeholder={t('Durée service (optionnel)', 'Service duration (optional)')} className="rounded-lg border px-3 py-2 md:col-span-2" />
            <input name="serviceAvailability" placeholder={t('Disponibilité service (optionnel)', 'Service availability (optional)')} className="rounded-lg border px-3 py-2 md:col-span-2" />
            <textarea required name="description" placeholder={t('Description', 'Description')} className="h-24 rounded-lg border px-3 py-2 md:col-span-2" />

            <div className="rounded-lg border p-3 md:col-span-2">
              <p className="text-sm font-semibold">{t('Photos du produit', 'Product photos')}</p>
              <p className="mt-1 text-xs text-slate-500">{t('Ajoutez des images nettes directement depuis votre machine. Les images trop petites ou trop compressées bloquent la validation.', 'Add clear images directly from your device. Images that are too small or too compressed will block validation.')}</p>
              <input type="file" accept="image/*" multiple onChange={onFilesChange} className="mt-2 w-full text-sm" />
              {imageStatus ? <p className="mt-2 text-xs text-slate-600">{imageStatus}</p> : null}

              {uploadedImages.length > 0 ? (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {uploadedImages.map((image, index) => (
                    <div key={`${index}-${image.src.slice(0, 24)}`} className="relative overflow-hidden rounded-lg border bg-slate-50">
                      <Image src={image.src} alt={`upload-${index + 1}`} width={240} height={160} unoptimized className={`h-20 w-full ${getProductImageFitClass(image.src)}`} />
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
                    <p className="text-xs text-slate-500">
                      {product.kind === 'service' ? t('Service', 'Service') : t('Produit', 'Product')} - {formatPrice(product.price)}
                      {product.oldPrice ? ` / ${t('Avant', 'Before')} ${formatPrice(product.oldPrice)}` : ''}
                      {' - '}
                      {t('Stock', 'Stock')} {product.stock}
                    </p>
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
