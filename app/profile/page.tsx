'use client';

import Image from 'next/image';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSite } from '@/components/site-context';

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProfilePage() {
  const router = useRouter();
  const { sessionUser, updateProfile, deleteCurrentAccount, t, availableCities, setCountry } = useSite();
  const [status, setStatus] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(sessionUser?.avatar);

  if (!sessionUser) {
    return (
      <section className="section py-12">
        <div className="card p-6">{t('Connecte-toi pour acceder au profil.', 'Please login to access your profile.')}</div>
      </section>
    );
  }

  const onAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setAvatar(base64);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const result = updateProfile({
      name: String(formData.get('name')),
      phone: String(formData.get('phone')),
      country: String(formData.get('country')),
      city: String(formData.get('city')),
      avatar,
      company: String(formData.get('company') ?? ''),
      about: String(formData.get('about') ?? '')
    });

    setStatus(result.message);
  };

  const onDeleteAccount = () => {
    const confirmed = window.confirm(t('Confirmer la suppression definitive du compte ?', 'Confirm permanent account deletion?'));
    if (!confirmed) return;
    const result = deleteCurrentAccount();
    setStatus(result.message);
    if (result.ok) router.push('/');
  };

  return (
    <section className="section py-12">
      <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">{t('Mon profil', 'My profile')}</h1>

        <div className="mt-6 flex items-center gap-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-full border">
            <Image src={avatar ?? sessionUser.avatar ?? '/favicon.ico'} alt={sessionUser.name} fill className="object-cover" />
          </div>
          <label className="rounded-lg border px-3 py-2 text-sm font-semibold">
            {t('Changer la photo', 'Change photo')}
            <input type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
          </label>
        </div>

        <form onSubmit={onSubmit} className="mt-6 grid gap-3 md:grid-cols-2">
          <input name="name" defaultValue={sessionUser.name} placeholder={t('Nom complet', 'Full name')} className="rounded-xl border px-3 py-2" />
          <input name="phone" defaultValue={sessionUser.phone} placeholder={t('Telephone', 'Phone')} className="rounded-xl border px-3 py-2" />

          <select
            name="country"
            defaultValue={sessionUser.country}
            onChange={(event) => setCountry(event.target.value)}
            className="rounded-xl border px-3 py-2"
          >
            {[sessionUser.country, 'Cameroun', 'Cote d\'Ivoire', 'Senegal', 'Congo', 'Tchad', 'Nigeria', 'Kenya']
              .filter((value, index, array) => array.indexOf(value) === index)
              .map((entry) => (
                <option key={entry} value={entry}>{entry}</option>
              ))}
          </select>

          <select name="city" defaultValue={sessionUser.city} className="rounded-xl border px-3 py-2">
            {(availableCities.length > 0 ? availableCities : [sessionUser.city]).map((entry) => (
              <option key={entry} value={entry}>{entry}</option>
            ))}
          </select>

          {sessionUser.role === 'seller' ? (
            <>
              <input name="company" placeholder={t('Nom de boutique', 'Store name')} className="rounded-xl border px-3 py-2 md:col-span-2" />
              <textarea name="about" placeholder={t('Description boutique', 'Store description')} className="h-24 rounded-xl border px-3 py-2 md:col-span-2" />
            </>
          ) : null}

          <button className="rounded-xl bg-dark px-4 py-2 font-semibold text-white md:col-span-2">{t('Enregistrer', 'Save profile')}</button>
          {sessionUser.role !== 'admin' ? (
            <button type="button" onClick={onDeleteAccount} className="rounded-xl border border-red-300 px-4 py-2 font-semibold text-red-600 md:col-span-2">
              {t('Supprimer mon compte', 'Delete my account')}
            </button>
          ) : (
            <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-700 md:col-span-2">
              {t('Le compte admin ne peut pas etre supprime depuis le profil.', 'Admin account cannot be deleted from profile.')}
            </p>
          )}
          {status ? <p className="text-sm md:col-span-2">{status}</p> : null}
        </form>
      </div>
    </section>
  );
}
