'use client';

import { FormEvent, useState } from 'react';

export default function ContactPage() {
  const [status, setStatus] = useState('');

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setStatus(res.ok ? 'Message envoyé avec succès.' : 'Erreur, veuillez réessayer.');
    if (res.ok) e.currentTarget.reset();
  };

  return (
    <section className="section py-12">
      <h1 className="text-3xl font-bold">Contactez Min-shop</h1>
      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <form onSubmit={onSubmit} className="card space-y-3 p-6">
          <input required name="name" placeholder="Nom" className="w-full rounded-lg border px-3 py-2" />
          <input required type="email" name="email" placeholder="Email" className="w-full rounded-lg border px-3 py-2" />
          <input name="phone" placeholder="Téléphone" className="w-full rounded-lg border px-3 py-2" />
          <input required name="subject" placeholder="Sujet" className="w-full rounded-lg border px-3 py-2" />
          <textarea required name="message" placeholder="Votre message" className="h-28 w-full rounded-lg border px-3 py-2" />
          <button className="rounded-xl bg-dark px-4 py-2 font-semibold text-white">Envoyer</button>
          {status && <p className="text-sm">{status}</p>}
        </form>
        <div className="card p-6"><p className="font-semibold">WhatsApp</p><a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '237690000000'}`} className="text-brand-700">Écrire sur WhatsApp</a><p className="mt-4">Email: hello@min-shop.africa</p><p>LinkedIn · Facebook · Instagram</p></div>
      </div>
    </section>
  );
}
