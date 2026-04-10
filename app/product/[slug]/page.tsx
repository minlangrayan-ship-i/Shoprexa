import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { demoProducts } from '@/lib/demo-data';
import { formatPrice } from '@/lib/utils';
import { ProductCard } from '@/components/product-card';

const WHATSAPP_NUMBER = '237692714985';

export default async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = demoProducts.find((entry) => entry.slug === slug);

  if (!product) return notFound();

  const similar = demoProducts.filter((entry) => entry.category.slug === product.category.slug && entry.id !== product.id).slice(0, 4);

  return (
    <section className="section py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <Image src={product.images[0]} alt={product.name} width={900} height={700} className="card h-[380px] w-full object-cover" />
        <div>
          <p className="text-sm font-semibold text-brand-700">{product.category.name}</p>
          <h1 className="mt-2 text-3xl font-bold">{product.name}</h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-black text-brand-700">{formatPrice(product.price)}</span>
            {product.oldPrice && <span className="text-slate-400 line-through">{formatPrice(product.oldPrice)}</span>}
          </div>

          <p className="mt-4 text-slate-600">{product.description}</p>
          <p className="mt-3 text-sm">Stock disponible: <span className="font-semibold">{product.stock}</span></p>

          <div className="mt-4 space-y-1 text-sm text-slate-600">
            <p>
              Entreprise:{' '}
              <Link href={`/sellers?seller=${product.seller.id}`} className="font-semibold text-brand-700 hover:underline">
                {product.seller.companyName}
              </Link>
            </p>
            <p>Localisation vendeur: {product.seller.city}, {product.seller.country}</p>
          </div>

          <div className="mt-6 flex gap-3">
            <a href="/cart" className="rounded-xl bg-dark px-5 py-3 font-semibold text-white">
              Commander
            </a>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="rounded-xl border px-5 py-3 font-semibold">
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold">Produits similaires</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {similar.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
