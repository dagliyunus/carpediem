'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          setIsLoading(true);
          await fetch('/api/admin/auth/logout', {
            method: 'POST',
          });
          router.push('/admin/login');
          router.refresh();
        } finally {
          setIsLoading(false);
        }
      }}
      className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/80 transition hover:border-primary-400 hover:text-primary-300"
      disabled={isLoading}
    >
      {isLoading ? 'Abmelden ...' : 'Abmelden'}
    </button>
  );
}
