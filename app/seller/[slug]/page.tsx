'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { ProductCard } from '@/components/product-card';
import { useSite } from '@/components/site-context';
import { getRegionalDemandAdjustedRating } from '@/lib/mock-marketplace';
import { validateSellerProfileReadiness } from '@/services/ai/seller-profile-readiness';

function SocialIcon({ label }: { label: 'LinkedIn' | 'WhatsApp' | 'Instagram' | 'Facebook' }) {
  const palette: Record<string, string> = {
    LinkedIn: 'bg-sky-100 text-sky-700',
    WhatsApp: 'bg-emerald-100 text-emerald-700',
    Instagram: 'bg-rose-100 text-rose-700',
    Facebook: 'bg-blue-100 text-blue-700'
  };

  return (
    <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${palette[label]}`}>
      {label.slice(0, 2)}
    </span>
  );
}

export default function SellerPublicStorePage() {
  const params = useParams<{ slug: string }>();
  const {
    sellers,
    products,
    users,
    country,
    city,
    locale,
    sessionUser,
    toggleSellerSubscription,
    t
  } = useSite();
  const [activeTab, setActiveTab] = useState<'products' | 'services'>('products');
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [followStatus, setFollowStatus] = useState('');

  const seller = sellers.find((entry) => entry.slug === params.slug || entry.id === params.slug);

  const sellerProducts = useMemo(
    () =>
      products
        .filter((product) => product.sellerId === seller?.id)
        .map((product) => ({
          id: product.id,
          slug: product.slug,
          name: product.name,
          description: product.description,
          price: product.price,
          oldPrice: product.oldPrice,
          stock: product.stock,
          images: product.images,
          category: { name: product.category },
          seller: {
            id: product.sellerId,
            companyName: product.companyName,
            country: product.sellerCountry,
            city: product.sellerCity
          },
          badges: product.badges,
          averageRating: getRegionalDemandAdjustedRating(product, users, country, city, 'city'),
          kind: product.kind,
          serviceDuration: product.serviceDuration,
          serviceAvailability: product.serviceAvailability
        })),
    [city, country, products, seller?.id, users]
  );

  const productOffers = sellerProducts.filter((product) => (product.kind ?? 'product') === 'product');
  const serviceOffers = sellerProducts.filter((product) => (product.kind ?? 'product') === 'service');

  useEffect(() => {
    if (!seller?.announcementImages || seller.announcementImages.length <= 1) return;
    const timer = window.setInterval(() => {
      setAnnouncementIndex((current) => (current + 1) % seller.announcementImages!.length);
    }, 3500);
    return () => window.clearInterval(timer);
  }, [seller?.announcementImages]);

  if (!seller) {
    return (
      <section className="section py-12">
        <div className="rounded-xl border bg-white p-6">{t('Boutique vendeur introuvable.', 'Seller store not found.')}</div>
      </section>
    );
  }

  const readiness = validateSellerProfileReadiness(
    seller,
    products.filter((product) => product.sellerId === seller.id),
    locale
  );

  if (!readiness.accessible) {
    return (
      <section className="section py-12">
        <div className="rounded-3xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold">{t('Profil vendeur non accessible', 'Seller profile unavailable')}</h1>
          <p className="mt-3 text-slate-600">
            {t(
              'Ce vendeur n a pas encore valide son profil.',
              'This seller has not validated their profile yet.'
            )}
          </p>
          <Link href="/sellers" className="mt-5 inline-block rounded-xl bg-dark px-4 py-2 text-sm font-semibold text-white">
            {t('Retour aux vendeurs', 'Back to sellers')}
          </Link>
        </div>
      </section>
    );
  }

  const socialEntries = [
    { key: 'linkedin', label: 'LinkedIn' as const, href: seller.socialLinks?.linkedin },
    { key: 'whatsapp', label: 'WhatsApp' as const, href: seller.socialLinks?.whatsapp },
    { key: 'instagram', label: 'Instagram' as const, href: seller.socialLinks?.instagram },
    { key: 'facebook', label: 'Facebook' as const, href: seller.socialLinks?.facebook }
  ].filter((entry) => Boolean(entry.href));

  const isFollowing = Boolean(sessionUser && seller.followerIds?.includes(sessionUser.id));

  return (
    <section className="section py-10">
      <div className="mb-6 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-8 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">{t('Boutique officielle', 'Official store')}</p>
            <h2 className="mt-2 text-3xl font-black">{seller.company}</h2>
            <p className="mt-2 text-sm text-slate-200">{seller.city}, {seller.country}</p>
          </div>
          <div className="grid min-w-[220px] grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-white/10 p-2">
              <p className="text-xs text-slate-300">{t('Produits', 'Products')}</p>
              <p className="text-lg font-bold">{productOffers.length}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-2">
              <p className="text-xs text-slate-300">{t('Services', 'Services')}</p>
              <p className="text-lg font-bold">{serviceOffers.length}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-2">
              <p className="text-xs text-slate-300">{t('Abonnes', 'Followers')}</p>
              <p className="text-lg font-bold">{seller.followerIds?.length ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl border bg-slate-50">
                <Image src={seller.logoUrl || '/favicon.ico'} alt={seller.company} fill className="object-cover" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold">{seller.company}</h1>
                  {seller.verified ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{t('Verifie Min-shop', 'Min-shop Verified')}</span> : null}
                </div>
                <p className="mt-1 text-sm text-slate-600">{seller.city}, {seller.country}</p>
                <p className="mt-1 text-sm text-slate-600">{seller.email}</p>
                <p className="mt-2 max-w-3xl text-sm text-slate-700">{seller.about}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{t('Disponibilite', 'Availability')}</p>
              <p className="mt-2 font-semibold">{seller.openingHours} - {seller.closingHours}</p>
              <p className="mt-2 text-slate-600">{(seller.followerIds?.length ?? 0)} {t('abonnes', 'followers')}</p>
              <p className="mt-1 text-slate-600">{t('Score IA profil', 'AI profile score')}: {readiness.score}/100</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {sessionUser?.role === 'client' ? (
                  <button
                    onClick={() => setFollowStatus(toggleSellerSubscription(seller.id).message)}
                    className="rounded-xl bg-dark px-4 py-2 font-semibold text-white"
                  >
                    {isFollowing ? t('Se desabonner', 'Unfollow') : t('S abonner', 'Follow')}
                  </button>
                ) : (
                  <p className="text-xs text-slate-500">
                    {t('Seuls les clients connectes peuvent s abonner.', 'Only logged-in customers can follow sellers.')}
                  </p>
                )}
              </div>
              {followStatus ? <p className="mt-2 text-xs text-slate-600">{followStatus}</p> : null}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border bg-slate-50 p-5 shadow-inner">
            <h2 className="text-lg font-semibold">{t('Activites de l entreprise', 'Company activities')}</h2>
            <p className="mt-3 leading-7 text-slate-700">{seller.activityDescription}</p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{t('Coordonnees', 'Contact details')}</p>
              <p className="mt-3 text-sm text-slate-700">{t('Localisation', 'Location')}: {seller.city}, {seller.country}</p>
              <p className="mt-1 text-sm text-slate-700">Email: {seller.email}</p>
              <p className="mt-1 text-sm text-slate-700">{t('Horaires', 'Business hours')}: {seller.openingHours} - {seller.closingHours}</p>
            </div>
            <div className="rounded-2xl border p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{t('Reseaux', 'Social links')}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {socialEntries.map((entry) => (
                  <Link key={entry.key} href={entry.href!} target="_blank" className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
                    <SocialIcon label={entry.label} />
                    <span>{entry.label}</span>
                  </Link>
                ))}
                {socialEntries.length === 0 ? <p className="text-sm text-slate-500">{t('Aucun reseau public renseigne.', 'No public social link provided yet.')}</p> : null}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
            <div className="relative h-72 w-full">
              <Image
                src={seller.announcementImages?.[announcementIndex] ?? seller.logoUrl ?? '/favicon.ico'}
                alt={t('Annonce recente', 'Recent announcement')}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{t('Annonces recentes', 'Recent announcements')}</p>
              <p className="mt-2 text-sm text-slate-600">
                {t(
                  'Visuels publicitaires du vendeur sur ses produits et services en cours. Les annonces defilent automatiquement pour donner un apercu rapide des offres mises en avant.',
                  'Seller promotional visuals for current products and services. The slides rotate automatically to give a quick view of highlighted offers.'
                )}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-5 shadow-sm">
            <div className="inline-flex rounded-xl border bg-slate-50 p-1 text-sm">
              <button onClick={() => setActiveTab('products')} className={`rounded-lg px-3 py-1.5 font-semibold ${activeTab === 'products' ? 'bg-dark text-white' : 'text-slate-700'}`}>
                {t('Produits', 'Products')} ({productOffers.length})
              </button>
              {serviceOffers.length > 0 ? (
                <button onClick={() => setActiveTab('services')} className={`rounded-lg px-3 py-1.5 font-semibold ${activeTab === 'services' ? 'bg-dark text-white' : 'text-slate-700'}`}>
                  {t('Services', 'Services')} ({serviceOffers.length})
                </button>
              ) : null}
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {(activeTab === 'services' ? serviceOffers : productOffers).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
              {(activeTab === 'services' ? serviceOffers : productOffers).length === 0 ? (
                <div className="rounded-2xl border border-dashed p-5 text-sm text-slate-500">
                  {t('Aucune offre dans cet onglet pour le moment.', 'No offer in this tab yet.')}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
