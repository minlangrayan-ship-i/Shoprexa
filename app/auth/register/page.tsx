'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { africaCountries, countryPhonePrefixes } from '@/lib/mock-marketplace';
import { useSite } from '@/components/site-context';

export default function RegisterPage() {
  const router = useRouter();
  const { register, t } = useSite();
  const [country, setCountry] = useState(africaCountries[0].country);
  const [role, setRole] = useState<'client' | 'seller'>('client');
  const [preferences, setPreferences] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const cities = useMemo(() => africaCountries.find((entry) => entry.country === country)?.cities ?? [], [country]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get('name')),
      email: String(formData.get('email')),
      phone: String(formData.get('phone')),
      password: String(formData.get('password')),
      role: String(formData.get('role')) as 'client' | 'seller',
      sellerType: String(formData.get('sellerType') ?? 'min_shop') as 'min_shop' | 'dropshipper' | 'company',
      country: String(formData.get('country')),
      city: String(formData.get('city')),
      preferences
    };

    const result = register(payload);
    setStatus(result.message);
    setLoading(false);

    if (!result.ok || !result.user) return;
    if (result.user.role === 'seller') router.push('/seller/dashboard');
    else if (result.user.role === 'admin') router.push('/admin');
    else router.push('/client/home');
  };

  return (
    <section className="section py-14">
      <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-7 shadow-sm">
        <h1 className="text-3xl font-bold">{t('Inscription ouverte', 'Open registration')}</h1>
        <p className="mt-2 text-sm text-slate-600">
          {t('Creation de compte rapide et rassurante. Connexion Google/telephone pourra etre ajoutee ensuite.', 'Fast and trusted account creation. Google/phone login can be added later.')}
        </p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-3 md:grid-cols-2">
          <input required name="name" placeholder={t('Nom complet', 'Full name')} className="rounded-xl border px-3 py-2" />
          <input required type="email" name="email" placeholder="Email" className="rounded-xl border px-3 py-2" />
          <input
            required
            name="phone"
            placeholder={`${t('WhatsApp / Telephone', 'WhatsApp / Phone')} (${countryPhonePrefixes[country] ?? '+'}...)`}
            className="rounded-xl border px-3 py-2"
          />
          <input required minLength={8} type="password" name="password" placeholder={t('Mot de passe (8+)', 'Password (8+)')} className="rounded-xl border px-3 py-2" />

          <select required name="role" value={role} onChange={(event) => setRole(event.target.value as 'client' | 'seller')} className="rounded-xl border px-3 py-2">
            <option value="client">{t('Client', 'Client')}</option>
            <option value="seller">{t('Vendeur', 'Seller')}</option>
          </select>

          {role === 'seller' ? (
            <select name="sellerType" className="rounded-xl border px-3 py-2">
              <option value="min_shop">Vendeur Min-shop</option>
              <option value="dropshipper">Dropshipper</option>
              <option value="company">Entreprise (produits/services)</option>
            </select>
          ) : (
            <input value="client standard" disabled className="rounded-xl border bg-slate-50 px-3 py-2 text-slate-500" />
          )}

          <select
            required
            name="country"
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            className="rounded-xl border px-3 py-2"
          >
            {africaCountries.map((entry) => (
              <option key={entry.country} value={entry.country}>{entry.country}</option>
            ))}
          </select>

          <select required name="city" className="rounded-xl border px-3 py-2 md:col-span-2">
            {cities.map((entry) => (
              <option key={entry} value={entry}>{entry}</option>
            ))}
          </select>

          {role === 'client' ? (
            <div className="rounded-xl border p-3 md:col-span-2">
              <p className="mb-2 text-sm font-semibold">{t('Vos preferences produits', 'Your product preferences')}</p>
              <div className="grid gap-2 text-sm md:grid-cols-3">
                {[
                  ['energie', 'Energie'],
                  ['cuisine', 'Cuisine'],
                  ['securite', 'Securite'],
                  ['mobilite', 'Mobilite'],
                  ['fitness', 'Fitness'],
                  ['organisation', 'Organisation']
                ].map(([slug, label]) => (
                  <label key={slug} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={preferences.includes(slug)}
                      onChange={(event) =>
                        setPreferences((current) =>
                          event.target.checked ? [...current, slug] : current.filter((entry) => entry !== slug)
                        )
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          <button disabled={loading} className="rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white md:col-span-2">
            {loading ? t('Creation...', 'Creating...') : t('Creer mon compte', 'Create my account')}
          </button>
          {status ? <p className="text-sm md:col-span-2">{status}</p> : null}
        </form>
      </div>
    </section>
  );
}
