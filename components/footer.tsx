import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-20 border-t bg-dark text-slate-200">
      <div className="section grid gap-8 py-12 md:grid-cols-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Min-shop</h3>
          <p className="mt-3 text-sm">La marketplace qui modernise le commerce en Afrique, avec une expérience mobile-first et fiable.</p>
        </div>
        <div><h4 className="font-semibold text-white">Plateforme</h4><ul className="mt-3 space-y-2 text-sm"><li><Link href="/shop">Boutique</Link></li><li><Link href="/sellers">Vendre sur Min-shop</Link></li><li><Link href="/admin">Admin</Link></li></ul></div>
        <div><h4 className="font-semibold text-white">Entreprise</h4><ul className="mt-3 space-y-2 text-sm"><li><Link href="/about">À propos</Link></li><li><Link href="/contact">Contact</Link></li><li><Link href="/auth/login">Connexion</Link></li></ul></div>
        <div><h4 className="font-semibold text-white">Support</h4><ul className="mt-3 space-y-2 text-sm"><li>+237 690 00 00 00</li><li>hello@min-shop.africa</li><li>Douala, Cameroun</li></ul></div>
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs">© {new Date().getFullYear()} Min-shop. Tous droits réservés.</p>
    </footer>
  );
}
