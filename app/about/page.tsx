export default function AboutPage() {
  return (
    <section className="section py-12">
      <h1 className="text-3xl font-bold">À propos de Min-shop</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="card p-6"><h2 className="text-xl font-semibold">Vision</h2><p className="mt-2 text-slate-600">Construire la plateforme e-commerce de référence pour l’Afrique francophone.</p></article>
        <article className="card p-6"><h2 className="text-xl font-semibold">Mission</h2><p className="mt-2 text-slate-600">Rendre l’accès à des produits de qualité plus simple, plus rapide et plus fiable.</p></article>
        <article className="card p-6"><h2 className="text-xl font-semibold">Problème résolu</h2><p className="mt-2 text-slate-600">Fragmentation des vendeurs, manque de confiance, parcours d’achat long.</p></article>
        <article className="card p-6"><h2 className="text-xl font-semibold">Ambition panafricaine</h2><p className="mt-2 text-slate-600">Déployer un modèle scalable depuis le Cameroun vers les marchés voisins.</p></article>
      </div>
    </section>
  );
}
