'use client';

import { FormEvent, useState } from 'react';
import { useSite } from '@/components/site-context';

export default function RegisterPage() {
  const [status, setStatus] = useState('');
  const { t } = useSite();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(
      t(
        'Inscription en mode demo: utilise les comptes fictifs deja disponibles sur la page Connexion.',
        'Demo mode registration: please use the existing demo accounts listed on the Login page.'
      )
    );
  };

  return (
    <section className="section py-12">
      <h1 className="text-3xl font-bold">{t('Inscription', 'Register')}</h1>
      <form onSubmit={onSubmit} className="card mt-6 max-w-md space-y-3 p-6">
        <input required name="name" placeholder={t('Nom', 'Name')} className="w-full rounded-lg border px-3 py-2" />
        <input required type="email" name="email" placeholder="Email" className="w-full rounded-lg border px-3 py-2" />
        <input required type="password" name="password" placeholder={t('Mot de passe', 'Password')} className="w-full rounded-lg border px-3 py-2" />
        <button className="rounded-xl bg-brand-600 px-4 py-2 text-white">{t('Creer un compte', 'Create account')}</button>
        {status && <p className="text-sm">{status}</p>}
      </form>
    </section>
  );
}
