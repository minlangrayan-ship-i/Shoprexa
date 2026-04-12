import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { env } from '@/lib/env';
import { readServerSession } from '@/lib/session';

export default async function SellerLayout({ children }: { children: ReactNode }) {
  const session = await readServerSession();
  if (env.NODE_ENV === 'production' && (!session || (session.role !== 'SELLER' && session.role !== 'ADMIN'))) {
    redirect('/auth/login?next=/seller/dashboard');
  }
  return <>{children}</>;
}
