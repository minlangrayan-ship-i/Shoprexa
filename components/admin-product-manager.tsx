'use client';

import { useState } from 'react';

type Category = { id: string; name: string };
type Product = { id: string; name: string; slug: string; stock: number; price: number; category: { name: string }; categoryId: string };

export function AdminProductManager({ initialProducts, categories }: { initialProducts: Product[]; categories: Category[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [form, setForm] = useState({ name: '', slug: '', description: '', price: 1000, stock: 1, categoryId: categories[0]?.id ?? '' });

  const reload = async () => {
    const res = await fetch('/api/admin/products');
    setProducts(await res.json());
  };

  const create = async () => {
    await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80'] }) });
    await reload();
  };

  const remove = async (id: string) => {
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    await reload();
  };

  const addStock = async (id: string, stock: number) => {
    await fetch(`/api/admin/products/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stock: stock + 1 }) });
    await reload();
  };

  return (
    <div className="card p-5">
      <h2 className="text-xl font-semibold">Gérer les produits</h2>
      <div className="mt-4 grid gap-2 md:grid-cols-5">
        <input placeholder="Nom" className="rounded border px-2 py-1" onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Slug" className="rounded border px-2 py-1" onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        <input type="number" placeholder="Prix" className="rounded border px-2 py-1" onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        <select className="rounded border px-2 py-1" onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <button onClick={create} className="rounded bg-brand-600 px-2 py-1 text-white">Ajouter</button>
      </div>
      <ul className="mt-5 space-y-2 text-sm">{products.map((p) => <li key={p.id} className="flex items-center justify-between border-b pb-2"><span>{p.name} ({p.category.name}) — stock {p.stock}</span><span className="space-x-2"><button onClick={() => addStock(p.id, p.stock)} className="rounded border px-2">+ stock</button><button onClick={() => remove(p.id)} className="rounded border px-2 text-red-600">Supprimer</button></span></li>)}</ul>
    </div>
  );
}
