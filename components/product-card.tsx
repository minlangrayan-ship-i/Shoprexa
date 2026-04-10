'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Eye, Star } from 'lucide-react';
import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import type { CartItem } from '@/lib/types';

type Product = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  price: number;
  oldPrice?: number | null;
  stock: number;
  images: string[];
  category: { name: string };
  seller?: {
    id: string;
    companyName: string;
    country: string;
    city: string;
  };
  badges?: Array<'new' | 'popular' | 'low_stock'>;
  averageRating?: number;
};

const badgeLabel: Record<'new' | 'popular' | 'low_stock', string> = {
  new: 'Nouveau',
  popular: 'Populaire',
  low_stock: 'Stock faible'
};

export function ProductCard({ product }: { product: Product }) {
  const [preview, setPreview] = useState(false);

  const addToCart = () => {
    const raw = localStorage.getItem('min-shop-cart');
    const cart: CartItem[] = raw ? JSON.parse(raw) : [];
    const found = cart.find((item) => item.id === product.id);

    if (found) found.quantity += 1;
    else
      cart.push({
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: 1
      });

    localStorage.setItem('min-shop-cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart:update'));
  };

  return (
    <>
      <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
          <Link href={`/product/${product.slug}`}>
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          </Link>

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {(product.badges ?? []).slice(0, 2).map((badge) => (
              <span key={badge} className="rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold text-slate-700">
                {badgeLabel[badge]}
              </span>
            ))}
          </div>

          <button
            onClick={() => setPreview(true)}
            className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold text-white"
          >
            <Eye size={13} /> Apercu
          </button>
        </div>

        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{product.category.name}</p>
            <div className="inline-flex items-center gap-1 text-xs text-amber-600">
              <Star size={12} fill="currentColor" /> {(product.averageRating ?? 4.3).toFixed(1)}
            </div>
          </div>

          <Link href={`/product/${product.slug}`} className="line-clamp-2 block text-sm font-semibold text-slate-900">
            {product.name}
          </Link>

          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-base font-bold text-brand-700">{formatPrice(product.price)}</p>
              {product.oldPrice ? <p className="text-xs text-slate-400 line-through">{formatPrice(product.oldPrice)}</p> : null}
            </div>
            <p className={`text-xs font-semibold ${product.stock <= 10 ? 'text-amber-600' : 'text-emerald-700'}`}>
              Stock: {product.stock}
            </p>
          </div>

          <div className="space-y-1 text-xs text-slate-600">
            {product.seller ? (
              <p>
                Vendeur:{' '}
                <Link href={`/seller/${product.seller.id}`} className="font-semibold text-brand-700 hover:underline">
                  {product.seller.companyName}
                </Link>
              </p>
            ) : null}
            {product.seller ? <p>{product.seller.city}, {product.seller.country}</p> : null}
          </div>

          <button onClick={addToCart} className="w-full rounded-xl bg-dark px-4 py-2 text-sm font-semibold text-white transition hover:bg-black">
            Ajouter au panier
          </button>
        </div>
      </article>

      {preview ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={() => setPreview(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-4" onClick={(event) => event.stopPropagation()}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
            </div>
            <h3 className="mt-3 text-lg font-bold">{product.name}</h3>
            <p className="mt-1 text-sm text-slate-600">{product.description ?? 'Produit tendance du catalogue Min-shop.'}</p>
            <div className="mt-3 flex items-center justify-between">
              <p className="font-bold text-brand-700">{formatPrice(product.price)}</p>
              <Link href={`/product/${product.slug}`} className="rounded-lg bg-dark px-3 py-2 text-xs font-semibold text-white">
                Voir la fiche complete
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
