'use client';

import { ContentStatus, MediaType } from '@prisma/client';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

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
  coverImage?: MediaItem | null;
  categories: Array<{ category: { name: string } }>;
  tags: Array<{ tag: { name: string } }>;
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
  categories: string;
  tags: string;
  coverImageId: string;
};

const emptyForm: FormState = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  status: ContentStatus.DRAFT,
  publishedAt: '',
  scheduledAt: '',
  categories: '',
  tags: '',
  coverImageId: '',
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
  const [coverMedia, setCoverMedia] = useState<MediaItem | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [deletingCover, setDeletingCover] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const articleRes = await fetch('/api/admin/articles', { cache: 'no-store' });
      const articleData = (await articleRes.json()) as { items: ArticleItem[] };

      setItems(articleData.items || []);
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
      setCoverMedia(null);
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
      categories: selectedItem.categories.map((item) => item.category.name).join(', '),
      tags: selectedItem.tags.map((item) => item.tag.name).join(', '),
      coverImageId: selectedItem.coverImageId || '',
    });
    setCoverMedia(selectedItem.coverImage || null);
  }, [selectedItem]);

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
      mediaIds: [],
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

  async function uploadCoverImage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const file = formData.get('file');

    if (!(file instanceof File) || file.size <= 0) {
      setMessage('Bitte ein Bild auswaehlen.');
      return;
    }

    try {
      setUploadingCover(true);
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

      if (result.item.mediaType !== MediaType.IMAGE) {
        setMessage('Bitte nur Bilddateien als Cover verwenden.');
        return;
      }

      setCoverMedia(result.item as MediaItem);
      setForm((prev) => ({
        ...prev,
        coverImageId: result.item?.id || '',
      }));
      event.currentTarget.reset();
      setMessage('Cover-Bild hochgeladen. Bitte Beitrag speichern.');
    } finally {
      setUploadingCover(false);
    }
  }

  async function deleteSelectedCoverAsset() {
    if (!form.coverImageId) {
      setMessage('Kein Cover-Bild ausgewaehlt.');
      return;
    }

    if (selectedItem?.coverImageId === form.coverImageId) {
      setMessage(
        'Bitte zuerst speichern, damit das Cover vom Beitrag getrennt wird. Danach koennen Sie die Datei loeschen.'
      );
      return;
    }

    const target = coverMedia && coverMedia.id === form.coverImageId ? coverMedia : null;
    if (!target) {
      setMessage('Cover-Datei nicht gefunden.');
      return;
    }

    if (!window.confirm(`Datei "${target.filename}" wirklich aus dem Speicher loeschen?`)) {
      return;
    }

    try {
      setDeletingCover(true);
      const response = await fetch(`/api/admin/media/${target.id}`, {
        method: 'DELETE',
      });
      const result = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setMessage(result?.error || 'Datei konnte nicht geloescht werden.');
        return;
      }

      setCoverMedia(null);
      setForm((prev) => ({ ...prev, coverImageId: '' }));
      setMessage('Cover-Datei aus dem Blob-Speicher entfernt.');
    } finally {
      setDeletingCover(false);
    }
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
              setCoverMedia(null);
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

      <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Titel</span>
            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
          <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.16em] text-accent-300">Link-Adresse</p>
            <p className="mt-1 text-sm text-white/80">Wird automatisch aus dem Titel erstellt.</p>
          </div>
        </div>

        <label className="block space-y-1">
          <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Kurzbeschreibung</span>
          <textarea
            value={form.excerpt}
            onChange={(event) => setForm((prev) => ({ ...prev, excerpt: event.target.value }))}
            className="h-24 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Inhalt</span>
          <textarea
            value={form.content}
            onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
            className="h-64 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block space-y-1">
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
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Veroeffentlichen am</span>
            <input
              type="datetime-local"
              value={form.publishedAt}
              onChange={(event) => setForm((prev) => ({ ...prev, publishedAt: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Planen fuer</span>
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(event) => setForm((prev) => ({ ...prev, scheduledAt: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Kategorien (Komma)</span>
            <input
              value={form.categories}
              onChange={(event) => setForm((prev) => ({ ...prev, categories: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              placeholder="Events, Kulinarik"
            />
            <p className="text-[11px] text-accent-400">Leer lassen = automatische Kategorien aus dem Inhalt.</p>
          </label>
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Tags (Komma)</span>
            <input
              value={form.tags}
              onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              placeholder="bad-saarow, sommer"
            />
            <p className="text-[11px] text-accent-400">Leer lassen = automatische Tags aus dem Inhalt.</p>
          </label>
        </div>

        <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="space-y-2">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-accent-300">Beitragsbild</p>
              <p className="mt-1 text-xs text-accent-400">
                Dieses Bild wird fuer die Magazin-Karte und im Artikelkopf verwendet.
              </p>
            </div>

            {coverMedia ? (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/35">
                <div className="relative aspect-[16/10] overflow-hidden bg-black/60">
                  <Image
                    src={`/api/admin/media/${coverMedia.id}/preview`}
                    alt={coverMedia.altText || coverMedia.filename}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-1 px-3 py-2">
                  <p className="line-clamp-1 text-sm font-semibold text-white">{coverMedia.filename}</p>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-accent-300">Bild</p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/15 bg-black/30 px-4 py-5 text-sm text-accent-300">
                Noch kein Beitragsbild hinterlegt.
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setForm((prev) => ({ ...prev, coverImageId: '' }));
                setCoverMedia(null);
              }}
              className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/80"
            >
              Cover entfernen
            </button>
            <button
              type="button"
              onClick={() => void deleteSelectedCoverAsset()}
              disabled={!form.coverImageId || deletingCover}
              className="rounded-full border border-red-500/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-red-200 disabled:opacity-60"
            >
              {deletingCover ? 'Loesche Datei ...' : 'Cover-Datei loeschen'}
            </button>
          </div>

          {coverMedia ? (
            <p className="text-xs text-accent-300">
              Ausgewaehlt: <span className="font-semibold text-white">{coverMedia.filename}</span>
            </p>
          ) : null}

          <form onSubmit={uploadCoverImage} className="grid gap-3 rounded-xl border border-white/10 bg-black/30 p-3 sm:grid-cols-3">
            <label className="block space-y-1 sm:col-span-3">
              <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Neues Cover hochladen</span>
              <input
                type="file"
                name="file"
                accept="image/*"
                required
                className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white file:mr-3 file:rounded-md file:border-0 file:bg-primary-600 file:px-3 file:py-1 file:text-xs file:font-semibold file:uppercase file:tracking-[0.14em] file:text-white"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs uppercase tracking-[0.14em] text-accent-300">Titel (optional)</span>
              <input
                name="title"
                className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs uppercase tracking-[0.14em] text-accent-300">Alt-Text (optional)</span>
              <input
                name="altText"
                className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
              />
            </label>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={uploadingCover}
                className="w-full rounded-full bg-primary-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white disabled:opacity-70"
              >
                {uploadingCover ? 'Lade hoch ...' : 'Bild hochladen'}
              </button>
            </div>
          </form>
        </div>

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
