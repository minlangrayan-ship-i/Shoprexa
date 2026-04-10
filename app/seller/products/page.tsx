'use client';

import { FormEvent, useState } from 'react';
import { SellerLayout } from '@/components/seller-layout';
import { useSite } from '@/components/site-context';
import { formatPrice } from '@/lib/utils';

export default function SellerProductsPage() {
  const { sessionUser, products, addSellerProduct, updateSellerProduct, deleteSellerProduct } = useSite();
  const [status, setStatus] = useState('');

  const sellerProducts = products.filter((product) => product.sellerId === sessionUser?.sellerId);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const imagesInput = String(formData.get('images') ?? '');
    const images = imagesInput
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);

    const result = addSellerProduct({
      name: String(formData.get('name')),
      description: String(formData.get('description')),
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
      categorySlug: String(formData.get('categorySlug')),
      images
    });

    setStatus(result.message);
    if (result.ok) event.currentTarget.reset();
  };

  return (
    <SellerLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Gestion des produits</h1>

        <form onSubmit={onSubmit} className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold">Ajouter un produit</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input required name="name" placeholder="Nom produit" className="rounded-lg border px-3 py-2" />
            <input required name="price" type="number" min="1" placeholder="Prix" className="rounded-lg border px-3 py-2" />
            <input required name="stock" type="number" min="0" placeholder="Stock" className="rounded-lg border px-3 py-2" />
            <select name="categorySlug" className="rounded-lg border px-3 py-2">
              <option value="energie">Energie</option>
              <option value="cuisine">Cuisine</option>
              <option value="securite">Securite</option>
              <option value="mobilite">Mobilite</option>
              <option value="fitness">Fitness</option>
              <option value="organisation">Organisation</option>
            </select>
            <textarea required name="description" placeholder="Description" className="h-24 rounded-lg border px-3 py-2 md:col-span-2" />
            <input name="images" placeholder="URLs images (separees par virgule)" className="rounded-lg border px-3 py-2 md:col-span-2" />
            <button className="rounded-lg bg-dark px-4 py-2 font-semibold text-white md:col-span-2">Ajouter le produit</button>
            {status ? <p className="text-sm md:col-span-2">{status}</p> : null}
          </div>
        </form>

        <div className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold">Mes produits</h2>
          <div className="mt-3 space-y-3">
            {sellerProducts.map((product) => (
              <div key={product.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-xs text-slate-500">{formatPrice(product.price)} - Stock {product.stock}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateSellerProduct(product.id, { stock: product.stock + 1 })} className="rounded border px-3 py-1 text-xs">+ Stock</button>
                    <button onClick={() => deleteSellerProduct(product.id)} className="rounded border px-3 py-1 text-xs text-red-600">Supprimer</button>
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
