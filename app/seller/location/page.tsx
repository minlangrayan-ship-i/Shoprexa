'use client';

import { FormEvent, useMemo, useState } from 'react';
import { SellerLayout } from '@/components/seller-layout';
import { useSite } from '@/components/site-context';
import { getCityDistricts, getLaunchCities, launchCountryName } from '@/lib/geo-config';

export default function SellerLocationPage() {
  const { t, sessionUser, city } = useSite();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number; verified: boolean } | null>(null);
  const [formCity, setFormCity] = useState(city);
  const [formDistrict, setFormDistrict] = useState(getCityDistricts(city)[0] ?? '');

  const cities = useMemo(() => getLaunchCities(), []);
  const districts = useMemo(() => getCityDistricts(formCity), [formCity]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus('');

    const formData = new FormData(event.currentTarget);
    const payload = {
      country: launchCountryName,
      city: formCity,
      district: formDistrict,
      address: String(formData.get('address')),
      sellerId: sessionUser?.sellerId
    };

    try {
      const response = await fetch('/api/seller/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        setStatus(t('Erreur lors de la sauvegarde de la localisation.', 'Error while saving location.'));
        setLoading(false);
        return;
      }

      const data = await response.json();
      setCoords({ lat: data.location.latitude, lng: data.location.longitude, verified: data.location.locationVerified });
      setStatus(
        data.location.locationVerified
          ? t('Localisation vérifiée et enregistrée.', 'Location verified and saved.')
          : t('Adresse enregistrée avec fallback local. Vérifiez le format pour une validation complète.', 'Address saved with local fallback. Improve format to get full verification.')
      );
    } catch {
      setStatus(t('Service de géocodage indisponible.', 'Geocoding service unavailable.'));
    }

    setLoading(false);
  };

  return (
    <SellerLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t('Localisation vendeur', 'Seller location')}</h1>

        <form onSubmit={onSubmit} className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2">
            <input value={launchCountryName} readOnly className="rounded-xl border bg-slate-50 px-3 py-2 text-slate-600" />
            <select value={formCity} onChange={(event) => setFormCity(event.target.value)} required className="rounded-xl border px-3 py-2">
              {cities.map((entry) => (
                <option key={entry} value={entry}>{entry}</option>
              ))}
            </select>
            <select value={formDistrict} onChange={(event) => setFormDistrict(event.target.value)} required className="rounded-xl border px-3 py-2">
              {districts.map((entry) => (
                <option key={entry} value={entry}>{entry}</option>
              ))}
            </select>
            <input name="address" required className="rounded-xl border px-3 py-2" placeholder={t('Adresse complète', 'Full address')} />
          </div>

          <button disabled={loading} className="mt-4 rounded-xl bg-dark px-4 py-2 font-semibold text-white">
            {loading ? t('Validation...', 'Validating...') : t('Valider et enregistrer', 'Validate and save')}
          </button>

          {status ? <p className="mt-3 text-sm text-slate-700">{status}</p> : null}
          {coords ? (
            <p className="mt-1 text-xs text-slate-500">
              {t('Coordonnées', 'Coordinates')}: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} ({coords.verified ? t('vérifiée', 'verified') : t('à vérifier', 'needs review')})
            </p>
          ) : null}
        </form>
      </div>
    </SellerLayout>
  );
}
