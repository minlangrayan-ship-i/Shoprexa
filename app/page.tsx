export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/product-card';
import { WhatsAppFloat } from '@/components/whatsapp-float';

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    prisma.category.findMany({ take: 6 }),
    prisma.product.findMany({ where: { featured: true }, include: { category: true }, take: 4 })
  ]);

  return (
    <>
      <section className="section py-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">Startup e-commerce africaine</p>
            <h1 className="text-4xl font-black leading-tight md:text-5xl">Acheter mieux. Vendre plus vite. Grandir avec l’Afrique.</h1>
            <p className="mt-5 text-slate-600">Min-shop connecte clients et vendeurs avec une expérience moderne, mobile-first et adaptée aux réalités du Cameroun.</p>
            <div className="mt-8 flex gap-3"><Link href="/shop" className="rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white">Découvrir la boutique</Link><Link href="/sellers" className="rounded-xl border px-5 py-3 font-semibold">Devenir vendeur</Link></div>
          </div>
          <div className="card bg-gradient-to-br from-brand-600 to-dark p-8 text-white">
            <h3 className="text-2xl font-bold">Pourquoi Min-shop ?</h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-100"><li>• Produits utiles et sélectionnés pour le marché local</li><li>• Commande simple + accompagnement WhatsApp</li><li>• Marketplace pensée pour l’échelle panafricaine</li></ul>
          </div>
        </div>
      </section>

      <section className="section py-10">
        <h2 className="text-2xl font-bold">Catégories populaires</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">{categories.map((c) => <Link key={c.id} href={`/shop?category=${c.slug}`} className="card p-4 font-semibold hover:border-brand-500">{c.name}</Link>)}</div>
      </section>

      <section className="section py-10">
        <div className="mb-5 flex items-center justify-between"><h2 className="text-2xl font-bold">Produits en vedette</h2><Link href="/shop" className="text-sm font-semibold text-brand-700">Voir tout</Link></div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{featured.map((p) => <ProductCard key={p.id} product={{ ...p, price: Number(p.price), oldPrice: p.oldPrice ? Number(p.oldPrice) : null }} />)}</div>
      </section>

      <section className="section grid gap-5 py-10 md:grid-cols-3">
        {['Choisissez un produit', 'Commandez en 2 minutes', 'Recevez rapidement'].map((step, i) => (
          <div key={step} className="card p-6"><p className="text-xs font-semibold text-brand-600">Étape {i + 1}</p><h3 className="mt-2 text-lg font-bold">{step}</h3></div>
        ))}
      </section>

      <section className="section py-10 grid gap-5 md:grid-cols-2">
        <div className="card p-6"><h3 className="text-xl font-bold">Avantages clients</h3><p className="mt-2 text-slate-600">Prix transparents, support WhatsApp, paiement progressif prêt à intégrer Flutterwave/Paystack.</p></div>
        <div className="card p-6"><h3 className="text-xl font-bold">Avantages vendeurs</h3><p className="mt-2 text-slate-600">Visibilité digitale, tableau de bord simple, leads qualifiés et croissance rapide.</p></div>
      </section>

      <section className="section py-10 grid gap-4 md:grid-cols-3">
        {['“Livraison rapide à Douala.”', '“Interface claire sur mobile.”', '“Excellent support vendeur.”'].map((t) => <blockquote key={t} className="card p-6 text-sm">{t}</blockquote>)}
      </section>

      <section className="section py-10">
        <h2 className="text-2xl font-bold">FAQ</h2>
        <div className="mt-4 space-y-3">
          <details className="card p-4"><summary className="font-semibold">Quels paiements sont supportés ?</summary><p className="mt-2 text-sm text-slate-600">Simulation active. Structure prête pour Flutterwave et Paystack.</p></details>
          <details className="card p-4"><summary className="font-semibold">Puis-je commander via WhatsApp ?</summary><p className="mt-2 text-sm text-slate-600">Oui, un bouton WhatsApp est disponible sur les pages clés.</p></details>
        </div>
      </section>
      <WhatsAppFloat />
    </>
  );
}
