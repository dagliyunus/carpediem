'use client';

import { ContentStatus, MediaType } from '@prisma/client';
import { useEffect, useMemo, useState } from 'react';
import { AdminMultiMediaPicker, AdminSingleMediaPicker } from '@/components/admin/MediaPicker';

type ArticleItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  status: ContentStatus;
  publishedAt: string | null;
  scheduledAt: string | null;
  coverImageId: string | null;
  categories: Array<{ category: { name: string } }>;
  tags: Array<{ tag: { name: string } }>;
  mediaLinks: Array<{ mediaId: string }>;
};

type MediaItem = {
  id: string;
  url: string;
  filename: string;
  mediaType: MediaType;
  altText?: string | null;
};

type FormState = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: ContentStatus;
  publishedAt: string;
  scheduledAt: string;
  coverImageId: string;
  categories: string;
  tags: string;
  mediaIds: string[];
};

const emptyForm: FormState = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  status: ContentStatus.DRAFT,
  publishedAt: '',
  scheduledAt: '',
  coverImageId: '',
  categories: '',
  tags: '',
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

export function MagazinManager() {
  const [items, setItems] = useState<ArticleItem[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const [articleRes, mediaRes] = await Promise.all([
        fetch('/api/admin/articles', { cache: 'no-store' }),
        fetch('/api/admin/media', { cache: 'no-store' }),
      ]);

      const articleData = (await articleRes.json()) as { items: ArticleItem[] };
      const mediaData = (await mediaRes.json()) as { items: MediaItem[] };

      setItems(articleData.items || []);
      setMedia(mediaData.items || []);
    } finally {
      setLoading(false);
    }
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
      title: selectedItem.title,
      slug: selectedItem.slug,
      excerpt: selectedItem.excerpt || '',
      content: selectedItem.content,
      status: selectedItem.status,
      publishedAt: toDatetimeLocal(selectedItem.publishedAt),
      scheduledAt: toDatetimeLocal(selectedItem.scheduledAt),
      coverImageId: selectedItem.coverImageId || '',
      categories: selectedItem.categories.map((item) => item.category.name).join(', '),
      tags: selectedItem.tags.map((item) => item.tag.name).join(', '),
      mediaIds: selectedItem.mediaLinks.map((item) => item.mediaId),
    });
  }, [selectedItem]);

  function toggleMedia(mediaId: string) {
    setForm((prev) => ({
      ...prev,
      mediaIds: prev.mediaIds.includes(mediaId)
        ? prev.mediaIds.filter((id) => id !== mediaId)
        : [...prev.mediaIds, mediaId],
    }));
  }

  async function saveArticle() {
    setSaving(true);
    setMessage(null);

    const payload = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      content: form.content,
      status: form.status,
      publishedAt: fromDatetimeLocal(form.publishedAt),
      scheduledAt: fromDatetimeLocal(form.scheduledAt),
      coverImageId: form.coverImageId || null,
      mediaIds: form.mediaIds,
      categoryNames: form.categories
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
      tagNames: form.tags
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    };

    try {
      const isUpdate = Boolean(selectedId);
      const response = await fetch(isUpdate ? `/api/admin/articles/${selectedId}` : '/api/admin/articles', {
        method: isUpdate ? 'PATCH' : 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => null)) as { error?: string; item?: ArticleItem } | null;

      if (!response.ok) {
        setMessage(result?.error || 'Speichern fehlgeschlagen.');
        return;
      }

      await loadData();

      if (!selectedId && result?.item?.id) {
        setSelectedId(result.item.id);
      }

      setMessage('Beitrag gespeichert.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteArticle() {
    if (!selectedId) return;
    if (!window.confirm('Beitrag wirklich loeschen?')) return;

    const response = await fetch(`/api/admin/articles/${selectedId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(result?.error || 'Loeschen fehlgeschlagen.');
      return;
    }

    setSelectedId(null);
    setForm(emptyForm);
    await loadData();
    setMessage('Beitrag geloescht.');
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-white">Magazin</h3>
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
            <p className="text-sm text-accent-300">Lade Beitraege ...</p>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`w-full rounded-2xl border px-3 py-2 text-left transition ${
                  selectedId === item.id
                    ? 'border-primary-400/50 bg-primary-500/15 text-primary-100'
                    : 'border-white/10 bg-black/20 text-white/80 hover:border-white/20'
                }`}
              >
                <p className="line-clamp-1 text-sm font-semibold">{item.title}</p>
                <p className="text-xs uppercase tracking-[0.14em] text-accent-300">{item.status}</p>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 block">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Titel</span>
            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
          <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.16em] text-accent-300">Link-Adresse</p>
            <p className="mt-1 text-sm text-white/80">
              Wird automatisch aus dem Titel erstellt.
            </p>
          </div>
        </div>

        <label className="space-y-1 block">
          <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Kurzbeschreibung</span>
          <textarea
            value={form.excerpt}
            onChange={(event) => setForm((prev) => ({ ...prev, excerpt: event.target.value }))}
            className="h-24 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
        </label>

        <label className="space-y-1 block">
          <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Inhalt</span>
          <textarea
            value={form.content}
            onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
            className="h-64 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="space-y-1 block">
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
          <label className="space-y-1 block">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Publish At</span>
            <input
              type="datetime-local"
              value={form.publishedAt}
              onChange={(event) => setForm((prev) => ({ ...prev, publishedAt: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Schedule At</span>
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(event) => setForm((prev) => ({ ...prev, scheduledAt: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 block">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Kategorien (Komma)</span>
            <input
              value={form.categories}
              onChange={(event) => setForm((prev) => ({ ...prev, categories: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              placeholder="Events, Kulinarik"
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Tags (Komma)</span>
            <input
              value={form.tags}
              onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              placeholder="bad-saarow, sommer"
            />
          </label>
        </div>

        <AdminSingleMediaPicker
          label="Cover-Bild"
          hint="Dieses Bild wird im Magazin-Listing und im Artikelkopf angezeigt."
          items={media}
          selectedId={form.coverImageId}
          onSelect={(id) => setForm((prev) => ({ ...prev, coverImageId: id }))}
          emptyLabel="Kein Cover-Bild"
          acceptedTypes={[MediaType.IMAGE]}
        />

        <AdminMultiMediaPicker
          label="Zusaetzliche Medien"
          hint="Waehlen Sie weitere Bilder oder Videos fuer diesen Beitrag."
          items={media}
          selectedIds={form.mediaIds}
          onToggle={toggleMedia}
        />

        {message ? (
          <p className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-accent-100">{message}</p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void saveArticle()}
            disabled={saving}
            className="rounded-full bg-primary-600 px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white"
          >
            {saving ? 'Speichere ...' : 'Speichern'}
          </button>
          {selectedId ? (
            <button
              type="button"
              onClick={() => void deleteArticle()}
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
