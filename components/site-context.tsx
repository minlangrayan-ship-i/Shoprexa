'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  africaCountries,
  demoUsers,
  findUserByCredentials,
  seededReviews,
  type DemoUser,
  type SellerReview
} from '@/lib/mock-marketplace';

type Locale = 'fr' | 'en';

type SessionUser = Pick<DemoUser, 'id' | 'name' | 'email' | 'role' | 'country' | 'city' | 'sellerId'>;

type SiteContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  country: string;
  city: string;
  availableCities: string[];
  setCountry: (country: string) => void;
  setCity: (city: string) => void;
  sessionUser: SessionUser | null;
  login: (email: string, password: string) => { ok: boolean; message: string; user?: SessionUser };
  logout: () => void;
  reviews: SellerReview[];
  addReview: (review: Omit<SellerReview, 'id' | 'createdAt'>) => void;
  t: (fr: string, en: string) => string;
  demoAccounts: DemoUser[];
};

const STORAGE_KEY = 'min-shop-site-context-v1';

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('fr');
  const [country, setCountryState] = useState<string>(africaCountries[0].country);
  const [city, setCityState] = useState<string>(africaCountries[0].cities[0]);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [reviews, setReviews] = useState<SellerReview[]>(seededReviews);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as {
        locale?: Locale;
        country?: string;
        city?: string;
        sessionUser?: SessionUser | null;
        reviews?: SellerReview[];
      };

      if (parsed.locale === 'fr' || parsed.locale === 'en') setLocale(parsed.locale);
      if (parsed.country) setCountryState(parsed.country);
      if (parsed.city) setCityState(parsed.city);
      if (parsed.sessionUser) setSessionUser(parsed.sessionUser);
      if (parsed.reviews?.length) setReviews(parsed.reviews);
    } catch {
      // Ignore localStorage parsing errors.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ locale, country, city, sessionUser, reviews }));
  }, [locale, country, city, sessionUser, reviews]);

  const availableCities = useMemo(() => {
    return africaCountries.find((entry) => entry.country === country)?.cities ?? [];
  }, [country]);

  useEffect(() => {
    if (!availableCities.includes(city) && availableCities.length > 0) {
      setCityState(availableCities[0]);
    }
  }, [availableCities, city]);

  const setCountry = (nextCountry: string) => {
    setCountryState(nextCountry);
    const cities = africaCountries.find((entry) => entry.country === nextCountry)?.cities ?? [];
    if (cities.length > 0) setCityState(cities[0]);
  };

  const login = (email: string, password: string) => {
    const user = findUserByCredentials(email, password);
    if (!user) return { ok: false, message: locale === 'fr' ? 'Identifiants invalides.' : 'Invalid credentials.' };

    const session: SessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      country: user.country,
      city: user.city,
      sellerId: user.sellerId
    };

    setSessionUser(session);
    setCountryState(user.country);
    setCityState(user.city);

    return {
      ok: true,
      message: locale === 'fr' ? `Bienvenue ${user.name}` : `Welcome ${user.name}`,
      user: session
    };
  };

  const logout = () => setSessionUser(null);

  const addReview = (review: Omit<SellerReview, 'id' | 'createdAt'>) => {
    setReviews((current) => [
      {
        ...review,
        id: `rev-${Date.now()}`,
        createdAt: new Date().toISOString()
      },
      ...current
    ]);
  };

  const t = (fr: string, en: string) => (locale === 'fr' ? fr : en);

  return (
    <SiteContext.Provider
      value={{
        locale,
        setLocale,
        country,
        city,
        availableCities,
        setCountry,
        setCity: setCityState,
        sessionUser,
        login,
        logout,
        reviews,
        addReview,
        t,
        demoAccounts: demoUsers
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) throw new Error('useSite must be used within SiteProvider');
  return context;
}
