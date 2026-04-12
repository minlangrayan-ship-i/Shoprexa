'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { ProductCard } from '@/components/product-card';
import { useSite } from '@/components/site-context';
import { getRegionalDemandAdjustedRating } from '@/lib/mock-marketplace';

export default function SellerPublicStorePage() {
  const params = useParams<{ slug: string }>();
  const { sellers, products, users, country, city, t } = useSite();

  const seller = sellers.find((entry) => entry.slug === params.slug || entry.id === params.slug);
  if (!seller) {
    return (
      <section className="section py-12">
        <div className="rounded-xl border bg-white p-6">{t('Boutique vendeur introuvable.', 'Seller store not found.')}</div>
      </section>
    );
  }

  const sellerProducts = products
    .filter((product) => product.sellerId === seller.id)
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
    }));

  return (
    <section className="section py-10">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-full border">
            <Image src={seller.logoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80&auto=format&fit=crop'} alt={seller.company} fill className="object-cover" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{seller.company}</h1>
            <p className="text-sm text-slate-600">{seller.city}, {seller.country} - {seller.verified ? t('Vendeur vérifié', 'Verified seller') : t('Nouveau vendeur', 'New seller')}</p>
            <p className="text-sm text-slate-600">{seller.about}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sellerProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
