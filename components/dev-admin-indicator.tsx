'use client';

import { useSite } from '@/components/site-context';

export function DevAdminIndicator() {
  const { sessionUser } = useSite();

  if (process.env.NODE_ENV !== 'development') return null;
  if (sessionUser?.role !== 'admin') return null;

  return (
    <div className="fixed bottom-3 left-3 z-[100] rounded-full bg-dark px-2.5 py-1 text-xs font-bold text-white shadow-lg">
      N
    </div>
  );
}
