'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type TrackingPayload = {
  orderId: string;
  reference: string;
  shipment: {
    status: string;
    transportMode: string;
    estimatedMinHours: number;
    estimatedMaxHours: number;
    reliability: number;
    timeline: Array<{
      status: string;
      labelFr: string;
      labelEn: string;
      reached: boolean;
      timestamp: string | null;
      note: string | null;
      location: string | null;
    }>;
  } | null;
};

export default function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [data, setData] = useState<TrackingPayload | null>(null);
  const [status, setStatus] = useState('Chargement...');

  useEffect(() => {
    const run = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}/tracking`, { credentials: 'include' });
        if (!response.ok) {
          setStatus('Impossible de récupérer le suivi de commande.');
          return;
        }

        const payload = await response.json() as TrackingPayload;
        setData(payload);
        setStatus('');
      } catch {
        setStatus('Erreur réseau lors du chargement du suivi.');
      }
    };

    if (orderId) void run();
  }, [orderId]);

  return (
    <section className="section py-10">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Suivi de commande</h1>
        {status ? <p className="mt-2 text-sm text-slate-600">{status}</p> : null}

        {data?.shipment ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl bg-slate-50 p-4 text-sm">
              <p><span className="font-semibold">Référence:</span> {data.reference}</p>
              <p><span className="font-semibold">Transport:</span> {data.shipment.transportMode}</p>
              <p><span className="font-semibold">Délai estimé:</span> {data.shipment.estimatedMinHours}h - {data.shipment.estimatedMaxHours}h</p>
              <p><span className="font-semibold">Fiabilité:</span> {data.shipment.reliability}%</p>
            </div>

            <div className="space-y-2">
              {data.shipment.timeline.map((step) => (
                <div key={step.status} className={`rounded-xl border p-3 text-sm ${step.reached ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                  <p className="font-semibold">{step.labelFr}</p>
                  {step.timestamp ? <p>{new Date(step.timestamp).toLocaleString()}</p> : null}
                  {step.note ? <p className="text-slate-600">{step.note}</p> : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

