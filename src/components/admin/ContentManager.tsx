'use client';

import { ContentStatus, MediaType } from '@prisma/client';
import { FormEvent, useEffect, useMemo, useState } from 'react';
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

const MANAGED_PAGE_SLUGS = ['home', 'galerie', 'magazin'] as const;

const MANAGED_PAGE_ORDER: Record<(typeof MANAGED_PAGE_SLUGS)[number], number> = {
  home: 0,
  galerie: 1,
  magazin: 2,
};

const MANAGED_PAGE_LABELS: Record<(typeof MANAGED_PAGE_SLUGS)[number], string> = {
  home: 'Startseite',
  galerie: 'Galerie',
  magazin: 'Magazin',
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

export function ContentManager() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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
      const managedPages = (pageData.items || [])
        .filter((page) => MANAGED_PAGE_SLUGS.includes(page.slug as (typeof MANAGED_PAGE_SLUGS)[number]))
        .sort(
          (a, b) =>
            MANAGED_PAGE_ORDER[a.slug as (typeof MANAGED_PAGE_SLUGS)[number]] -
            MANAGED_PAGE_ORDER[b.slug as (typeof MANAGED_PAGE_SLUGS)[number]]
        );
      setPages(managedPages);
      setSelectedId((prev) => {
        if (prev && managedPages.some((page) => page.id === prev)) return prev;
        return managedPages[0]?.id || null;
      });
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

  const linkedMediaIds = useMemo(() => {
    const ids = new Set<string>(form.mediaIds);
    if (form.heroImageId) ids.add(form.heroImageId);
    return ids;
  }, [form.heroImageId, form.mediaIds]);

  const linkedMedia = useMemo(
    () => nonSystemMedia.filter((item) => linkedMediaIds.has(item.id)),
    [linkedMediaIds, nonSystemMedia]
  );

  const linkedImages = useMemo(
    () => linkedMedia.filter((item) => item.mediaType === MediaType.IMAGE),
    [linkedMedia]
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
    setForm((prev) => {
      const exists = prev.mediaIds.includes(mediaId);
      const nextMediaIds = exists
        ? prev.mediaIds.filter((id) => id !== mediaId)
        : [...prev.mediaIds, mediaId];
      const nextHeroImageId = exists && prev.heroImageId === mediaId ? '' : prev.heroImageId;

      return {
        ...prev,
        mediaIds: nextMediaIds,
        heroImageId: nextHeroImageId,
      };
    });
  }

  async function savePage() {
    setMessage(null);

    if (!selectedId) {
      setMessage('Bitte zuerst eine Seite waehlen.');
      return;
    }

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
      const response = await fetch(`/api/admin/pages/${selectedId}`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setMessage(result?.error || 'Speichern fehlgeschlagen.');
        return;
      }

      await loadData();
      setMessage('Seite erfolgreich gespeichert.');
    } finally {
      setSaving(false);
    }
  }

  async function uploadAndAttachMedia(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!selectedPage) {
      setMessage('Bitte zuerst eine Seite waehlen.');
      return;
    }

    const formData = new FormData(event.currentTarget);
    const file = formData.get('file');

    if (!(file instanceof File)) {
      setMessage('Bitte Datei auswaehlen.');
      return;
    }

    try {
      setUploading(true);
      const response = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      const result = (await response.json().catch(() => null)) as
        | { item?: MediaItem; error?: string }
        | null;

      if (!response.ok || !result?.item) {
        setMessage(result?.error || 'Upload fehlgeschlagen.');
        return;
      }

      const uploadedItem = result.item;
      setMedia((prev) => [uploadedItem, ...prev]);
      setForm((prev) => {
        const mediaIds = prev.mediaIds.includes(uploadedItem.id)
          ? prev.mediaIds
          : [uploadedItem.id, ...prev.mediaIds];

        return {
          ...prev,
          mediaIds,
          heroImageId:
            !prev.heroImageId && uploadedItem.mediaType === MediaType.IMAGE
              ? uploadedItem.id
              : prev.heroImageId,
        };
      });
      event.currentTarget.reset();
      setMessage('Datei hochgeladen und der Seite zugeordnet. Bitte Seite speichern.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-4">
          <h3 className="font-semibold text-white">Seiten</h3>
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
                <p className="text-sm font-semibold">
                  {MANAGED_PAGE_LABELS[page.slug as (typeof MANAGED_PAGE_SLUGS)[number]] || page.title}
                </p>
                <p className="text-xs uppercase tracking-[0.14em] text-accent-300">{page.status}</p>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
        {!selectedPage ? (
          <p className="text-sm text-accent-300">Keine verwaltbare Seite gefunden.</p>
        ) : null}

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
            readOnly
            className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/70"
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

        <form
          onSubmit={(event) => void uploadAndAttachMedia(event)}
          className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4"
        >
          <p className="text-xs uppercase tracking-[0.16em] text-accent-300">Datei hochladen</p>
          <p className="text-xs text-accent-400">
            Bild oder Video wird direkt der aktuell gewaehlten Seite zugeordnet.
          </p>
          <input
            name="file"
            type="file"
            required
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              name="title"
              placeholder="Titel (optional)"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
            <input
              name="altText"
              placeholder="Alt-Text (optional)"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </div>
          <input
            name="caption"
            placeholder="Beschreibung (optional)"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
          <button
            type="submit"
            disabled={uploading || !selectedPage}
            className="rounded-full border border-primary-500/40 px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-primary-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? 'Upload ...' : 'Datei hochladen'}
          </button>
        </form>

        <AdminSingleMediaPicker
          label="Hero-Bild"
          hint={
            'Waehlen Sie aus bereits verknuepften Bildern dieser Seite.'
          }
          items={linkedImages}
          selectedId={form.heroImageId}
          onSelect={(id) => setForm((prev) => ({ ...prev, heroImageId: id }))}
          emptyLabel="Kein Hero-Bild"
          acceptedTypes={[MediaType.IMAGE]}
        />

        <AdminMultiMediaPicker
          label="Seitenmedien"
          hint="Nur Medien dieser Seite. Entfernen Sie hier nicht benoetigte Dateien."
          items={linkedMedia}
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
            disabled={saving || !selectedPage}
            className="rounded-full bg-primary-600 px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white"
          >
            {saving ? 'Speichere ...' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  );
}
