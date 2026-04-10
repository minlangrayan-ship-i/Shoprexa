export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/product-card';

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string }> }) {
  const params = await searchParams;
  const q = params.q ?? '';
  const category = params.category ?? '';
  const sort = params.sort ?? 'newest';
  const page = Number(params.page ?? '1');
  const take = 8;

  const where = {
    ...(q ? { name: { contains: q, mode: 'insensitive' as const } } : {}),
    ...(category ? { category: { slug: category } } : {})
  };

  const orderBy = sort === 'price_asc' ? { price: 'asc' as const } : sort === 'price_desc' ? { price: 'desc' as const } : { createdAt: 'desc' as const };

  const [products, count, categories] = await Promise.all([
    prisma.product.findMany({ where, include: { category: true }, orderBy, take, skip: (page - 1) * take }),
    prisma.product.count({ where }),
    prisma.category.findMany()
  ]);

  const totalPages = Math.max(1, Math.ceil(count / take));

  return (
    <section className="section py-10">
      <h1 className="text-3xl font-bold">Boutique Min-shop</h1>
      <form className="card mt-6 grid gap-3 p-4 md:grid-cols-4">
        <input name="q" defaultValue={q} placeholder="Rechercher un produit" className="rounded-lg border px-3 py-2" />
        <select name="category" defaultValue={category} className="rounded-lg border px-3 py-2"><option value="">Toutes catégories</option>{categories.map((c) => <option value={c.slug} key={c.id}>{c.name}</option>)}</select>
        <select name="sort" defaultValue={sort} className="rounded-lg border px-3 py-2"><option value="newest">Plus récents</option><option value="price_asc">Prix croissant</option><option value="price_desc">Prix décroissant</option></select>
        <button className="rounded-lg bg-dark px-4 py-2 font-semibold text-white">Filtrer</button>
      </form>

      {products.length === 0 ? <p className="mt-8 text-slate-500">Aucun produit trouvé.</p> : <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map((p) => <ProductCard key={p.id} product={{ ...p, price: Number(p.price), oldPrice: p.oldPrice ? Number(p.oldPrice) : null }} />)}</div>}

      <div className="mt-8 flex items-center justify-center gap-3">
        <a className="rounded border px-3 py-1 disabled:pointer-events-none disabled:opacity-40" href={`?q=${q}&category=${category}&sort=${sort}&page=${Math.max(1, page - 1)}`}>Précédent</a>
        <span className="text-sm">Page {page}/{totalPages}</span>
        <a className="rounded border px-3 py-1" href={`?q=${q}&category=${category}&sort=${sort}&page=${Math.min(totalPages, page + 1)}`}>Suivant</a>
      </div>
    </section>
  );
}
