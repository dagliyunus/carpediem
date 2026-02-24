'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');

    try {
      setLoading(true);
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setError(result?.error || 'Anmeldung fehlgeschlagen.');
        return;
      }

      router.push('/admin');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="admin-email" className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-accent-300">
          E-Mail
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none ring-primary-400 transition focus:ring-2"
          placeholder="admin@pivado.de"
        />
      </div>
      <div>
        <label htmlFor="admin-password" className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-accent-300">
          Passwort
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none ring-primary-400 transition focus:ring-2"
          placeholder="••••••••"
        />
      </div>

      {error ? (
        <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-full bg-primary-600 px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-primary-700 disabled:opacity-70"
      >
        {loading ? 'Anmelden ...' : 'Anmelden'}
      </button>
    </form>
  );
}
