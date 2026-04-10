'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  africaCountries,
  defaultAvatar,
  demoUsers,
  findUserByCredentials,
  marketplaceProducts,
  seededRecruitmentOffers,
  seededReviews,
  seededSellerOrders,
  sellerProfiles,
  type AccountRole,
  type DemoUser,
  type MarketplaceProduct,
  type RecruitmentOffer,
  type MarketplaceSeller,
  type SellerType,
  type SellerOrder,
  type SellerReview
} from '@/lib/mock-marketplace';

type Locale = 'fr' | 'en';

type SessionUser = Pick<DemoUser, 'id' | 'name' | 'email' | 'role' | 'country' | 'city' | 'phone' | 'avatar' | 'sellerId' | 'sellerType'>;

type RegisterPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'client' | 'seller';
  sellerType?: SellerType;
  country: string;
  city: string;
};

type ProfileUpdatePayload = {
  name: string;
  phone: string;
  country: string;
  city: string;
  avatar?: string;
  company?: string;
  about?: string;
};

type SiteContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  country: string;
  city: string;
  availableCities: string[];
  setCountry: (country: string) => void;
  setCity: (city: string) => void;
  sessionUser: SessionUser | null;
  users: DemoUser[];
  sellers: MarketplaceSeller[];
  products: MarketplaceProduct[];
  orders: SellerOrder[];
  reviews: SellerReview[];
  recruitmentOffers: RecruitmentOffer[];
  login: (email: string, password: string) => { ok: boolean; message: string; user?: SessionUser };
  register: (payload: RegisterPayload) => { ok: boolean; message: string; user?: SessionUser };
  logout: () => void;
  updateProfile: (payload: ProfileUpdatePayload) => { ok: boolean; message: string };
  addReview: (review: Omit<SellerReview, 'id' | 'createdAt'>) => void;
  addSellerProduct: (payload: {
    name: string;
    description: string;
    price: number;
    stock: number;
    categorySlug: string;
    images: string[];
  }) => { ok: boolean; message: string };
  updateSellerProduct: (productId: string, payload: Partial<Pick<MarketplaceProduct, 'name' | 'description' | 'price' | 'stock' | 'images'>>) => void;
  deleteSellerProduct: (productId: string) => void;
  updateSellerStock: (productId: string, stock: number) => void;
  adminAddProduct: (payload: {
    sellerId: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    categorySlug: string;
    images: string[];
  }) => { ok: boolean; message: string };
  adminUpdateProduct: (
    productId: string,
    payload: Partial<Pick<MarketplaceProduct, 'name' | 'description' | 'price' | 'stock' | 'images' | 'categorySlug'>>
  ) => { ok: boolean; message: string };
  adminDeleteProduct: (productId: string) => { ok: boolean; message: string };
  companySendRecruitmentOffer: (targetSellerId: string, productIds: string[]) => { ok: boolean; message: string };
  respondRecruitmentOffer: (offerId: string, decision: 'accepted' | 'rejected') => { ok: boolean; message: string };
  adminChangeUserRole: (userId: string, role: AccountRole) => { ok: boolean; message: string };
  adminDeleteUser: (userId: string) => { ok: boolean; message: string };
  t: (fr: string, en: string) => string;
};

const STORAGE_KEY = 'min-shop-site-context-v3';

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('fr');
  const [country, setCountryState] = useState<string>(africaCountries[0].country);
  const [city, setCityState] = useState<string>(africaCountries[0].cities[0]);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [users, setUsers] = useState<DemoUser[]>(demoUsers);
  const [sellers, setSellers] = useState<MarketplaceSeller[]>(sellerProfiles);
  const [products, setProducts] = useState<MarketplaceProduct[]>(marketplaceProducts);
  const [orders] = useState<SellerOrder[]>(seededSellerOrders);
  const [reviews, setReviews] = useState<SellerReview[]>(seededReviews);
  const [recruitmentOffers, setRecruitmentOffers] = useState<RecruitmentOffer[]>(seededRecruitmentOffers);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as {
        locale?: Locale;
        country?: string;
        city?: string;
        sessionUser?: SessionUser | null;
        users?: DemoUser[];
        sellers?: MarketplaceSeller[];
        products?: MarketplaceProduct[];
        reviews?: SellerReview[];
        recruitmentOffers?: RecruitmentOffer[];
      };

      if (parsed.locale === 'fr' || parsed.locale === 'en') setLocale(parsed.locale);
      if (parsed.country) setCountryState(parsed.country);
      if (parsed.city) setCityState(parsed.city);
      if (parsed.sessionUser) setSessionUser(parsed.sessionUser);
      if (parsed.users?.length) setUsers(parsed.users);
      if (parsed.sellers?.length) setSellers(parsed.sellers);
      if (parsed.products?.length) setProducts(parsed.products);
      if (parsed.reviews?.length) setReviews(parsed.reviews);
      if (parsed.recruitmentOffers?.length) setRecruitmentOffers(parsed.recruitmentOffers);
    } catch {
      // Ignore localStorage parsing errors.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ locale, country, city, sessionUser, users, sellers, products, reviews, recruitmentOffers }));
  }, [locale, country, city, sessionUser, users, sellers, products, reviews, recruitmentOffers]);

  const availableCities = useMemo(() => africaCountries.find((entry) => entry.country === country)?.cities ?? [], [country]);

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

  const mapSession = (user: DemoUser): SessionUser => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    country: user.country,
    city: user.city,
    phone: user.phone,
    avatar: user.avatar ?? defaultAvatar,
    sellerId: user.sellerId,
    sellerType: user.sellerType
  });

  const login = (email: string, password: string) => {
    const user = findUserByCredentials(users, email, password);
    if (!user) return { ok: false, message: locale === 'fr' ? 'Identifiants invalides.' : 'Invalid credentials.' };

    const session = mapSession(user);
    setSessionUser(session);
    setCountryState(user.country);
    setCityState(user.city);

    return { ok: true, message: locale === 'fr' ? `Bienvenue ${user.name}` : `Welcome ${user.name}`, user: session };
  };

  const register = (payload: RegisterPayload) => {
    if (!payload.name.trim()) return { ok: false, message: t('Nom requis.', 'Name is required.') };
    if (!payload.email.includes('@')) return { ok: false, message: t('Email invalide.', 'Invalid email.') };
    if (payload.password.length < 8) return { ok: false, message: t('Mot de passe trop court (8+).', 'Password too short (8+).') };
    if (!payload.phone.trim()) return { ok: false, message: t('Telephone requis.', 'Phone is required.') };

    const exists = users.some((user) => user.email.toLowerCase() === payload.email.toLowerCase());
    if (exists) return { ok: false, message: t('Cet email existe deja.', 'This email already exists.') };

    const userId = `user-${Date.now()}`;
    const sellerId = payload.role === 'seller' ? `seller-${Date.now()}` : undefined;
    const sellerType = payload.role === 'seller' ? payload.sellerType ?? 'min_shop' : undefined;

    const nextUser: DemoUser = {
      id: userId,
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.role,
      country: payload.country,
      city: payload.city,
      phone: payload.phone,
      avatar: defaultAvatar,
      sellerId,
      sellerType
    };

    setUsers((current) => [nextUser, ...current]);

    if (payload.role === 'seller' && sellerId) {
      setSellers((current) => [
        {
          id: sellerId,
          slug: `${payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
          name: payload.name,
          company:
            sellerType === 'company'
              ? `${payload.name.split(' ')[0]} Entreprise`
              : sellerType === 'dropshipper'
                ? `${payload.name.split(' ')[0]} Dropship`
                : `${payload.name.split(' ')[0]} Store`,
          email: payload.email,
          password: payload.password,
          phone: payload.phone,
          country: payload.country,
          city: payload.city,
          verified: sellerType === 'company',
          sellerType,
          about: 'Nouveau vendeur Min-shop.'
        },
        ...current
      ]);
    }

    const session = mapSession(nextUser);
    setSessionUser(session);

    return { ok: true, message: t('Compte cree avec succes.', 'Account created successfully.'), user: session };
  };

  const logout = () => setSessionUser(null);

  const updateProfile = (payload: ProfileUpdatePayload) => {
    if (!sessionUser) return { ok: false, message: t('Session introuvable.', 'Session not found.') };

    setUsers((current) =>
      current.map((user) =>
        user.id === sessionUser.id
          ? {
              ...user,
              name: payload.name,
              phone: payload.phone,
              country: payload.country,
              city: payload.city,
              avatar: payload.avatar ?? user.avatar
            }
          : user
      )
    );

    if (sessionUser.sellerId) {
      setSellers((current) =>
        current.map((seller) =>
          seller.id === sessionUser.sellerId
            ? {
                ...seller,
                name: payload.name,
                phone: payload.phone,
                country: payload.country,
                city: payload.city,
                company: payload.company ?? seller.company,
                about: payload.about ?? seller.about,
                logoUrl: payload.avatar ?? seller.logoUrl
              }
            : seller
        )
      );
    }

    setSessionUser((current) =>
      current
        ? {
            ...current,
            name: payload.name,
            phone: payload.phone,
            country: payload.country,
            city: payload.city,
            avatar: payload.avatar ?? current.avatar
          }
        : current
    );

    return { ok: true, message: t('Profil mis a jour.', 'Profile updated.') };
  };

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

  const addSellerProduct = (payload: {
    name: string;
    description: string;
    price: number;
    stock: number;
    categorySlug: string;
    images: string[];
  }) => {
    if (!sessionUser?.sellerId) return { ok: false, message: t('Acces vendeur requis.', 'Seller access required.') };

    const seller = sellers.find((entry) => entry.id === sessionUser.sellerId);
    if (!seller) return { ok: false, message: t('Profil vendeur introuvable.', 'Seller profile not found.') };

    const categoryLabel = {
      energie: 'Energie',
      cuisine: 'Cuisine',
      securite: 'Securite',
      mobilite: 'Mobilite',
      fitness: 'Fitness',
      organisation: 'Organisation'
    }[payload.categorySlug] ?? 'Divers';

    const product: MarketplaceProduct = {
      id: `prod-${Date.now()}`,
      slug: `${payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`,
      name: payload.name,
      description: payload.description,
      price: payload.price,
      oldPrice: null,
      stock: payload.stock,
      images: payload.images.length ? payload.images : [
        'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1400&q=85&auto=format&fit=crop'
      ],
      category: categoryLabel,
      categorySlug: payload.categorySlug,
      problemTag: 'Produit vendeur',
      sellerId: seller.id,
      companyName: seller.company,
      sellerCountry: seller.country,
      sellerCity: seller.city,
      badges: ['new'],
      averageRating: 4.0,
      viewCount: 0
    };

    setProducts((current) => [product, ...current]);
    return { ok: true, message: t('Produit ajoute.', 'Product added.') };
  };

  const updateSellerProduct = (
    productId: string,
    payload: Partial<Pick<MarketplaceProduct, 'name' | 'description' | 'price' | 'stock' | 'images'>>
  ) => {
    if (!sessionUser?.sellerId) return;
    setProducts((current) =>
      current.map((product) =>
        product.id === productId && product.sellerId === sessionUser.sellerId
          ? {
              ...product,
              ...payload,
              badges: (payload.stock ?? product.stock) <= 10 ? Array.from(new Set([...product.badges, 'low_stock'])) : product.badges.filter((badge) => badge !== 'low_stock')
            }
          : product
      )
    );
  };

  const deleteSellerProduct = (productId: string) => {
    if (!sessionUser?.sellerId) return;
    setProducts((current) => current.filter((product) => !(product.id === productId && product.sellerId === sessionUser.sellerId)));
  };

  const updateSellerStock = (productId: string, stock: number) => {
    updateSellerProduct(productId, { stock });
  };

  const categoryLabels: Record<string, string> = {
    energie: 'Energie',
    cuisine: 'Cuisine',
    securite: 'Securite',
    mobilite: 'Mobilite',
    fitness: 'Fitness',
    organisation: 'Organisation'
  };

  const adminAddProduct = (payload: {
    sellerId: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    categorySlug: string;
    images: string[];
  }) => {
    if (sessionUser?.role !== 'admin') return { ok: false, message: t('Action reservee admin.', 'Admin-only action.') };
    const seller = sellers.find((entry) => entry.id === payload.sellerId);
    if (!seller) return { ok: false, message: t('Vendeur introuvable.', 'Seller not found.') };

    const product: MarketplaceProduct = {
      id: `prod-${Date.now()}`,
      slug: `${payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`,
      name: payload.name,
      description: payload.description,
      price: payload.price,
      oldPrice: null,
      stock: seller.sellerType === 'dropshipper' ? 0 : payload.stock,
      images: payload.images.length ? payload.images : ['https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1400&q=85&auto=format&fit=crop'],
      category: categoryLabels[payload.categorySlug] ?? 'Divers',
      categorySlug: payload.categorySlug,
      problemTag: 'Catalogue admin',
      sellerId: seller.id,
      companyName: seller.company,
      sellerCountry: seller.country,
      sellerCity: seller.city,
      badges: ['new'],
      averageRating: 4.0,
      viewCount: 0
    };
    setProducts((current) => [product, ...current]);
    return { ok: true, message: t('Produit ajoute par admin.', 'Product added by admin.') };
  };

  const companySendRecruitmentOffer = (targetSellerId: string, productIds: string[]) => {
    if (!sessionUser?.sellerId || sessionUser.role !== 'seller' || sessionUser.sellerType !== 'company') {
      return { ok: false, message: t('Action reservee aux entreprises.', 'Company-only action.') };
    }
    if (!targetSellerId || productIds.length === 0) {
      return { ok: false, message: t('Selection incomplete.', 'Selection incomplete.') };
    }
    setRecruitmentOffers((current) => [
      {
        id: `offer-${Date.now()}`,
        companySellerId: sessionUser.sellerId!,
        targetSellerId,
        productIds,
        status: 'pending',
        createdAt: new Date().toISOString().slice(0, 10)
      },
      ...current
    ]);
    return { ok: true, message: t('Offre envoyee.', 'Offer sent.') };
  };

  const respondRecruitmentOffer = (offerId: string, decision: 'accepted' | 'rejected') => {
    if (!sessionUser?.sellerId || sessionUser.role !== 'seller') {
      return { ok: false, message: t('Session vendeur requise.', 'Seller session required.') };
    }
    setRecruitmentOffers((current) =>
      current.map((offer) =>
        offer.id === offerId && offer.targetSellerId === sessionUser.sellerId ? { ...offer, status: decision } : offer
      )
    );
    return { ok: true, message: decision === 'accepted' ? t('Offre acceptee.', 'Offer accepted.') : t('Offre refusee.', 'Offer rejected.') };
  };

  const adminUpdateProduct = (
    productId: string,
    payload: Partial<Pick<MarketplaceProduct, 'name' | 'description' | 'price' | 'stock' | 'images' | 'categorySlug'>>
  ) => {
    if (sessionUser?.role !== 'admin') return { ok: false, message: t('Action reservee admin.', 'Admin-only action.') };
    setProducts((current) =>
      current.map((product) =>
        product.id === productId
          ? {
              ...product,
              ...payload,
              category: payload.categorySlug ? categoryLabels[payload.categorySlug] ?? product.category : product.category,
              badges:
                (payload.stock ?? product.stock) <= 10
                  ? Array.from(new Set([...product.badges, 'low_stock']))
                  : product.badges.filter((badge) => badge !== 'low_stock')
            }
          : product
      )
    );
    return { ok: true, message: t('Produit mis a jour.', 'Product updated.') };
  };

  const adminDeleteProduct = (productId: string) => {
    if (sessionUser?.role !== 'admin') return { ok: false, message: t('Action reservee admin.', 'Admin-only action.') };
    setProducts((current) => current.filter((product) => product.id !== productId));
    return { ok: true, message: t('Produit supprime.', 'Product deleted.') };
  };

  const adminChangeUserRole = (userId: string, role: AccountRole) => {
    if (sessionUser?.role !== 'admin') return { ok: false, message: t('Action reservee admin.', 'Admin-only action.') };
    if (sessionUser.id === userId && role !== 'admin') return { ok: false, message: t('Tu ne peux pas retirer ton role admin.', 'You cannot remove your own admin role.') };

    const targetUser = users.find((entry) => entry.id === userId);
    if (!targetUser) return { ok: false, message: t('Utilisateur introuvable.', 'User not found.') };

    setUsers((current) =>
      current.map((user) =>
        user.id === userId
          ? {
              ...user,
              role,
              sellerId: role === 'seller' ? user.sellerId ?? `seller-${user.id}` : undefined
            }
          : user
      )
    );

    if (role === 'seller' && !targetUser.sellerId) {
      setSellers((current) => [
        {
          id: `seller-${targetUser.id}`,
          slug: `${targetUser.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
          name: targetUser.name,
          company: `${targetUser.name.split(' ')[0]} Store`,
          email: targetUser.email,
          password: targetUser.password,
          phone: targetUser.phone,
          country: targetUser.country,
          city: targetUser.city,
          verified: false,
          sellerType: 'min_shop',
          about: 'Nouveau vendeur Min-shop.'
        },
        ...current
      ]);
    }

    return { ok: true, message: t('Role mis a jour.', 'Role updated.') };
  };

  const adminDeleteUser = (userId: string) => {
    if (sessionUser?.role !== 'admin') return { ok: false, message: t('Action reservee admin.', 'Admin-only action.') };
    if (sessionUser.id === userId) return { ok: false, message: t('Tu ne peux pas supprimer ton propre compte.', 'You cannot delete your own account.') };

    const target = users.find((entry) => entry.id === userId);
    if (!target) return { ok: false, message: t('Utilisateur introuvable.', 'User not found.') };

    setUsers((current) => current.filter((user) => user.id !== userId));

    if (target.sellerId) {
      setSellers((current) => current.filter((seller) => seller.id !== target.sellerId));
      setProducts((current) => current.filter((product) => product.sellerId !== target.sellerId));
    }

    return { ok: true, message: t('Compte supprime.', 'Account deleted.') };
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
        users,
        sellers,
        products,
        orders,
        reviews,
        recruitmentOffers,
        login,
        register,
        logout,
        updateProfile,
        addReview,
        addSellerProduct,
        updateSellerProduct,
        deleteSellerProduct,
        updateSellerStock,
        adminAddProduct,
        adminUpdateProduct,
        adminDeleteProduct,
        companySendRecruitmentOffer,
        respondRecruitmentOffer,
        adminChangeUserRole,
        adminDeleteUser,
        t
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
