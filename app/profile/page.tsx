'use client';

import Image from 'next/image';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSite } from '@/components/site-context';
import { getCityDistricts, getLaunchCities, launchCountryName } from '@/lib/geo-config';

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
  const { sessionUser, sellers, updateProfile, deleteCurrentAccount, t, availableCities, setCountry } = useSite();
  const [status, setStatus] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(sessionUser?.avatar);
  const [announcementImages, setAnnouncementImages] = useState<string[]>([]);

  const sellerProfile = sellers.find((seller) => seller.id === sessionUser?.sellerId);
  const launchCities = getLaunchCities();
  const [profileCity, setProfileCity] = useState(sessionUser.city);
  const districts = getCityDistricts(profileCity);

  if (!sessionUser) {
    return (
      <section className="section py-12">
        <div className="card p-6">{t('Connectez-vous pour acceder au profil.', 'Please log in to access the profile.')}</div>
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
      country: launchCountryName,
      city: String(formData.get('city')),
      district: String(formData.get('district') ?? ''),
      avatar,
      company: String(formData.get('company') ?? ''),
      about: String(formData.get('about') ?? ''),
      activityDescription: String(formData.get('activityDescription') ?? ''),
      openingHours: String(formData.get('openingHours') ?? ''),
      closingHours: String(formData.get('closingHours') ?? ''),
      linkedin: String(formData.get('linkedin') ?? ''),
      whatsapp: String(formData.get('whatsapp') ?? ''),
      instagram: String(formData.get('instagram') ?? ''),
      facebook: String(formData.get('facebook') ?? ''),
      twitter: String(formData.get('twitter') ?? ''),
      youtube: String(formData.get('youtube') ?? ''),
      announcementImages
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

  const onAnnouncementImagesChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    const base64Images = await Promise.all(files.slice(0, 5).map((file) => fileToBase64(file)));
    setAnnouncementImages(base64Images);
  };

  return (
    <section className="section py-12">
      <div className="mx-auto max-w-4xl rounded-2xl border bg-white p-6 shadow-sm">
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
            value={launchCountryName}
            onChange={() => setCountry(launchCountryName)}
            disabled
            className="rounded-xl border bg-slate-50 px-3 py-2 text-slate-600"
          >
            <option value={launchCountryName}>{launchCountryName}</option>
          </select>

          <select
            name="city"
            value={profileCity}
            onChange={(event) => setProfileCity(event.target.value)}
            className="rounded-xl border px-3 py-2"
          >
            {(availableCities.length > 0 ? availableCities : launchCities).map((entry) => (
              <option key={entry} value={entry}>{entry}</option>
            ))}
          </select>

          <select name="district" defaultValue={sessionUser.district ?? districts[0]} className="rounded-xl border px-3 py-2">
            {districts.map((entry) => (
              <option key={entry} value={entry}>{entry}</option>
            ))}
          </select>

          {sessionUser.role === 'seller' ? (
            <>
              <input
                name="company"
                defaultValue={sellerProfile?.company}
                placeholder={t('Nom de boutique', 'Store name')}
                className="rounded-xl border px-3 py-2 md:col-span-2"
              />
              <textarea
                name="about"
                defaultValue={sellerProfile?.about}
                placeholder={t('Resume court de la boutique', 'Short store summary')}
                className="h-24 rounded-xl border px-3 py-2 md:col-span-2"
              />
              <textarea
                name="activityDescription"
                defaultValue={sellerProfile?.activityDescription}
                placeholder={t('Description publique detaillee (minimum 350 caracteres)', 'Detailed public description (minimum 350 characters)')}
                className="h-40 rounded-xl border px-3 py-2 md:col-span-2"
              />
              <input name="openingHours" defaultValue={sellerProfile?.openingHours} placeholder={t('Heure d ouverture', 'Opening hour')} className="rounded-xl border px-3 py-2" />
              <input name="closingHours" defaultValue={sellerProfile?.closingHours} placeholder={t('Heure de fermeture', 'Closing hour')} className="rounded-xl border px-3 py-2" />
              <input name="linkedin" defaultValue={sellerProfile?.socialLinks?.linkedin} placeholder="LinkedIn URL" className="rounded-xl border px-3 py-2" />
              <input name="whatsapp" defaultValue={sellerProfile?.socialLinks?.whatsapp} placeholder="WhatsApp URL" className="rounded-xl border px-3 py-2" />
              <input name="instagram" defaultValue={sellerProfile?.socialLinks?.instagram} placeholder="Instagram URL" className="rounded-xl border px-3 py-2" />
              <input name="facebook" defaultValue={sellerProfile?.socialLinks?.facebook} placeholder="Facebook URL" className="rounded-xl border px-3 py-2" />
              <input name="twitter" defaultValue={sellerProfile?.socialLinks?.twitter} placeholder="Twitter/X URL" className="rounded-xl border px-3 py-2" />
              <input name="youtube" defaultValue={sellerProfile?.socialLinks?.youtube} placeholder="YouTube URL" className="rounded-xl border px-3 py-2" />
              <label className="rounded-xl border px-3 py-3 text-sm font-semibold md:col-span-2">
                {t('Ajouter des annonces publicitaires (images)', 'Add ad banners (images)')}
                <input type="file" accept="image/*" multiple onChange={onAnnouncementImagesChange} className="mt-2 block text-xs" />
              </label>
              {(announcementImages.length > 0 || (sellerProfile?.announcementImages?.length ?? 0) > 0) ? (
                <div className="grid gap-2 md:col-span-2 md:grid-cols-3">
                  {(announcementImages.length > 0 ? announcementImages : sellerProfile?.announcementImages ?? []).slice(0, 3).map((src, index) => (
                    <div key={`${src.slice(0, 20)}-${index}`} className="relative h-24 overflow-hidden rounded-lg border">
                      <Image src={src} alt={`Annonce ${index + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              ) : null}
              <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 md:col-span-2">
                {t(
                  'Le profil public vendeur devient accessible seulement si la description detaillee atteint 350 caracteres et si le texte reste propre et coherent pour l IA.',
                  'The public seller profile becomes accessible only if the detailed description reaches 350 characters and stays clean and coherent for the AI checks.'
                )}
              </p>
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
