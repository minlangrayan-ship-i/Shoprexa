export const dynamic = 'force-dynamic';

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { ProductCard } from '@/components/product-card';

export default async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug }, include: { category: true } });
  if (!product) return notFound();

  const similar = await prisma.product.findMany({ where: { categoryId: product.categoryId, NOT: { id: product.id } }, include: { category: true }, take: 4 });

  return (
    <section className="section py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <Image src={product.images[0]} alt={product.name} width={900} height={700} className="card h-[380px] w-full object-cover" />
        <div>
          <p className="text-sm font-semibold text-brand-700">{product.category.name}</p>
          <h1 className="mt-2 text-3xl font-bold">{product.name}</h1>
          <div className="mt-4 flex items-center gap-3"><span className="text-2xl font-black text-brand-700">{formatPrice(Number(product.price))}</span>{product.oldPrice && <span className="text-slate-400 line-through">{formatPrice(Number(product.oldPrice))}</span>}</div>
          <p className="mt-4 text-slate-600">{product.description}</p>
          <p className="mt-4 text-sm">Stock: <span className="font-semibold">{product.stock > 0 ? 'Disponible' : 'Rupture'}</span></p>
          <div className="mt-6 flex gap-3"><a href="/cart" className="rounded-xl bg-dark px-5 py-3 font-semibold text-white">Commander</a><a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '237690000000'}`} className="rounded-xl border px-5 py-3 font-semibold">WhatsApp</a></div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold">Produits similaires</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{similar.map((p) => <ProductCard key={p.id} product={{ ...p, price: Number(p.price), oldPrice: p.oldPrice ? Number(p.oldPrice) : null }} />)}</div>
      </div>
    </section>
  );
}
