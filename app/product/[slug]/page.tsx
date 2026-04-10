'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Star } from 'lucide-react';
import { useSite } from '@/components/site-context';
import { formatPrice } from '@/lib/utils';
import { ProductCard } from '@/components/product-card';

const WHATSAPP_NUMBER = '237692714985';

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const { products } = useSite();

  const product = useMemo(() => products.find((entry) => entry.slug === params.slug), [params.slug, products]);
  const [activeImage, setActiveImage] = useState(0);

  if (!product) {
    return (
      <section className="section py-12">
        <div className="rounded-xl border bg-white p-6">Produit introuvable.</div>
      </section>
    );
  }

  const similar = products
    .filter((entry) => entry.categorySlug === product.categorySlug && entry.id !== product.id)
    .slice(0, 4)
    .map((entry) => ({
      id: entry.id,
      slug: entry.slug,
      name: entry.name,
      description: entry.description,
      price: entry.price,
      oldPrice: entry.oldPrice,
      stock: entry.stock,
      images: entry.images,
      category: { name: entry.category },
      seller: {
        id: entry.sellerId,
        companyName: entry.companyName,
        country: entry.sellerCountry,
        city: entry.sellerCity
      },
      badges: entry.badges,
      averageRating: entry.averageRating
    }));

  return (
    <section className="section py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border bg-slate-100 shadow-sm">
            <Image src={product.images[activeImage]} alt={product.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
          </div>

          <div className="mt-4 grid grid-cols-4 gap-3">
            {product.images.map((image, index) => (
              <button
                key={`${product.id}-${index}`}
                onClick={() => setActiveImage(index)}
                className={`relative aspect-square overflow-hidden rounded-xl border ${activeImage === index ? 'border-brand-600' : 'border-slate-200'}`}
              >
                <Image src={image} alt={`${product.name}-${index + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-brand-700">{product.category}</p>
          <h1 className="mt-2 text-3xl font-bold">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3">
            <span className="text-2xl font-black text-brand-700">{formatPrice(product.price)}</span>
            {product.oldPrice ? <span className="text-slate-400 line-through">{formatPrice(product.oldPrice)}</span> : null}
          </div>

          <div className="mt-3 flex items-center gap-1 text-amber-600">
            <Star size={16} fill="currentColor" />
            <span className="text-sm font-semibold">{product.averageRating.toFixed(1)}/5</span>
          </div>

          <p className="mt-4 text-slate-600">{product.description}</p>

          <div className="mt-4 space-y-1 text-sm text-slate-700">
            <p>
              Vendeur:{' '}
              <Link href={`/seller/${product.sellerId}`} className="font-semibold text-brand-700 hover:underline">
                {product.companyName}
              </Link>
            </p>
            <p>Localisation: {product.sellerCity}, {product.sellerCountry}</p>
            <p className={product.stock <= 10 ? 'font-semibold text-amber-600' : 'font-semibold text-emerald-700'}>
              Stock disponible: {product.stock}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/cart" className="rounded-xl bg-dark px-5 py-3 font-semibold text-white">Commander maintenant</Link>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="rounded-xl border px-5 py-3 font-semibold">WhatsApp</a>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold">Produits similaires</h2>
        <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {similar.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
