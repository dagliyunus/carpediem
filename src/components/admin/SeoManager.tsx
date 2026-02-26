'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import { MediaType, SeoTargetType } from '@prisma/client';
import { useEffect, useMemo, useState } from 'react';
import { AdminSingleMediaPicker } from '@/components/admin/MediaPicker';

type SeoItem = {
  id: string;
  targetType: SeoTargetType;
  targetId: string;
  title: string | null;
  description: string | null;
  keywords: string | null;
  canonicalUrl: string | null;
  robots: string | null;
  openGraphTitle: string | null;
  openGraphDescription: string | null;
  twitterCard: string | null;
  schemaType: string | null;
  ogImageId: string | null;
};

type MediaItem = {
  id: string;
  url: string;
  mediaType: MediaType;
  filename: string;
  altText?: string | null;
};

type FormState = {
  targetType: SeoTargetType;
  targetId: string;
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  robots: string;
  openGraphTitle: string;
  openGraphDescription: string;
  twitterCard: string;
  schemaType: string;
  ogImageId: string;
};

const emptyForm: FormState = {
  targetType: SeoTargetType.GLOBAL,
  targetId: 'global',
  title: '',
  description: '',
  keywords: '',
  canonicalUrl: '',
  robots: 'index,follow',
  openGraphTitle: '',
  openGraphDescription: '',
  twitterCard: 'summary_large_image',
  schemaType: 'Restaurant',
  ogImageId: '',
};

function getSeoTargetLabel(item: SeoItem) {
  if (item.targetType === SeoTargetType.GLOBAL) return 'Website gesamt';
  if (item.targetType === SeoTargetType.PAGE) return 'Seite';
  if (item.targetType === SeoTargetType.ARTICLE) return 'Magazinbeitrag';
  return item.targetType;
}

function getSeoTargetLabelByType(targetType: SeoTargetType) {
  if (targetType === SeoTargetType.GLOBAL) return 'Website gesamt';
  if (targetType === SeoTargetType.PAGE) return 'Seite';
  if (targetType === SeoTargetType.ARTICLE) return 'Magazinbeitrag';
  return targetType;
}

export function SeoManager() {
  const [items, setItems] = useState<SeoItem[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [message, setMessage] = useState<string | null>(null);

  async function loadData() {
    const [seoRes, mediaRes] = await Promise.all([
      fetch('/api/admin/seo', { cache: 'no-store' }),
      fetch('/api/admin/media?type=IMAGE', { cache: 'no-store' }),
    ]);

    const seoData = (await seoRes.json()) as { items: SeoItem[] };
    const mediaData = (await mediaRes.json()) as { items: MediaItem[] };

    setItems(seoData.items || []);
    setMedia(mediaData.items || []);
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
      targetType: selectedItem.targetType,
      targetId: selectedItem.targetId,
      title: selectedItem.title || '',
      description: selectedItem.description || '',
      keywords: selectedItem.keywords || '',
      canonicalUrl: selectedItem.canonicalUrl || '',
      robots: selectedItem.robots || '',
      openGraphTitle: selectedItem.openGraphTitle || '',
      openGraphDescription: selectedItem.openGraphDescription || '',
      twitterCard: selectedItem.twitterCard || '',
      schemaType: selectedItem.schemaType || '',
      ogImageId: selectedItem.ogImageId || '',
    });
  }, [selectedItem]);

  async function save() {
    setMessage(null);

    const response = await fetch('/api/admin/seo', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        ...form,
        ogImageId: form.ogImageId || null,
      }),
    });

    const result = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setMessage(result?.error || 'SEO konnte nicht gespeichert werden.');
      return;
    }

    setMessage('SEO gespeichert.');
    await loadData();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-white">SEO Eintraege</h3>
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
              <p className="text-sm font-semibold text-white">{getSeoTargetLabel(item)}</p>
              <p className="text-xs uppercase tracking-[0.14em] text-accent-300">
                {item.targetType === SeoTargetType.GLOBAL ? 'Standard' : item.targetId}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
        <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
          <p className="text-[11px] uppercase tracking-[0.16em] text-accent-300">SEO Ziel</p>
          <p className="mt-1 text-sm text-white/80">
            {form.targetType === SeoTargetType.GLOBAL
              ? 'Website gesamt'
              : `${getSeoTargetLabelByType(form.targetType)} (${form.targetId})`}
          </p>
        </div>

        <label className="space-y-1 block">
          <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Meta Title</span>
          <input
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
        </label>

        <label className="space-y-1 block">
          <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Meta Description</span>
          <textarea
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            className="h-24 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 block">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Keywords</span>
            <input
              value={form.keywords}
              onChange={(event) => setForm((prev) => ({ ...prev, keywords: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Canonical URL</span>
            <input
              value={form.canonicalUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, canonicalUrl: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 block">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">OG Title</span>
            <input
              value={form.openGraphTitle}
              onChange={(event) => setForm((prev) => ({ ...prev, openGraphTitle: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">OG Description</span>
            <input
              value={form.openGraphDescription}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, openGraphDescription: event.target.value }))
              }
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="space-y-1 block">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Robots</span>
            <input
              value={form.robots}
              onChange={(event) => setForm((prev) => ({ ...prev, robots: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Twitter Card</span>
            <input
              value={form.twitterCard}
              onChange={(event) => setForm((prev) => ({ ...prev, twitterCard: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Schema Type</span>
            <input
              value={form.schemaType}
              onChange={(event) => setForm((prev) => ({ ...prev, schemaType: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
        </div>

        <AdminSingleMediaPicker
          label="OG Bild"
          hint="Dieses Bild wird fuer Link-Vorschau in Social Media verwendet."
          items={media}
          selectedId={form.ogImageId}
          onSelect={(id) => setForm((prev) => ({ ...prev, ogImageId: id }))}
          emptyLabel="Kein OG-Bild"
        />

        {message ? (
          <p className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-accent-100">{message}</p>
        ) : null}

        <button
          type="button"
          onClick={() => void save()}
          className="rounded-full bg-primary-600 px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white"
        >
          SEO speichern
        </button>
      </div>
    </div>
  );
}
