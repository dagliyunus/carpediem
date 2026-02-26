'use client';

import { ContentStatus, MediaType } from '@prisma/client';
import { useEffect, useMemo, useState } from 'react';
import { AdminMultiMediaPicker, AdminSingleMediaPicker } from '@/components/admin/MediaPicker';

type PageItem = {
  id: string;
  slug: string;
  title: string;
  headline: string | null;
  subheadline: string | null;
  body: string | null;
  template: string;
  status: ContentStatus;
  publishedAt: string | null;
  heroImageId: string | null;
  sections: unknown;
  mediaLinks: Array<{
    mediaId: string;
  }>;
};

type MediaItem = {
  id: string;
  url: string;
  filename: string;
  key?: string | null;
  mediaType: MediaType;
  altText?: string | null;
};

type FormState = {
  title: string;
  headline: string;
  subheadline: string;
  body: string;
  status: ContentStatus;
  publishedAt: string;
  heroImageId: string;
  mediaIds: string[];
};

const emptyForm: FormState = {
  title: '',
  headline: '',
  subheadline: '',
  body: '',
  status: ContentStatus.DRAFT,
  publishedAt: '',
  heroImageId: '',
  mediaIds: [],
};

function toDatetimeLocal(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

function fromDatetimeLocal(value: string) {
  if (!value) return null;
  return new Date(value).toISOString();
}

function isSystemMediaAsset(item: MediaItem) {
  const filename = item.filename.toLowerCase();
  const key = (item.key || '').toLowerCase();
  const url = item.url.toLowerCase();

  if (
    filename.includes('favicon') ||
    filename.includes('logo') ||
    filename.includes('apple-touch-icon') ||
    filename.includes('android-chrome') ||
    filename.includes('site.webmanifest') ||
    filename.includes('manifest') ||
    filename.includes('mstile') ||
    filename.includes('hero-bg') ||
    filename === 'smoke.png'
  ) {
    return true;
  }

  if (url.includes('/icons/') || key.includes('/images/icons/')) {
    return true;
  }

  return false;
}

function getPageMediaKeywords(slug: string) {
  switch (slug) {
    case 'galerie':
      return ['galerie_page', 'videos'];
    case 'menu':
      return ['fish'];
    case 'home':
      return ['outside_night'];
    default:
      return [slug];
  }
}

function isLikelyMediaForPage(item: MediaItem, slug: string) {
  const value = `${item.key || ''} ${item.filename} ${item.url}`.toLowerCase();
  const keywords = getPageMediaKeywords(slug.toLowerCase());

  return keywords.some((keyword) => value.includes(keyword));
}

export function ContentManager() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const [pageRes, mediaRes] = await Promise.all([
        fetch('/api/admin/pages', { cache: 'no-store' }),
        fetch('/api/admin/media', { cache: 'no-store' }),
      ]);
      const pageData = (await pageRes.json()) as { items: PageItem[] };
      const mediaData = (await mediaRes.json()) as { items: MediaItem[] };
      setPages(pageData.items || []);
      setMedia(mediaData.items || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const selectedPage = useMemo(
    () => pages.find((page) => page.id === selectedId) || null,
    [pages, selectedId]
  );
  const nonSystemMedia = useMemo(
    () => media.filter((item) => !isSystemMediaAsset(item)),
    [media]
  );

  const scopedMedia = useMemo(() => {
    if (!selectedPage) return nonSystemMedia;

    const scopedIds = new Set<string>();
    if (selectedPage.heroImageId) scopedIds.add(selectedPage.heroImageId);
    selectedPage.mediaLinks.forEach((link) => scopedIds.add(link.mediaId));
    const linked = nonSystemMedia.filter((item) => scopedIds.has(item.id));
    const inferred = nonSystemMedia.filter((item) => isLikelyMediaForPage(item, selectedPage.slug));

    const merged = new Map<string, MediaItem>();
    linked.forEach((item) => merged.set(item.id, item));
    inferred.forEach((item) => merged.set(item.id, item));

    return Array.from(merged.values());
  }, [nonSystemMedia, selectedPage]);

  const scopedImages = useMemo(
    () => scopedMedia.filter((item) => item.mediaType === MediaType.IMAGE),
    [scopedMedia]
  );

  useEffect(() => {
    if (!selectedPage) {
      setForm(emptyForm);
      return;
    }

    setForm({
      title: selectedPage.title,
      headline: selectedPage.headline || '',
      subheadline: selectedPage.subheadline || '',
      body: selectedPage.body || '',
      status: selectedPage.status,
      publishedAt: toDatetimeLocal(selectedPage.publishedAt),
      heroImageId: selectedPage.heroImageId || '',
      mediaIds: selectedPage.mediaLinks.map((link) => link.mediaId),
    });
  }, [selectedPage]);

  function toggleMedia(mediaId: string) {
    setForm((prev) => ({
      ...prev,
      mediaIds: prev.mediaIds.includes(mediaId)
        ? prev.mediaIds.filter((id) => id !== mediaId)
        : [...prev.mediaIds, mediaId],
    }));
  }

  async function savePage() {
    setMessage(null);
    setSaving(true);

    const body = {
      title: form.title,
      headline: form.headline,
      subheadline: form.subheadline,
      body: form.body,
      status: form.status,
      publishedAt: fromDatetimeLocal(form.publishedAt),
      heroImageId:
        form.heroImageId && nonSystemMedia.some((item) => item.id === form.heroImageId)
          ? form.heroImageId
          : null,
      mediaIds: form.mediaIds.filter((id) => nonSystemMedia.some((item) => item.id === id)),
    };

    try {
      const isUpdate = Boolean(selectedId);
      const response = await fetch(isUpdate ? `/api/admin/pages/${selectedId}` : '/api/admin/pages', {
        method: isUpdate ? 'PATCH' : 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = (await response.json().catch(() => null)) as { item?: PageItem; error?: string } | null;

      if (!response.ok) {
        setMessage(result?.error || 'Speichern fehlgeschlagen.');
        return;
      }

      await loadData();

      if (!selectedId && result?.item?.id) {
        setSelectedId(result.item.id);
      }

      setMessage('Seite erfolgreich gespeichert.');
    } finally {
      setSaving(false);
    }
  }

  async function deletePage() {
    if (!selectedId) return;
    if (!window.confirm('Seite wirklich loeschen?')) return;

    const response = await fetch(`/api/admin/pages/${selectedId}`, { method: 'DELETE' });
    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(result?.error || 'Loeschen fehlgeschlagen.');
      return;
    }

    setSelectedId(null);
    setForm(emptyForm);
    await loadData();
    setMessage('Seite geloescht.');
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-white">Seiten</h3>
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
          {loading ? (
            <p className="text-sm text-accent-300">Lade Seiten ...</p>
          ) : (
            pages.map((page) => (
              <button
                key={page.id}
                type="button"
                onClick={() => setSelectedId(page.id)}
                className={`w-full rounded-2xl border px-3 py-2 text-left transition ${
                  selectedId === page.id
                    ? 'border-primary-400/50 bg-primary-500/15 text-primary-100'
                    : 'border-white/10 bg-black/20 text-white/80 hover:border-white/20'
                }`}
              >
                <p className="text-sm font-semibold">{page.title}</p>
                <p className="text-xs uppercase tracking-[0.14em] text-accent-300">{page.status}</p>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Status</span>
            <select
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, status: event.target.value as ContentStatus }))
              }
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            >
              {Object.values(ContentStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="space-y-1 block">
          <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Titel</span>
          <input
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            placeholder="Kontakt"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 block">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Headline</span>
            <input
              value={form.headline}
              onChange={(event) => setForm((prev) => ({ ...prev, headline: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Subheadline</span>
            <input
              value={form.subheadline}
              onChange={(event) => setForm((prev) => ({ ...prev, subheadline: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
        </div>

        <label className="space-y-1 block">
          <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Textinhalt</span>
          <textarea
            value={form.body}
            onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
            className="h-40 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 block">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Publizieren am</span>
            <input
              type="datetime-local"
              value={form.publishedAt}
              onChange={(event) => setForm((prev) => ({ ...prev, publishedAt: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
        </div>

        <AdminSingleMediaPicker
          label="Hero-Bild"
          hint={
            selectedPage
              ? 'Es werden nur Medien gezeigt, die bereits mit dieser Seite verknuepft sind.'
              : 'Beim Erstellen einer neuen Seite koennen Sie passende Bilder auswaehlen.'
          }
          items={scopedImages}
          selectedId={form.heroImageId}
          onSelect={(id) => setForm((prev) => ({ ...prev, heroImageId: id }))}
          emptyLabel="Kein Hero-Bild"
          acceptedTypes={[MediaType.IMAGE]}
        />

        <AdminMultiMediaPicker
          label="Verknuepfte Medien"
          hint={
            selectedPage
              ? 'Sie sehen nur Medien dieser Seite. Systemdateien wie Logo/Favicon werden ausgeblendet.'
              : 'Waehlen Sie Medien fuer die neue Seite aus.'
          }
          items={scopedMedia}
          selectedIds={form.mediaIds}
          onToggle={toggleMedia}
        />

        {message ? (
          <p className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-accent-100">{message}</p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void savePage()}
            disabled={saving}
            className="rounded-full bg-primary-600 px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white"
          >
            {saving ? 'Speichere ...' : 'Speichern'}
          </button>
          {selectedId ? (
            <button
              type="button"
              onClick={() => void deletePage()}
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
