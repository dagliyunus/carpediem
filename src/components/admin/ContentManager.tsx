'use client';

import { ContentStatus, MediaType } from '@prisma/client';
import { useEffect, useMemo, useState } from 'react';

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
  mediaType: MediaType;
};

type FormState = {
  slug: string;
  title: string;
  headline: string;
  subheadline: string;
  body: string;
  template: string;
  status: ContentStatus;
  publishedAt: string;
  heroImageId: string;
  sectionsJson: string;
  mediaIds: string[];
};

const emptyForm: FormState = {
  slug: '',
  title: '',
  headline: '',
  subheadline: '',
  body: '',
  template: 'standard',
  status: ContentStatus.DRAFT,
  publishedAt: '',
  heroImageId: '',
  sectionsJson: '',
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

  useEffect(() => {
    if (!selectedPage) {
      setForm(emptyForm);
      return;
    }

    setForm({
      slug: selectedPage.slug,
      title: selectedPage.title,
      headline: selectedPage.headline || '',
      subheadline: selectedPage.subheadline || '',
      body: selectedPage.body || '',
      template: selectedPage.template,
      status: selectedPage.status,
      publishedAt: toDatetimeLocal(selectedPage.publishedAt),
      heroImageId: selectedPage.heroImageId || '',
      sectionsJson: selectedPage.sections ? JSON.stringify(selectedPage.sections, null, 2) : '',
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

    let parsedSections: unknown = undefined;
    if (form.sectionsJson.trim()) {
      try {
        parsedSections = JSON.parse(form.sectionsJson);
      } catch {
        setMessage('Sections JSON ist nicht gueltig.');
        setSaving(false);
        return;
      }
    }

    const body = {
      slug: form.slug,
      title: form.title,
      headline: form.headline,
      subheadline: form.subheadline,
      body: form.body,
      template: form.template,
      status: form.status,
      publishedAt: fromDatetimeLocal(form.publishedAt),
      heroImageId: form.heroImageId || null,
      sections: parsedSections,
      mediaIds: form.mediaIds,
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
                <p className="text-xs uppercase tracking-[0.14em] text-accent-300">/{page.slug}</p>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Slug</span>
            <input
              value={form.slug}
              onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              placeholder="kontakt"
            />
          </label>
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
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Template</span>
            <input
              value={form.template}
              onChange={(event) => setForm((prev) => ({ ...prev, template: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
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

        <label className="space-y-1 block">
          <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Hero-Bild</span>
          <select
            value={form.heroImageId}
            onChange={(event) => setForm((prev) => ({ ...prev, heroImageId: event.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          >
            <option value="">Keins</option>
            {media
              .filter((item) => item.mediaType === MediaType.IMAGE)
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.filename}
                </option>
              ))}
          </select>
        </label>

        <label className="space-y-1 block">
          <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Sections (JSON)</span>
          <textarea
            value={form.sectionsJson}
            onChange={(event) => setForm((prev) => ({ ...prev, sectionsJson: event.target.value }))}
            className="h-36 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white font-mono"
            placeholder='[{"type":"hero","title":"..."}]'
          />
        </label>

        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.16em] text-accent-300">Verknuepfte Medien</p>
          <div className="max-h-44 space-y-2 overflow-auto rounded-xl border border-white/10 bg-black/20 p-3">
            {media.map((item) => (
              <label key={item.id} className="flex items-center gap-2 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={form.mediaIds.includes(item.id)}
                  onChange={() => toggleMedia(item.id)}
                />
                <span>{item.filename}</span>
                <span className="text-xs uppercase text-accent-300">{item.mediaType}</span>
              </label>
            ))}
          </div>
        </div>

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
