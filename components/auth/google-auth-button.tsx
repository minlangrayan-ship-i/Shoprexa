'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

type GoogleAuthButtonProps = {
  label: string;
  callbackUrl?: string;
  className?: string;
};

export function GoogleAuthButton({ label, callbackUrl = '/auth/google-complete', className }: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await signIn('google', { callbackUrl });
      }}
      className={className ?? 'w-full rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700'}
    >
      {loading ? 'Connexion Google...' : label}
    </button>
  );
}

