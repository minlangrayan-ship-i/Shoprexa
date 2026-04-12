'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  africaCountries,
  countryPhonePrefixes,
  defaultAvatar,
  demoUsers,
  findUserByCredentials,
  getSellerTrustStats,
  marketplaceCategories,
  marketplaceProducts,
  seededRecruitmentOffers,
  seededSellerComplaints,
  seededTestimonials,
  seededReviews,
  seededSellerOrders,
  sellerProfiles,
  type AccountRole,
  type ClientTestimonial,
  type DemoUser,
  type MarketplaceProduct,
  type RecruitmentOffer,
  type MarketplaceSeller,
  type SellerComplaint,
  type SellerType,
  type SellerOrder,
  type SellerReview
} from '@/lib/mock-marketplace';
import type { CartItem } from '@/lib/types';

type Locale = 'fr' | 'en';

type SessionUser = Pick<DemoUser, 'id' | 'name' | 'email' | 'role' | 'country' | 'city' | 'phone' | 'avatar' | 'sellerId' | 'sellerType' | 'createdAt' | 'preferences'>;

type RegisterPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'client' | 'seller';
  sellerType?: SellerType;
  country: string;
  city: string;
  preferences?: string[];
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

type AdminNotification = {
  id: string;
  message: string;
  createdAt: string;
};

type DropshipperCatalogProposal = {
  id: string;
  dropshipperId: string;
  dropshipperName: string;
  productIds: string[];
  proposedByUserId: string;
  proposedByRole: 'admin' | 'dropshipper';
  target: 'all_vendors';
  createdAt: string;
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
  complaints: SellerComplaint[];
  testimonials: ClientTestimonial[];
  recruitmentOffers: RecruitmentOffer[];
  adminNotifications: AdminNotification[];
  dropshipperCatalogProposals: DropshipperCatalogProposal[];
  siteVisits: number;
  login: (email: string, password: string) => { ok: boolean; message: string; user?: SessionUser };
  register: (payload: RegisterPayload) => { ok: boolean; message: string; user?: SessionUser };
  logout: () => void;
  updateProfile: (payload: ProfileUpdatePayload) => { ok: boolean; message: string };
  addReview: (review: Omit<SellerReview, 'id' | 'createdAt'>) => { ok: boolean; message: string };
  addCompanyReviewForPartner: (payload: { targetSellerId: string; rating: number; comment: string }) => { ok: boolean; message: string };
  recordClientOrder: (items: CartItem[]) => void;
  addSellerProduct: (payload: {
    name: string;
    description: string;
    price: number;
    stock: number;
    categorySlug: string;
    images: string[];
    kind?: 'product' | 'service';
    serviceDuration?: string;
    serviceAvailability?: string;
    targetCountries?: string[];
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
    kind?: 'product' | 'service';
    serviceDuration?: string;
    serviceAvailability?: string;
    targetCountries?: string[];
  }) => { ok: boolean; message: string };
  adminUpdateProduct: (
    productId: string,
    payload: Partial<Pick<MarketplaceProduct, 'name' | 'description' | 'price' | 'stock' | 'images' | 'categorySlug'>>
  ) => { ok: boolean; message: string };
  adminDeleteProduct: (productId: string) => { ok: boolean; message: string };
  companySendRecruitmentOffer: (targetSellerId: string, productIds: string[], commissionRate: number) => { ok: boolean; message: string };
  respondRecruitmentOffer: (offerId: string, decision: 'accepted' | 'rejected') => { ok: boolean; message: string };
  adminChangeUserRole: (userId: string, role: AccountRole) => { ok: boolean; message: string };
  adminDeleteUser: (userId: string) => { ok: boolean; message: string };
  proposeDropshipperCatalog: (payload: {
    dropshipperId: string;
    dropshipperName: string;
    productIds: string[];
  }) => { ok: boolean; message: string };
  deleteCurrentAccount: () => { ok: boolean; message: string };
  t: (fr: string, en: string) => string;
};

const STORAGE_KEY = 'min-shop-site-context-v5';
const PRIMARY_ADMIN_ID = 'admin-1';
const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  marketplaceCategories.map((category) => [category.slug, category.label])
);

function normalizeSingleAdmin(users: DemoUser[]) {
  return users.map((user) => {
    if (user.id === PRIMARY_ADMIN_ID) return { ...user, role: 'admin' as const };
    if (user.role === 'admin') return { ...user, role: user.sellerId ? 'seller' as const : 'client' as const };
    return user;
  });
}

function normalizeSellersSnapshot(sellers: MarketplaceSeller[]) {
  const map = new Map<string, MarketplaceSeller>();
  for (const seller of sellerProfiles) map.set(seller.id, seller);
  for (const seller of sellers) map.set(seller.id, seller);
  return Array.from(map.values());
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('fr');
  const [country, setCountryState] = useState<string>(africaCountries[0].country);
  const [city, setCityState] = useState<string>(africaCountries[0].cities[0]);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [users, setUsers] = useState<DemoUser[]>(normalizeSingleAdmin(demoUsers));
  const [sellers, setSellers] = useState<MarketplaceSeller[]>(normalizeSellersSnapshot(sellerProfiles));
  const [products, setProducts] = useState<MarketplaceProduct[]>(marketplaceProducts);
  const [orders, setOrders] = useState<SellerOrder[]>(seededSellerOrders);
  const [reviews, setReviews] = useState<SellerReview[]>(seededReviews);
  const [complaints] = useState<SellerComplaint[]>(seededSellerComplaints);
  const [testimonials] = useState<ClientTestimonial[]>(seededTestimonials);
  const [recruitmentOffers, setRecruitmentOffers] = useState<RecruitmentOffer[]>(seededRecruitmentOffers);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);
  const [dropshipperCatalogProposals, setDropshipperCatalogProposals] = useState<DropshipperCatalogProposal[]>([]);
  const [siteVisits, setSiteVisits] = useState(0);

  useEffect(() => {
    const key = 'min-shop-site-visits';
    const next = Number(localStorage.getItem(key) ?? '0') + 1;
    localStorage.setItem(key, String(next));
    setSiteVisits(next);
  }, []);

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
        orders?: SellerOrder[];
        reviews?: SellerReview[];
        recruitmentOffers?: RecruitmentOffer[];
        adminNotifications?: AdminNotification[];
        dropshipperCatalogProposals?: DropshipperCatalogProposal[];
        siteVisits?: number;
      };

      if (parsed.locale === 'fr' || parsed.locale === 'en') setLocale(parsed.locale);
      if (parsed.country) setCountryState(parsed.country);
      if (parsed.city) setCityState(parsed.city);
      if (parsed.sessionUser) setSessionUser(parsed.sessionUser);
      if (parsed.users?.length) setUsers(normalizeSingleAdmin(parsed.users));
      if (parsed.sellers?.length) setSellers(normalizeSellersSnapshot(parsed.sellers));
      if (parsed.products?.length) setProducts(parsed.products);
      if (parsed.orders?.length) setOrders(parsed.orders);
      if (parsed.reviews?.length) setReviews(parsed.reviews);
      if (parsed.recruitmentOffers?.length) {
        setRecruitmentOffers(
          parsed.recruitmentOffers.map((offer) => ({ ...offer, commissionRate: offer.commissionRate ?? 10 }))
        );
      }
      if (parsed.adminNotifications?.length) setAdminNotifications(parsed.adminNotifications);
      if (parsed.dropshipperCatalogProposals?.length) setDropshipperCatalogProposals(parsed.dropshipperCatalogProposals);
      if (typeof parsed.siteVisits === 'number') setSiteVisits(parsed.siteVisits);
    } catch {
      // Ignore localStorage parsing errors.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        locale,
        country,
        city,
        sessionUser,
        users,
        sellers,
        products,
        orders,
        reviews,
        recruitmentOffers,
        adminNotifications,
        dropshipperCatalogProposals,
        siteVisits
      })
    );
  }, [
    locale,
    country,
    city,
    sessionUser,
    users,
    sellers,
    products,
    orders,
    reviews,
    recruitmentOffers,
    adminNotifications,
    dropshipperCatalogProposals,
    siteVisits
  ]);

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
    sellerType: user.sellerType,
    createdAt: user.createdAt,
    preferences: user.preferences ?? []
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
    if (!payload.phone.trim()) return { ok: false, message: t('Téléphone requis.', 'Phone is required.') };
    const expectedPrefix = countryPhonePrefixes[payload.country] ?? '+';
    if (!payload.phone.startsWith(expectedPrefix)) {
      return {
        ok: false,
        message: t(`Le numero doit commencer par ${expectedPrefix}.`, `Phone number must start with ${expectedPrefix}.`)
      };
    }

    const exists = users.some((user) => user.email.toLowerCase() === payload.email.toLowerCase());
    if (exists) return { ok: false, message: t('Cet email existe déjà.', 'This email already exists.') };

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
      sellerType,
      createdAt: new Date().toISOString().slice(0, 10),
      preferences: payload.preferences ?? []
    };

    setUsers((current) => [nextUser, ...current]);

    if (payload.role === 'seller' && sellerId) {
      const nextSellerType: SellerType = payload.sellerType ?? 'min_shop';
      setSellers((current) => [
        {
          id: sellerId,
          slug: `${payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
          name: payload.name,
          company:
            nextSellerType === 'company'
              ? `${payload.name.split(' ')[0]} Entreprise`
              : nextSellerType === 'dropshipper'
                ? `${payload.name.split(' ')[0]} Dropship`
                : `${payload.name.split(' ')[0]} Store`,
          email: payload.email,
          password: payload.password,
          phone: payload.phone,
          country: payload.country,
          city: payload.city,
          verified: false,
          identityVerified: false,
          sellerType: nextSellerType,
          about: 'Nouveau vendeur Min-shop.'
        },
        ...current
      ]);
    }

    const session = mapSession(nextUser);
    setSessionUser(session);

    return { ok: true, message: t('Compte créé avec succès.', 'Account created successfully.'), user: session };
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

    return { ok: true, message: t('Profil mis à jour.', 'Profile updated.') };
  };

  const addReview = (review: Omit<SellerReview, 'id' | 'createdAt'>) => {
    if (!sessionUser || sessionUser.role !== 'client') {
      return { ok: false, message: t('Seuls les clients inscrits et connectés peuvent noter un vendeur.', 'Only registered, logged-in clients can rate a seller.') };
    }
    const hasPurchasedFromSeller = orders.some(
      (order) => order.customerName === sessionUser.name && order.sellerId === review.sellerId
    );
    if (!hasPurchasedFromSeller) {
      return {
        ok: false,
        message: t('Tu peux noter uniquement un vendeur avec lequel tu as déjà acheté.', 'You can review only sellers you already purchased from.')
      };
    }

    setReviews((current) => [
      {
        ...review,
        id: `rev-${Date.now()}`,
        createdAt: new Date().toISOString()
      },
      ...current
    ]);
    return { ok: true, message: t('Avis enregistré. Merci !', 'Review submitted. Thank you!') };
  };

  const addCompanyReviewForPartner = (payload: { targetSellerId: string; rating: number; comment: string }) => {
    if (!sessionUser?.sellerId || sessionUser.role !== 'seller' || sessionUser.sellerType !== 'company') {
      return { ok: false, message: t('Action réservée aux entreprises.', 'Company-only action.') };
    }
    const target = sellers.find((entry) => entry.id === payload.targetSellerId);
    if (!target || target.sellerType !== 'dropshipper') {
      return { ok: false, message: t('Seuls les dropshippers peuvent être notés ici.', 'Only dropshippers can be reviewed here.') };
    }
    const acceptedCollaboration = recruitmentOffers.some(
      (offer) =>
        offer.companySellerId === sessionUser.sellerId &&
        offer.targetSellerId === payload.targetSellerId &&
        offer.status === 'accepted'
    );
    if (!acceptedCollaboration) {
      return {
        ok: false,
        message: t('Tu peux noter uniquement un dropshipper avec lequel tu as une collaboration acceptée.', 'You can review only a dropshipper with an accepted collaboration.')
      };
    }

    const company = sellers.find((entry) => entry.id === sessionUser.sellerId);
    setReviews((current) => [
      {
        id: `rev-company-${Date.now()}`,
        sellerId: payload.targetSellerId,
        customerName: `${company?.company ?? sessionUser.name} (Entreprise)`,
        rating: payload.rating,
        comment: payload.comment,
        createdAt: new Date().toISOString().slice(0, 10)
      },
      ...current
    ]);
    return { ok: true, message: t('Évaluation partenaire enregistrée.', 'Partner review recorded.') };
  };

  const recordClientOrder = (items: CartItem[]) => {
    if (!sessionUser || sessionUser.role !== 'client' || items.length === 0) return;
    const createdAt = new Date().toISOString().slice(0, 10);
    const nextOrders: SellerOrder[] = [];

    for (const item of items) {
      const product = products.find((entry) => entry.id === item.id);
      if (!product) continue;
      nextOrders.push({
        id: `ord-${Date.now()}-${item.id}`,
        sellerId: product.sellerId,
        productId: product.id,
        customerName: sessionUser.name,
        quantity: item.quantity,
        total: item.price * item.quantity,
        status: 'paid',
        createdAt
      });
      setAdminNotifications((current) => [
        {
          id: `notif-${Date.now()}-${item.id}`,
          message: `Transaction validee: ${sessionUser.name} -> ${product.companyName} (${item.quantity} x ${product.name})`,
          createdAt
        },
        ...current
      ]);
    }

    if (nextOrders.length > 0) {
      setOrders((current) => [...nextOrders, ...current]);
    }
  };

  const addSellerProduct = (payload: {
    name: string;
    description: string;
    price: number;
    stock: number;
    categorySlug: string;
    images: string[];
    kind?: 'product' | 'service';
    serviceDuration?: string;
    serviceAvailability?: string;
    targetCountries?: string[];
  }) => {
    if (!sessionUser?.sellerId) return { ok: false, message: t('Accès vendeur requis.', 'Seller access required.') };

    const seller = sellers.find((entry) => entry.id === sessionUser.sellerId);
    if (!seller) return { ok: false, message: t('Profil vendeur introuvable.', 'Seller profile not found.') };

    const categoryLabel = CATEGORY_LABELS[payload.categorySlug] ?? 'Divers';

    const product: MarketplaceProduct = {
      id: `prod-${Date.now()}`,
      slug: `${payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`,
      name: payload.name,
      description: payload.description,
      price: payload.price,
      oldPrice: null,
      stock: seller.sellerType === 'dropshipper' ? 0 : payload.stock,
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
      viewCount: 0,
      kind: payload.kind ?? 'product',
      serviceDuration: payload.serviceDuration,
      serviceAvailability: payload.serviceAvailability,
      targetCountries: payload.targetCountries?.length ? payload.targetCountries : [seller.country]
    };

    setProducts((current) => [product, ...current]);
    return { ok: true, message: t('Produit ajouté.', 'Product added.') };
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

  const categoryLabels = CATEGORY_LABELS;

  const adminAddProduct = (payload: {
    sellerId: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    categorySlug: string;
    images: string[];
    kind?: 'product' | 'service';
    serviceDuration?: string;
    serviceAvailability?: string;
    targetCountries?: string[];
  }) => {
    if (sessionUser?.role !== 'admin') return { ok: false, message: t('Action réservée admin.', 'Admin-only action.') };
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
      viewCount: 0,
      kind: payload.kind ?? 'product',
      serviceDuration: payload.serviceDuration,
      serviceAvailability: payload.serviceAvailability,
      targetCountries: payload.targetCountries?.length ? payload.targetCountries : [seller.country]
    };
    setProducts((current) => [product, ...current]);
    return { ok: true, message: t('Produit ajouté par admin.', 'Product added by admin.') };
  };

  const companySendRecruitmentOffer = (targetSellerId: string, productIds: string[], commissionRate: number) => {
    if (!sessionUser?.sellerId || sessionUser.role !== 'seller' || sessionUser.sellerType !== 'company') {
      return { ok: false, message: t('Action réservée aux entreprises.', 'Company-only action.') };
    }
    if (!targetSellerId || productIds.length === 0) {
      return { ok: false, message: t('Sélection incomplète.', 'Selection incomplete.') };
    }
    if (commissionRate <= 0 || commissionRate > 100) {
      return { ok: false, message: t('Commission invalide (1-100%).', 'Invalid commission (1-100%).') };
    }
    setRecruitmentOffers((current) => [
      {
        id: `offer-${Date.now()}`,
        companySellerId: sessionUser.sellerId!,
        targetSellerId,
        productIds,
        commissionRate,
        status: 'pending',
        createdAt: new Date().toISOString().slice(0, 10)
      },
      ...current
    ]);
    return { ok: true, message: t('Offre envoyée.', 'Offer sent.') };
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
    return { ok: true, message: decision === 'accepted' ? t('Offre acceptée.', 'Offer accepted.') : t('Offre refusée.', 'Offer rejected.') };
  };

  const adminUpdateProduct = (
    productId: string,
    payload: Partial<Pick<MarketplaceProduct, 'name' | 'description' | 'price' | 'stock' | 'images' | 'categorySlug'>>
  ) => {
    if (sessionUser?.role !== 'admin') return { ok: false, message: t('Action réservée admin.', 'Admin-only action.') };
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
    return { ok: true, message: t('Produit mis à jour.', 'Product updated.') };
  };

  const adminDeleteProduct = (productId: string) => {
    if (sessionUser?.role !== 'admin') return { ok: false, message: t('Action réservée admin.', 'Admin-only action.') };
    setProducts((current) => current.filter((product) => product.id !== productId));
    return { ok: true, message: t('Produit supprimé.', 'Product deleted.') };
  };

  const adminChangeUserRole = (userId: string, role: AccountRole) => {
    if (sessionUser?.role !== 'admin') return { ok: false, message: t('Action réservée admin.', 'Admin-only action.') };
    if (sessionUser.id === userId && role !== 'admin') return { ok: false, message: t('Tu ne peux pas retirer ton rôle admin.', 'You cannot remove your own admin role.') };
    if (role === 'admin' && userId !== PRIMARY_ADMIN_ID) {
      return { ok: false, message: t('Un seul admin est autorisé: le compte principal.', 'Only one admin is allowed: the primary account.') };
    }

    const targetUser = users.find((entry) => entry.id === userId);
    if (!targetUser) return { ok: false, message: t('Utilisateur introuvable.', 'User not found.') };

    setUsers((current) =>
      current.map((user) =>
        user.id === userId
          ? {
              ...user,
              role: user.id === PRIMARY_ADMIN_ID ? 'admin' : role,
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
          identityVerified: false,
          sellerType: 'min_shop',
          about: 'Nouveau vendeur Min-shop.'
        },
        ...current
      ]);
    }

    return { ok: true, message: t('Rôle mis à jour.', 'Role updated.') };
  };

  const adminDeleteUser = (userId: string) => {
    if (sessionUser?.role !== 'admin') return { ok: false, message: t('Action réservée admin.', 'Admin-only action.') };
    if (sessionUser.id === userId) return { ok: false, message: t('Tu ne peux pas supprimer ton propre compte.', 'You cannot delete your own account.') };

    const target = users.find((entry) => entry.id === userId);
    if (!target) return { ok: false, message: t('Utilisateur introuvable.', 'User not found.') };

    setUsers((current) => current.filter((user) => user.id !== userId));

    if (target.sellerId) {
      setSellers((current) => current.filter((seller) => seller.id !== target.sellerId));
      setProducts((current) => current.filter((product) => product.sellerId !== target.sellerId));
    }

    return { ok: true, message: t('Compte supprimé.', 'Account deleted.') };
  };

  const proposeDropshipperCatalog = (payload: {
    dropshipperId: string;
    dropshipperName: string;
    productIds: string[];
  }) => {
    if (!sessionUser) return { ok: false, message: t('Connecte-toi d abord.', 'Please login first.') };

    const canPropose =
      sessionUser.role === 'admin' ||
      (sessionUser.role === 'seller' && sessionUser.sellerType === 'dropshipper');
    if (!canPropose) {
      return {
        ok: false,
        message: t(
          'Action reservee a l admin et aux comptes dropshipper.',
          'Only admin and dropshipper accounts can do this action.'
        )
      };
    }
    if (payload.productIds.length === 0) {
      return { ok: false, message: t('Aucun produit dans ce catalogue.', 'No products found in this catalog.') };
    }

    const createdAt = new Date().toISOString().slice(0, 10);
    const proposal: DropshipperCatalogProposal = {
      id: `drop-proposal-${Date.now()}`,
      dropshipperId: payload.dropshipperId,
      dropshipperName: payload.dropshipperName,
      productIds: payload.productIds,
      proposedByUserId: sessionUser.id,
      proposedByRole: sessionUser.role === 'admin' ? 'admin' : 'dropshipper',
      target: 'all_vendors',
      createdAt
    };

    setDropshipperCatalogProposals((current) => [proposal, ...current]);
    setAdminNotifications((current) => [
      {
        id: `notif-drop-${Date.now()}`,
        message: `Catalogue dropshipper propose: ${payload.dropshipperName} (${payload.productIds.length} produit(s))`,
        createdAt
      },
      ...current
    ]);

    return {
      ok: true,
      message: t('Catalogue propose aux vendeurs avec succes.', 'Catalog successfully proposed to vendors.')
    };
  };

  const deleteCurrentAccount = () => {
    if (!sessionUser) return { ok: false, message: t('Session introuvable.', 'Session not found.') };
    if (sessionUser.role === 'admin') {
      return { ok: false, message: t('Un compte admin ne peut pas être supprimé.', 'An admin account cannot be deleted.') };
    }

    const target = users.find((entry) => entry.id === sessionUser.id);
    if (!target) return { ok: false, message: t('Compte introuvable.', 'Account not found.') };

    setUsers((current) => current.filter((user) => user.id !== sessionUser.id));

    if (target.sellerId) {
      setSellers((current) => current.filter((seller) => seller.id !== target.sellerId));
      setProducts((current) => current.filter((product) => product.sellerId !== target.sellerId));
      setReviews((current) => current.filter((review) => review.sellerId !== target.sellerId));
    }

    setSessionUser(null);
    return { ok: true, message: t('Ton compte a été supprimé.', 'Your account has been deleted.') };
  };

  const t = (fr: string, en: string) => (locale === 'fr' ? fr : en);

  useEffect(() => {
    setSellers((current) => {
      let changed = false;
      const next = current.map((seller) => {
        const trust = getSellerTrustStats(seller, products, reviews, orders, complaints);
        if (seller.verified !== trust.hasBadge) {
          changed = true;
          return { ...seller, verified: trust.hasBadge };
        }
        return seller;
      });
      return changed ? next : current;
    });
  }, [products, reviews, orders, complaints]);

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
        complaints,
        testimonials,
        recruitmentOffers,
        adminNotifications,
        dropshipperCatalogProposals,
        siteVisits,
        login,
        register,
        logout,
        updateProfile,
        addReview,
        addCompanyReviewForPartner,
        recordClientOrder,
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
        proposeDropshipperCatalog,
        deleteCurrentAccount,
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
