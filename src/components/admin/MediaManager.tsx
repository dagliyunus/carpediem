'use client';

import Image from 'next/image';
import { MediaType } from '@prisma/client';
import { FormEvent, useEffect, useMemo, useState } from 'react';

type MediaItem = {
  id: string;
  url: string;
  filename: string;
  mediaType: MediaType;
  mimeType: string;
  sizeBytes: number;
  altText: string | null;
  createdAt: string;
};

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

export function MediaManager() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [metaAltText, setMetaAltText] = useState('');

  async function loadData() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/media', { cache: 'no-store' });
      const data = (await response.json()) as { items: MediaItem[] };
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) || null,
    [items, selectedId]
  );
  const selectedPreviewUrl = selected ? `/api/admin/media/${selected.id}/preview` : '';

  useEffect(() => {
    if (!selected) {
      setMetaAltText('');
      return;
    }

    setMetaAltText(selected.altText || '');
  }, [selected]);

  async function uploadFile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const file = formData.get('file');

    if (!(file instanceof File)) {
      setMessage('Bitte Datei waehlen.');
      return;
    }

    try {
      setUploading(true);
      const response = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setMessage(result?.error || 'Upload fehlgeschlagen.');
        return;
      }

      setMessage('Upload erfolgreich.');
      event.currentTarget.reset();
      await loadData();
    } finally {
      setUploading(false);
    }
  }

  async function saveMetadata() {
    if (!selected) return;

    const response = await fetch(`/api/admin/media/${selected.id}`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        altText: metaAltText,
      }),
    });

    const result = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setMessage(result?.error || 'Metadaten konnten nicht gespeichert werden.');
      return;
    }

    setMessage('Metadaten gespeichert.');
    await loadData();
  }

  async function deleteMedia() {
    if (!selected) return;
    if (!window.confirm('Datei wirklich loeschen?')) return;

    const response = await fetch(`/api/admin/media/${selected.id}`, {
      method: 'DELETE',
    });

    const result = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setMessage(result?.error || 'Loeschen fehlgeschlagen.');
      return;
    }

    setSelectedId(null);
    setMessage('Datei geloescht.');
    await loadData();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <div className="space-y-6">
        <form
          onSubmit={uploadFile}
          className="space-y-3 rounded-3xl border border-white/10 bg-white/[0.03] p-4"
        >
          <h3 className="text-lg font-semibold text-white">Datei hochladen</h3>
          <input
            name="file"
            type="file"
            required
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
          <input
            name="altText"
            placeholder="Alt Text"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
          <button
            type="submit"
            disabled={uploading}
            className="rounded-full bg-primary-600 px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white"
          >
            {uploading ? 'Upload ...' : 'Upload starten'}
          </button>
        </form>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="mb-3 text-lg font-semibold text-white">Bibliothek</h3>
          <div className="max-h-[600px] space-y-2 overflow-auto">
            {loading ? (
              <p className="text-sm text-accent-300">Lade Medien ...</p>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full rounded-2xl border px-3 py-3 text-left ${
                    selectedId === item.id
                      ? 'border-primary-400/50 bg-primary-500/15'
                      : 'border-white/10 bg-black/20 hover:border-white/20'
                  }`}
                >
                  <p className="line-clamp-1 text-sm font-semibold text-white">{item.filename}</p>
                  <p className="text-xs uppercase tracking-[0.14em] text-accent-300">
                    {item.mediaType} · {formatBytes(item.sizeBytes)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        {!selected ? (
          <p className="text-sm text-accent-300">Waehlen Sie links eine Datei aus, um Metadaten zu bearbeiten.</p>
        ) : (
          <div className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              {selected.mediaType === MediaType.IMAGE ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10">
                  <Image src={selectedPreviewUrl} alt={selected.altText || selected.filename} fill className="object-cover" />
                </div>
              ) : selected.mediaType === MediaType.VIDEO ? (
                <video src={selectedPreviewUrl} controls className="w-full rounded-xl border border-white/10" />
              ) : (
                <a href={selectedPreviewUrl} target="_blank" rel="noreferrer" className="text-primary-300 underline">
                  Datei in neuem Tab oeffnen
                </a>
              )}
            </div>

            <label className="space-y-1 block">
              <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Alt Text</span>
              <textarea
                value={metaAltText}
                onChange={(event) => setMetaAltText(event.target.value)}
                className="h-24 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void saveMetadata()}
                className="rounded-full bg-primary-600 px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white"
              >
                Metadaten speichern
              </button>
              <button
                type="button"
                onClick={() => void deleteMedia()}
                className="rounded-full border border-red-500/40 px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-red-200"
              >
                Datei loeschen
              </button>
            </div>
          </div>
        )}

        {message ? (
          <p className="mt-5 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-accent-100">{message}</p>
        ) : null}
      </div>
    </div>
  );
}
