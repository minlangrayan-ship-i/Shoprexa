export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { AdminProductManager } from '@/components/admin-product-manager';

export default async function AdminPage() {
  const [products, orders, messages, applications, categories] = await Promise.all([
    prisma.product.findMany({ include: { category: true }, take: 20, orderBy: { createdAt: 'desc' } }),
    prisma.order.findMany({ take: 10, orderBy: { createdAt: 'desc' } }),
    prisma.contactMessage.findMany({ take: 10, orderBy: { createdAt: 'desc' } }),
    prisma.sellerApplication.findMany({ take: 10, orderBy: { createdAt: 'desc' } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } })
  ]);

  return (
    <section className="section space-y-8 py-12">
      <h1 className="text-3xl font-bold">Dashboard Admin</h1>
      <AdminProductManager initialProducts={products.map((p) => ({ ...p, price: Number(p.price) }))} categories={categories} />
      <div className="card p-5"><h2 className="text-xl font-semibold">Commandes</h2><ul className="mt-3 space-y-2 text-sm">{orders.map((o) => <li key={o.id} className="flex justify-between border-b pb-2"><span>{o.customerName}</span><span>{o.status}</span></li>)}</ul></div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5"><h2 className="text-xl font-semibold">Messages de contact</h2><ul className="mt-3 space-y-2 text-sm">{messages.map((m) => <li key={m.id} className="border-b pb-2">{m.name} — {m.subject}</li>)}</ul></div>
        <div className="card p-5"><h2 className="text-xl font-semibold">Demandes vendeurs</h2><ul className="mt-3 space-y-2 text-sm">{applications.map((a) => <li key={a.id} className="border-b pb-2">{a.businessName} — {a.city}</li>)}</ul></div>
      </div>
    </section>
  );
}
