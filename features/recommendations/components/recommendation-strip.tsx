'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import type { RecommendationBlock } from '@/types/marketplace-ai';

type Props = {
  block: RecommendationBlock;
  country: string;
};

export function RecommendationStrip({ block, country }: Props) {
  if (block.items.length === 0) return null;

  const trackRecommendationClick = () => {
    void fetch('/api/metrics/recommendation-click', {
      method: 'POST',
      keepalive: true
    });
  };

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xl font-bold">{block.title}</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {block.items.map((item) => (
          <Link key={item.id} href={`/product/${item.slug}`} onClick={trackRecommendationClick} className="rounded-xl border bg-white p-3 shadow-sm transition hover:-translate-y-0.5">
            <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
              <Image src={item.image} alt={item.name} fill className="object-cover" sizes="(max-width:768px)100vw,25vw" />
            </div>
            <p className="text-sm font-semibold line-clamp-2">{item.name}</p>
            <p className="mt-1 text-xs text-slate-500">{item.city}, {item.country}</p>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="font-bold text-brand-700">{formatPrice(item.price, country)}</span>
              <span className="text-amber-600">{item.averageRating.toFixed(1)}/5</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
