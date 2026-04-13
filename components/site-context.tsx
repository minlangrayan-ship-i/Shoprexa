'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
import { validateUploadedImages } from '@/lib/image-quality';
import type { CartItem } from '@/lib/types';
import type { VerificationImageInput } from '@/types/marketplace-ai';

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
  activityDescription?: string;
  openingHours?: string;
  closingHours?: string;
  linkedin?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  announcementImages?: string[];
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
  isHydrated: boolean;
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
  getFollowedSellerIds: (userId?: string) => string[];
  trackProductView: (productId: string) => void;
  login: (email: string, password: string) => { ok: boolean; message: string; user?: SessionUser };
  register: (payload: RegisterPayload) => { ok: boolean; message: string; user?: SessionUser };
  logout: () => void;
  updateProfile: (payload: ProfileUpdatePayload) => { ok: boolean; message: string };
  addReview: (review: Omit<SellerReview, 'id' | 'createdAt'>) => { ok: boolean; message: string };
  addPlatformComment: (payload: { rating: number; comment: string }) => { ok: boolean; message: string };
  addCompanyReviewForPartner: (payload: { targetSellerId: string; rating: number; comment: string }) => { ok: boolean; message: string };
  recordClientOrder: (items: CartItem[]) => void;
  addSellerProduct: (payload: {
    name: string;
    description: string;
    price: number;
    oldPrice?: number | null;
    stock: number;
    categorySlug: string;
    images: string[];
    imageMeta?: VerificationImageInput[];
    kind?: 'product' | 'service';
    serviceDuration?: string;
    serviceAvailability?: string;
    targetCountries?: string[];
  }) => { ok: boolean; message: string };
  updateSellerProduct: (productId: string, payload: Partial<Pick<MarketplaceProduct, 'name' | 'description' | 'price' | 'oldPrice' | 'stock' | 'images'>>) => void;
  deleteSellerProduct: (productId: string) => void;
  updateSellerStock: (productId: string, stock: number) => void;
  adminAddProduct: (payload: {
    sellerId: string;
    name: string;
    description: string;
    price: number;
    oldPrice?: number | null;
    stock: number;
    categorySlug: string;
    images: string[];
    imageMeta?: VerificationImageInput[];
    kind?: 'product' | 'service';
    serviceDuration?: string;
    serviceAvailability?: string;
    targetCountries?: string[];
  }) => { ok: boolean; message: string };
  adminUpdateProduct: (
    productId: string,
    payload: Partial<Pick<MarketplaceProduct, 'name' | 'description' | 'price' | 'oldPrice' | 'stock' | 'images' | 'categorySlug'>>
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
  toggleSellerSubscription: (sellerId: string) => { ok: boolean; message: string; isFollowing?: boolean };
  deleteCurrentAccount: () => { ok: boolean; message: string };
  t: (fr: string, en: string) => string;
};

const STORAGE_KEY = 'min-shop-site-context-v5';
const PRIMARY_ADMIN_ID = 'admin-1';
const SITE_VISITS_KEY = 'min-shop-site-visits-total';
const SITE_VISIT_SESSION_KEY = 'min-shop-site-visit-recorded';
const PRODUCT_VIEWS_KEY = 'min-shop-product-views';
const PRODUCT_VIEWED_SESSION_KEY = 'min-shop-product-viewed';
const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  marketplaceCategories.map((category) => [category.slug, category.label])
);

function applyPersistedProductViews(items: MarketplaceProduct[]) {
  if (typeof window === 'undefined') return items;

  const raw = localStorage.getItem(PRODUCT_VIEWS_KEY);
  if (!raw) return items;

  try {
    const persisted = JSON.parse(raw) as Record<string, number>;
    return items.map((product) => ({
      ...product,
      viewCount: Math.max(product.viewCount, persisted[product.id] ?? product.viewCount)
    }));
  } catch {
    return items;
  }
}

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
  const [isHydrated, setIsHydrated] = useState(false);
  const [country, setCountryState] = useState<string>(africaCountries[0].country);
  const [city, setCityState] = useState<string>(africaCountries[0].cities[0]);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [users, setUsers] = useState<DemoUser[]>(normalizeSingleAdmin(demoUsers));
  const [sellers, setSellers] = useState<MarketplaceSeller[]>(normalizeSellersSnapshot(sellerProfiles));
  const [products, setProducts] = useState<MarketplaceProduct[]>(marketplaceProducts);
  const [orders, setOrders] = useState<SellerOrder[]>(seededSellerOrders);
  const [reviews, setReviews] = useState<SellerReview[]>(seededReviews);
  const [complaints] = useState<SellerComplaint[]>(seededSellerComplaints);
  const [testimonials, setTestimonials] = useState<ClientTestimonial[]>(seededTestimonials);
  const [recruitmentOffers, setRecruitmentOffers] = useState<RecruitmentOffer[]>(seededRecruitmentOffers);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);
  const [dropshipperCatalogProposals, setDropshipperCatalogProposals] = useState<DropshipperCatalogProposal[]>([]);
  const [siteVisits, setSiteVisits] = useState(0);

  useEffect(() => {
    const currentTotal = Number(localStorage.getItem(SITE_VISITS_KEY) ?? '0');
    if (sessionStorage.getItem(SITE_VISIT_SESSION_KEY) === '1') {
      setSiteVisits(currentTotal);
      return;
    }

    const next = currentTotal + 1;
    localStorage.setItem(SITE_VISITS_KEY, String(next));
    sessionStorage.setItem(SITE_VISIT_SESSION_KEY, '1');
    setSiteVisits(next);
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setProducts((current) => applyPersistedProductViews(current));
      setIsHydrated(true);
      return;
    }

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
        testimonials?: ClientTestimonial[];
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
      if (parsed.products?.length) setProducts(applyPersistedProductViews(parsed.products));
      if (parsed.orders?.length) setOrders(parsed.orders);
      if (parsed.reviews?.length) setReviews(parsed.reviews);
      if (parsed.testimonials?.length) setTestimonials(parsed.testimonials);
      if (parsed.recruitmentOffers?.length) {
        setRecruitmentOffers(
          parsed.recruitmentOffers.map((offer) => ({ ...offer, commissionRate: offer.commissionRate ?? 10 }))
        );
      }
      if (parsed.adminNotifications?.length) setAdminNotifications(parsed.adminNotifications);
      if (parsed.dropshipperCatalogProposals?.length) setDropshipperCatalogProposals(parsed.dropshipperCatalogProposals);
    } catch {
      // Ignore localStorage parsing errors.
    } finally {
      // Mark the client store as ready so pages can avoid rendering unstable first-pass content.
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    setProducts((current) => applyPersistedProductViews(current));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function syncServerSession() {
      try {
        // Reconcile the UI session with the signed cookie so protected pages survive reloads.
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        if (!response.ok) return;

        const payload = (await response.json()) as {
          user: {
            id: string;
            name: string;
            email: string;
            role: 'ADMIN' | 'CUSTOMER' | 'SELLER';
            sellerId?: string | null;
          } | null;
        };

        if (cancelled) return;

        if (!payload.user && sessionUser) {
          await fetch('/api/auth/dev-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              userId: sessionUser.id,
              name: sessionUser.name,
              email: sessionUser.email,
              role:
                sessionUser.role === 'admin'
                  ? 'ADMIN'
                  : sessionUser.role === 'seller'
                    ? 'SELLER'
                    : 'CUSTOMER',
              sellerId: sessionUser.sellerId ?? null
            })
          });
          return;
        }

        if (!payload.user) return;
        const serverUser = payload.user;

        const matchingUser =
          users.find((entry) => entry.id === serverUser.id) ??
          users.find((entry) => entry.email.toLowerCase() === serverUser.email.toLowerCase());

        if (matchingUser) {
          const nextSession = mapSession(matchingUser);
          setSessionUser((current) => (current?.id === nextSession.id ? current : nextSession));
          setCountryState(matchingUser.country);
          setCityState(matchingUser.city);
          return;
        }

        setSessionUser((current) =>
          current ??
          ({
            id: serverUser.id,
            name: serverUser.name,
            email: serverUser.email,
            role:
              serverUser.role === 'ADMIN'
                ? 'admin'
                : serverUser.role === 'SELLER'
                  ? 'seller'
                  : 'client',
            country,
            city,
            phone: '',
            avatar: defaultAvatar,
            sellerId: serverUser.sellerId ?? undefined,
            sellerType: undefined,
            createdAt: new Date().toISOString().slice(0, 10),
            preferences: []
          }) satisfies SessionUser
        );
      } catch {
        // Ignore session sync failures and keep the local app usable.
      }
    }

    void syncServerSession();

    return () => {
      cancelled = true;
    };
  }, [city, country, sessionUser, users]);

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
        testimonials,
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
    testimonials,
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

  const trackProductView = (productId: string) => {
    const sessionRaw = sessionStorage.getItem(PRODUCT_VIEWED_SESSION_KEY);
    const viewedIds = sessionRaw ? new Set<string>(JSON.parse(sessionRaw) as string[]) : new Set<string>();
    if (viewedIds.has(productId)) return;

    viewedIds.add(productId);
    sessionStorage.setItem(PRODUCT_VIEWED_SESSION_KEY, JSON.stringify(Array.from(viewedIds)));

    setProducts((current) => {
      const nextProducts = current.map((product) =>
        product.id === productId ? { ...product, viewCount: product.viewCount + 1 } : product
      );

      const persisted = Object.fromEntries(nextProducts.map((product) => [product.id, product.viewCount]));
      localStorage.setItem(PRODUCT_VIEWS_KEY, JSON.stringify(persisted));
      return nextProducts;
    });
  };

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
        message: t(`Le numéro doit commencer par ${expectedPrefix}.`, `Phone number must start with ${expectedPrefix}.`)
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
          about: 'Nouveau vendeur Min-shop.',
          activityDescription: '',
          openingHours: '08:30',
          closingHours: '18:00',
          socialLinks: {},
          announcementImages: [],
          followerIds: []
        },
        ...current
      ]);
    }

    const session = mapSession(nextUser);
    setSessionUser(session);

    return { ok: true, message: t('Compte créé avec succès.', 'Account created successfully.'), user: session };
  };

  const logout = () => {
    setSessionUser(null);
    void fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  };

  const getFollowedSellerIds = useCallback((userId?: string) => {
    const activeUserId = userId ?? sessionUser?.id;
    if (!activeUserId) return [];
    return sellers.filter((seller) => seller.followerIds?.includes(activeUserId)).map((seller) => seller.id);
  }, [sellers, sessionUser?.id]);

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
                activityDescription: payload.activityDescription ?? seller.activityDescription,
                openingHours: payload.openingHours ?? seller.openingHours,
                closingHours: payload.closingHours ?? seller.closingHours,
                socialLinks: {
                  linkedin: payload.linkedin ?? seller.socialLinks?.linkedin,
                  whatsapp: payload.whatsapp ?? seller.socialLinks?.whatsapp,
                  instagram: payload.instagram ?? seller.socialLinks?.instagram,
                  facebook: payload.facebook ?? seller.socialLinks?.facebook
                },
                announcementImages:
                  payload.announcementImages && payload.announcementImages.length > 0
                    ? payload.announcementImages
                    : seller.announcementImages,
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

  const toggleSellerSubscription = (sellerId: string) => {
    if (!sessionUser) {
      return { ok: false, message: t('Connecte-toi avec un compte client pour t abonner.', 'Please sign in with a customer account to follow a seller.') };
    }
    if (sessionUser.role !== 'client') {
      return { ok: false, message: t('Seuls les clients peuvent s abonner a un vendeur.', 'Only customer accounts can follow a seller.') };
    }

    const targetSeller = sellers.find((seller) => seller.id === sellerId);
    if (!targetSeller) {
      return { ok: false, message: t('Vendeur introuvable.', 'Seller not found.') };
    }

    if (sessionUser.sellerId && sessionUser.sellerId === sellerId) {
      return { ok: false, message: t('Vous ne pouvez pas vous abonner a votre propre boutique.', 'You cannot follow your own store.') };
    }

    let isFollowing = false;
    setSellers((current) =>
      current.map((seller) => {
        if (seller.id !== sellerId) return seller;
        const followerIds = new Set(seller.followerIds ?? []);
        if (followerIds.has(sessionUser.id)) {
          followerIds.delete(sessionUser.id);
          isFollowing = false;
        } else {
          followerIds.add(sessionUser.id);
          isFollowing = true;
        }
        return { ...seller, followerIds: Array.from(followerIds) };
      })
    );

    return {
      ok: true,
      message: isFollowing ? t('Abonnement enregistre.', 'Follow saved.') : t('Abonnement retire.', 'Follow removed.'),
      isFollowing
    };
  };

  const addReview = (review: Omit<SellerReview, 'id' | 'createdAt'>) => {
    if (!sessionUser || sessionUser.role !== 'client') {
      return { ok: false, message: t('Seuls les clients inscrits et connectés peuvent noter un vendeur.', 'Only registered, logged-in clients can rate a seller.') };
    }
    const hasPurchasedFromSeller = orders.some(
      (order) =>
        order.customerName === sessionUser.name &&
        order.sellerId === review.sellerId &&
        order.status === 'delivered'
    );
    if (!hasPurchasedFromSeller) {
      return {
        ok: false,
        message: t(
          'Tu peux noter un produit ou un service seulement après un achat finalisé.',
          'You can rate a product or service only after a completed purchase.'
        )
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

  const addPlatformComment = (payload: { rating: number; comment: string }) => {
    if (!sessionUser || sessionUser.role !== 'client') {
      return {
        ok: false,
        message: t(
          'Seuls les clients inscrits et connectés peuvent commenter la plateforme.',
          'Only registered, logged-in clients can comment on the platform.'
        )
      };
    }

    const createdAt = new Date().toISOString().slice(0, 10);
    const nextComment: ClientTestimonial = {
      id: `tes-${Date.now()}`,
      country: sessionUser.country,
      city: sessionUser.city,
      name: sessionUser.name,
      rating: payload.rating,
      comment: payload.comment
    };

    setTestimonials((current) => [nextComment, ...current]);
    setAdminNotifications((current) => [
      {
        id: `notif-comment-${Date.now()}`,
        message: `Nouveau commentaire plateforme de ${sessionUser.name}: ${payload.comment}`,
        createdAt
      },
      ...current
    ]);

    return {
      ok: true,
      message: t('Votre commentaire sur Min-shop a été enregistré.', 'Your Min-shop platform comment has been recorded.')
    };
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
      const acceptedOffer = recruitmentOffers.find(
        (offer) =>
          offer.companySellerId === product.sellerId &&
          offer.status === 'accepted' &&
          offer.productIds.includes(product.id)
      );
      const dropshipper = acceptedOffer ? sellers.find((seller) => seller.id === acceptedOffer.targetSellerId) : null;
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
          message: acceptedOffer && dropshipper
            ? `Transaction validee: ${sessionUser.name} -> ${product.companyName} (${item.quantity} x ${product.name}). Commande transmise a l entreprise et au dropshipper ${dropshipper.company}. Commission prevue: ${acceptedOffer.commissionRate}%.`
            : `Transaction validee: ${sessionUser.name} -> ${product.companyName} (${item.quantity} x ${product.name})`,
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
    oldPrice?: number | null;
    stock: number;
    categorySlug: string;
    images: string[];
    imageMeta?: VerificationImageInput[];
    kind?: 'product' | 'service';
    serviceDuration?: string;
    serviceAvailability?: string;
    targetCountries?: string[];
  }) => {
    if (!sessionUser?.sellerId) return { ok: false, message: t('Accès vendeur requis.', 'Seller access required.') };

    const seller = sellers.find((entry) => entry.id === sessionUser.sellerId);
    if (!seller) return { ok: false, message: t('Profil vendeur introuvable.', 'Seller profile not found.') };

    const imageValidation = validateUploadedImages(payload.imageMeta ?? [], locale);
    if (!imageValidation.ok) {
      return { ok: false, message: imageValidation.message };
    }

    const categoryLabel = CATEGORY_LABELS[payload.categorySlug] ?? 'Divers';

    const product: MarketplaceProduct = {
      id: `prod-${Date.now()}`,
      slug: `${payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`,
      name: payload.name,
      description: payload.description,
      price: payload.price,
      oldPrice: payload.oldPrice && payload.oldPrice > payload.price ? payload.oldPrice : null,
      stock: seller.sellerType === 'dropshipper' ? 0 : payload.stock,
      images: payload.images.length ? payload.images : [
        'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1400&q=85&auto=format&fit=crop'
      ],
      imageMeta: payload.imageMeta,
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
    payload: Partial<Pick<MarketplaceProduct, 'name' | 'description' | 'price' | 'oldPrice' | 'stock' | 'images'>>
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

  const adminAddProduct = (_payload: {
    sellerId: string;
    name: string;
    description: string;
    price: number;
    oldPrice?: number | null;
    stock: number;
    categorySlug: string;
    images: string[];
    imageMeta?: VerificationImageInput[];
    kind?: 'product' | 'service';
    serviceDuration?: string;
    serviceAvailability?: string;
    targetCountries?: string[];
  }) => {
    void _payload;
    if (sessionUser?.role !== 'admin') return { ok: false, message: t('Action réservée admin.', 'Admin-only action.') };
    return {
      ok: false,
      message: t(
        'L admin peut moderer, mettre a jour ou supprimer une offre, mais ne peut pas ajouter une offre dans le catalogue d un vendeur.',
        'Admin can moderate, update, or delete an offer, but cannot add a new offer to a seller catalog.'
      )
    };
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
    payload: Partial<Pick<MarketplaceProduct, 'name' | 'description' | 'price' | 'oldPrice' | 'stock' | 'images' | 'categorySlug'>>
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
          about: 'Nouveau vendeur Min-shop.',
          activityDescription: '',
          openingHours: '08:30',
          closingHours: '18:00',
          socialLinks: {},
          announcementImages: [],
          followerIds: []
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
          'Action réservée à l admin et aux comptes dropshipper.',
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
        message: `Catalogue dropshipper proposé: ${payload.dropshipperName} (${payload.productIds.length} produit(s))`,
        createdAt
      },
      ...current
    ]);

    return {
      ok: true,
      message: t('Catalogue proposé aux vendeurs avec succès.', 'Catalog successfully proposed to vendors.')
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
        isHydrated,
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
        getFollowedSellerIds,
        trackProductView,
        login,
        register,
        logout,
        updateProfile,
        addReview,
        addPlatformComment,
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
        toggleSellerSubscription,
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


