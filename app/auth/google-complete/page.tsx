'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function GoogleCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Finalisation de la connexion Google...');

  useEffect(() => {
    const run = async () => {
      try {
        const response = await fetch('/api/auth/google-sync', {
          method: 'POST',
          credentials: 'include'
        });

        if (!response.ok) {
          setMessage('Connexion Google echouee. Reessayez.');
          setTimeout(() => router.push('/auth/login'), 1200);
          return;
        }

        const payload = await response.json();
        const role = payload?.user?.role as 'ADMIN' | 'SELLER' | 'CUSTOMER' | undefined;
        const next = searchParams.get('next');

        if (next) {
          router.push(next);
          return;
        }

        if (role === 'ADMIN') router.push('/admin');
        else if (role === 'SELLER') router.push('/seller/dashboard');
        else router.push('/client/home');
      } catch {
        setMessage('Impossible de finaliser la connexion.');
      }
    };

    void run();
  }, [router, searchParams]);

  return (
    <section className="section py-16">
      <div className="mx-auto max-w-md rounded-2xl border bg-white p-7 text-center shadow-sm">
        <h1 className="text-2xl font-bold">Google Login</h1>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
      </div>
    </section>
  );
}

export default function GoogleCompletePage() {
  return (
    <Suspense
      fallback={
        <section className="section py-16">
          <div className="mx-auto max-w-md rounded-2xl border bg-white p-7 text-center shadow-sm text-sm text-slate-600">
            Finalisation de la connexion Google...
          </div>
        </section>
      }
    >
      <GoogleCompleteContent />
    </Suspense>
  );
}
