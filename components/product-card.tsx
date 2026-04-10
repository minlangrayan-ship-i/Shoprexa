'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import type { CartItem } from '@/lib/types';

type Product = {
  id: string;
  slug: string;
  name: string;
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
};

export function ProductCard({ product }: { product: Product }) {
  const addToCart = () => {
    const raw = localStorage.getItem('min-shop-cart');
    const cart: CartItem[] = raw ? JSON.parse(raw) : [];
    const found = cart.find((item) => item.id === product.id);

    if (found) found.quantity += 1;
    else cart.push({ id: product.id, slug: product.slug, name: product.name, price: product.price, image: product.images[0], quantity: 1 });

    localStorage.setItem('min-shop-cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart:update'));
  };

  return (
    <article className="card overflow-hidden transition hover:-translate-y-1">
      <Link href={`/product/${product.slug}`}>
        <Image src={product.images[0]} alt={product.name} width={600} height={400} className="h-48 w-full object-cover" />
      </Link>
      <div className="space-y-3 p-4">
        <p className="text-xs font-semibold uppercase text-brand-600">{product.category.name}</p>
        <Link href={`/product/${product.slug}`} className="line-clamp-2 block font-semibold">
          {product.name}
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-bold text-brand-700">{formatPrice(product.price)}</span>
          {product.oldPrice && <span className="text-sm text-slate-400 line-through">{formatPrice(product.oldPrice)}</span>}
        </div>

        <div className="space-y-1 text-xs text-slate-600">
          {product.seller && (
            <p>
              Entreprise:{' '}
              <Link href={`/sellers?seller=${product.seller.id}`} className="font-semibold text-brand-700 hover:underline">
                {product.seller.companyName}
              </Link>
            </p>
          )}
          {product.seller && <p>Localisation: {product.seller.city}, {product.seller.country}</p>}
          <p>Stock disponible: {product.stock}</p>
        </div>

        <button onClick={addToCart} className="w-full rounded-xl bg-dark px-4 py-2 text-sm font-semibold text-white">
          Ajouter au panier
        </button>
      </div>
    </article>
  );
}
