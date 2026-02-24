'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import { SocialPlatform } from '@prisma/client';
import { useEffect, useMemo, useState } from 'react';

type SocialItem = {
  id: string;
  platform: SocialPlatform;
  displayName: string | null;
  handle: string | null;
  url: string;
  isActive: boolean;
  sortOrder: number;
};

type FormState = {
  platform: SocialPlatform;
  displayName: string;
  handle: string;
  url: string;
  isActive: boolean;
  sortOrder: number;
};

const emptyForm: FormState = {
  platform: SocialPlatform.INSTAGRAM,
  displayName: '',
  handle: '',
  url: '',
  isActive: true,
  sortOrder: 0,
};

export function SocialManager() {
  const [items, setItems] = useState<SocialItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [message, setMessage] = useState<string | null>(null);

  async function loadData() {
    const response = await fetch('/api/admin/social', { cache: 'no-store' });
    const data = (await response.json()) as { items: SocialItem[] };
    setItems(data.items || []);
  }

  useEffect(() => {
    void loadData();
  }, []);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) || null,
    [items, selectedId]
  );

  useEffect(() => {
    if (!selectedItem) {
      setForm(emptyForm);
      return;
    }

    setForm({
      platform: selectedItem.platform,
      displayName: selectedItem.displayName || '',
      handle: selectedItem.handle || '',
      url: selectedItem.url,
      isActive: selectedItem.isActive,
      sortOrder: selectedItem.sortOrder,
    });
  }, [selectedItem]);

  async function save() {
    setMessage(null);

    const response = await fetch(selectedId ? `/api/admin/social/${selectedId}` : '/api/admin/social', {
      method: selectedId ? 'PATCH' : 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    const result = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setMessage(result?.error || 'Speichern fehlgeschlagen.');
      return;
    }

    setMessage('Social Account gespeichert.');
    await loadData();
  }

  async function remove() {
    if (!selectedId) return;
    if (!window.confirm('Social Account loeschen?')) return;

    const response = await fetch(`/api/admin/social/${selectedId}`, { method: 'DELETE' });
    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(result?.error || 'Loeschen fehlgeschlagen.');
      return;
    }

    setSelectedId(null);
    setForm(emptyForm);
    await loadData();
    setMessage('Social Account geloescht.');
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-white">Social Accounts</h3>
          <button
            type="button"
            onClick={() => {
              setSelectedId(null);
              setForm(emptyForm);
            }}
            className="rounded-full border border-primary-500/40 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary-300"
          >
            Neu
          </button>
        </div>
        <div className="space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={`w-full rounded-2xl border px-3 py-2 text-left ${
                selectedId === item.id
                  ? 'border-primary-400/50 bg-primary-500/15'
                  : 'border-white/10 bg-black/20 hover:border-white/20'
              }`}
            >
              <p className="text-sm font-semibold text-white">{item.displayName || item.platform}</p>
              <p className="text-xs uppercase tracking-[0.14em] text-accent-300">
                {item.platform} · {item.isActive ? 'aktiv' : 'inaktiv'}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 block">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Plattform</span>
            <select
              value={form.platform}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, platform: event.target.value as SocialPlatform }))
              }
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            >
              {Object.values(SocialPlatform).map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 block">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Sortierung</span>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(event) => setForm((prev) => ({ ...prev, sortOrder: Number(event.target.value) || 0 }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 block">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Anzeigename</span>
            <input
              value={form.displayName}
              onChange={(event) => setForm((prev) => ({ ...prev, displayName: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Handle</span>
            <input
              value={form.handle}
              onChange={(event) => setForm((prev) => ({ ...prev, handle: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
        </div>

        <label className="space-y-1 block">
          <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Profil-URL</span>
          <input
            value={form.url}
            onChange={(event) => setForm((prev) => ({ ...prev, url: event.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
          />
          Aktiv anzeigen
        </label>

        {message ? (
          <p className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-accent-100">{message}</p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void save()}
            className="rounded-full bg-primary-600 px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white"
          >
            Speichern
          </button>
          {selectedId ? (
            <button
              type="button"
              onClick={() => void remove()}
              className="rounded-full border border-red-500/40 px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-red-200"
            >
              Loeschen
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
