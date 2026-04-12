'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSite } from '@/components/site-context';

function toServerRole(role: 'client' | 'seller' | 'admin') {
  if (role === 'admin') return 'ADMIN';
  if (role === 'seller') return 'SELLER';
  return 'CUSTOMER';
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, t } = useSite();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email'));
    const password = String(formData.get('password'));

    const result = login(email, password);
    setStatus(result.message);

    if (!result.ok || !result.user) {
      setLoading(false);
      return;
    }

    try {
      await fetch('/api/auth/dev-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: toServerRole(result.user.role),
          sellerId: result.user.sellerId ?? null
        })
      });
    } catch {
      // The UI stays usable even if the development cookie sync fails.
    }

    const next = searchParams.get('next');
    setLoading(false);

    if (next) {
      router.push(next);
      return;
    }

    if (result.user.role === 'client') router.push('/client/home');
    if (result.user.role === 'seller') router.push('/seller/dashboard');
    if (result.user.role === 'admin') router.push('/admin');
  };

  return (
    <section className="section py-14">
      <div className="mx-auto max-w-md rounded-2xl border bg-white p-7 shadow-sm">
        <h1 className="text-3xl font-bold">{t('Connexion', 'Login')}</h1>
        <p className="mt-2 text-sm text-slate-600">{t('Connecte-toi pour accéder à ton espace.', 'Sign in to access your workspace.')}</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input required type="email" name="email" placeholder="Email" className="w-full rounded-xl border px-3 py-2" />
          <input required type="password" name="password" placeholder={t('Mot de passe', 'Password')} className="w-full rounded-xl border px-3 py-2" />
          <button disabled={loading} className="w-full rounded-xl bg-dark px-4 py-2 font-semibold text-white">
            {loading ? t('Connexion...', 'Signing in...') : t('Se connecter', 'Sign in')}
          </button>
          {status ? <p className="text-sm">{status}</p> : null}
        </form>

        <p className="mt-5 text-sm text-slate-600">
          {t('Pas encore de compte ?', 'No account yet?')}{' '}
          <a href="/auth/register" className="font-semibold text-brand-700">{t('Créer un compte', 'Create one')}</a>
        </p>
      </div>
    </section>
  );
}
