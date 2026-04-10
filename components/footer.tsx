import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-20 border-t bg-dark text-slate-200">
      <div className="section grid gap-8 py-12 md:grid-cols-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Min-shop</h3>
          <p className="mt-3 text-sm">
            Marketplace mobile-first pour connecter clients, vendeurs et dropshippers avec une experience fiable et orientee conversion.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-white">Plateforme</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/shop">Boutique</Link>
            </li>
            <li>
              <Link href="/sellers">Vendeurs</Link>
            </li>
            <li>
              <Link href="/dropshippers">Dropshippers</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white">Entreprise</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/about">A propos</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
            <li>
              <Link href="/auth/login">Connexion</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white">Support</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>+237 692714985</li>
            <li>min-shop@gmail.com</li>
            <li>Base a Yaounde, Cameroun</li>
          </ul>
        </div>
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs">? {new Date().getFullYear()} Min-shop. Tous droits reserves.</p>
    </footer>
  );
}
