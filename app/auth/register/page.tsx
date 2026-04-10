'use client';

import { FormEvent, useState } from 'react';

export default function RegisterPage() {
  const [status, setStatus] = useState('');
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(e.currentTarget).entries());
    const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const body = await res.json();
    setStatus(res.ok ? 'Compte créé.' : body.error);
  };
  return <section className="section py-12"><h1 className="text-3xl font-bold">Inscription</h1><form onSubmit={onSubmit} className="card mt-6 max-w-md space-y-3 p-6"><input required name="name" placeholder="Nom" className="w-full rounded-lg border px-3 py-2" /><input required type="email" name="email" placeholder="Email" className="w-full rounded-lg border px-3 py-2" /><input required type="password" name="password" placeholder="Mot de passe" className="w-full rounded-lg border px-3 py-2" /><button className="rounded-xl bg-brand-600 px-4 py-2 text-white">Créer un compte</button>{status && <p className="text-sm">{status}</p>}</form></section>;
}
