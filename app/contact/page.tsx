'use client';

import { FormEvent, useState } from 'react';
import { useSite } from '@/components/site-context';

const WHATSAPP_NUMBER = '237692714985';

export default function ContactPage() {
  const [status, setStatus] = useState('');
  const { t } = useSite();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setStatus(res.ok ? t('Message envoye avec succes.', 'Message sent successfully.') : t('Erreur, veuillez reessayer.', 'Error, please try again.'));
    if (res.ok) event.currentTarget.reset();
  };

  return (
    <section className="section py-12">
      <h1 className="text-3xl font-bold">{t('Contactez Min-shop', 'Contact Min-shop')}</h1>
      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <form onSubmit={onSubmit} className="card space-y-3 p-6">
          <input required name="name" placeholder={t('Nom', 'Name')} className="w-full rounded-lg border px-3 py-2" />
          <input required type="email" name="email" placeholder="Email" className="w-full rounded-lg border px-3 py-2" />
          <input name="phone" placeholder={t('Telephone', 'Phone')} className="w-full rounded-lg border px-3 py-2" />
          <input required name="subject" placeholder={t('Sujet', 'Subject')} className="w-full rounded-lg border px-3 py-2" />
          <textarea required name="message" placeholder={t('Votre message', 'Your message')} className="h-28 w-full rounded-lg border px-3 py-2" />
          <button className="rounded-xl bg-dark px-4 py-2 font-semibold text-white">{t('Envoyer', 'Send')}</button>
          {status && <p className="text-sm">{status}</p>}
        </form>

        <div className="card space-y-4 p-6">
          <div>
            <p className="font-semibold">WhatsApp</p>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="text-brand-700">
              +237 692714985
            </a>
          </div>
          <div>
            <p className="font-semibold">Email</p>
            <p>min-shop@gmail.com</p>
          </div>
          <div>
            <p className="font-semibold">Adresse</p>
            <p>Base a Yaounde, Cameroun</p>
          </div>
        </div>
      </div>
    </section>
  );
}
