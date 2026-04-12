'use client';

import { useEffect, useState } from 'react';
import type { DeliveryEstimateResponse } from '@/types/marketplace-ai';

type Props = {
  locale: 'fr' | 'en';
  sellerCountry: string;
  sellerCity: string;
  clientCountry: string;
  clientCity: string;
  stock: number;
  kind: 'product' | 'service';
};

export function DeliveryEstimateCard(props: Props) {
  const [data, setData] = useState<DeliveryEstimateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/delivery-estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...props, priority: 'standard' })
        });
        if (!res.ok) throw new Error('delivery_error');
        const payload = (await res.json()) as DeliveryEstimateResponse;
        if (active) setData(payload);
      } catch {
        if (active) setError(props.locale === 'fr' ? 'Estimation indisponible.' : 'Estimate unavailable.');
      } finally {
        if (active) setLoading(false);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [props]);

  return (
    <div className="rounded-xl border bg-slate-50 p-4 text-sm">
      <p className="font-semibold">{props.locale === 'fr' ? 'Estimation intelligente de livraison' : 'Smart delivery estimate'}</p>
      {loading ? <p className="mt-2 text-slate-500">{props.locale === 'fr' ? 'Calcul en cours...' : 'Calculating...'}</p> : null}
      {error ? <p className="mt-2 text-red-600">{error}</p> : null}
      {!loading && !error && data ? (
        <div className="mt-2 space-y-1 text-slate-700">
          <p><span className="font-semibold">{props.locale === 'fr' ? 'Transport' : 'Transport'}:</span> {data.transport}</p>
          <p><span className="font-semibold">{props.locale === 'fr' ? 'Delai' : 'Delay'}:</span> {data.delayLabel}</p>
          <p><span className="font-semibold">{props.locale === 'fr' ? 'Fiabilite' : 'Reliability'}:</span> {data.reliability}</p>
          <p className="text-xs text-slate-500">{data.explanation}</p>
        </div>
      ) : null}
    </div>
  );
}
