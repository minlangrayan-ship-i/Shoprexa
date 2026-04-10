'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSite } from '@/components/site-context';

export default function LoginPage() {
  const router = useRouter();
  const { login, t, demoAccounts, sessionUser } = useSite();
  const [status, setStatus] = useState('');

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email'));
    const password = String(formData.get('password'));

    const result = login(email, password);
    setStatus(result.message);

    if (!result.ok || !result.user) return;

    if (result.user.role === 'client') router.push('/client/home');
    if (result.user.role === 'seller') router.push('/sellers');
    if (result.user.role === 'admin') router.push('/admin');
  };

  return (
    <section className="section py-12">
      <h1 className="text-3xl font-bold">{t('Connexion', 'Login')}</h1>
      <p className="mt-2 text-slate-600">{t('Utilise un compte fictif ci-dessous pour tester.', 'Use one of the demo accounts below for testing.')}</p>

      <form onSubmit={onSubmit} className="card mt-6 max-w-md space-y-3 p-6">
        <input required type="email" name="email" placeholder="Email" className="w-full rounded-lg border px-3 py-2" />
        <input required type="password" name="password" placeholder={t('Mot de passe', 'Password')} className="w-full rounded-lg border px-3 py-2" />
        <button className="rounded-xl bg-dark px-4 py-2 text-white">{t('Se connecter', 'Sign in')}</button>
        {status && <p className="text-sm">{status}</p>}
      </form>

      {sessionUser?.role === 'admin' ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {demoAccounts.map((account) => (
            <div key={account.id} className="card p-4 text-sm">
              <p className="font-semibold">{account.name} ({account.role})</p>
              <p>{account.email}</p>
              <p>{t('Mot de passe', 'Password')}: {account.password}</p>
              <p className="text-slate-500">{account.city}, {account.country}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="card mt-8 p-4 text-sm text-slate-600">
          {t(
            'Les informations des comptes sont privees et visibles uniquement en session admin.',
            'Account details are private and visible only in an admin session.'
          )}
        </div>
      )}
    </section>
  );
}
