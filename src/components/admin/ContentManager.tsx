'use client';

import { ContentStatus, MediaType } from '@prisma/client';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';

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
    fieldKey: string;
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

type FormMediaLink = {
  mediaId: string;
  fieldKey: string;
};

type FormState = {
  title: string;
  headline: string;
  subheadline: string;
  body: string;
  status: ContentStatus;
  publishedAt: string;
  heroImageId: string;
  mediaLinks: FormMediaLink[];
};

type UploadTargetOption = {
  key: string;
  label: string;
  helper: string;
};

type DisplayMediaItem = {
  id: string;
  fieldKey: string;
  mediaType: MediaType;
  title: string;
  previewSrc: string;
  altText?: string | null;
};

const emptyForm: FormState = {
  title: '',
  headline: '',
  subheadline: '',
  body: '',
  status: ContentStatus.DRAFT,
  publishedAt: '',
  heroImageId: '',
  mediaLinks: [],
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

const SECTION_LABELS: Record<string, string> = {
  content: 'Seiteninhalt',
  fish_showcase: 'Fish Showcase',
  video_showcase: 'Video Showcase',
};

const HOME_UPLOAD_TARGETS: UploadTargetOption[] = [
  {
    key: 'fish_showcase',
    label: 'Fish Showcase',
    helper: 'Nur Bilder fuer den Fish-Showcase Bereich.',
  },
  {
    key: 'video_showcase',
    label: 'Video Showcase',
    helper: 'Nur Videos fuer den Video-Showcase Bereich.',
  },
];

const DEFAULT_UPLOAD_TARGET: UploadTargetOption = {
  key: 'content',
  label: 'Seiteninhalt',
  helper: 'Medien fuer diese Seite.',
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

function normalizeMediaLinks(links: FormMediaLink[]) {
  const unique = new Map<string, FormMediaLink>();
  for (const link of links) {
    const fieldKey = link.fieldKey?.trim() || 'content';
    if (!link.mediaId) continue;
    unique.set(`${link.mediaId}:${fieldKey}`, {
      mediaId: link.mediaId,
      fieldKey,
    });
  }
  return Array.from(unique.values());
}

function upsertMediaLink(links: FormMediaLink[], entry: FormMediaLink) {
  return normalizeMediaLinks([
    ...links,
    {
      mediaId: entry.mediaId,
      fieldKey: entry.fieldKey,
    },
  ]);
}

function getUploadTargetOptions(pageSlug?: string): UploadTargetOption[] {
  if (pageSlug === 'home') {
    return HOME_UPLOAD_TARGETS;
  }
  return [DEFAULT_UPLOAD_TARGET];
}

function getSectionLabel(fieldKey: string) {
  return SECTION_LABELS[fieldKey] || fieldKey;
}

function canUploadForTarget(targetKey: string, file: File) {
  if (targetKey === 'fish_showcase') return file.type.startsWith('image/');
  if (targetKey === 'video_showcase') return file.type.startsWith('video/');
  return file.type.startsWith('image/') || file.type.startsWith('video/');
}

function getTargetFieldLabels(targetKey: string) {
  if (targetKey === 'fish_showcase') {
    return {
      altText: 'Alt-Text fuer Bild (optional)',
      helper: 'Dieses Bild wird ohne eingeblendeten Titel oder Untertitel dargestellt.',
    };
  }

  if (targetKey === 'video_showcase') {
    return {
      altText: 'Alt-Text fuer Video (optional)',
      helper: 'Dieses Video wird ohne eingeblendeten Titel oder Untertitel dargestellt.',
    };
  }

  return {
    altText: 'Alt-Text (optional)',
    helper: 'Alt-Text wird fuer die Darstellung und Barrierefreiheit verwendet.',
  };
}

function buildVideoPosterCandidates(media: MediaItem) {
  const candidates = new Set<string>();
  const filename = media.filename.trim();
  const key = (media.key || '').trim();

  if (filename) {
    const baseName = filename.replace(/\.[^.]+$/, '');
    for (const ext of ['webp', 'png', 'jpg', 'jpeg']) {
      candidates.add(`${baseName}-poster.${ext}`.toLowerCase());
    }
  }

  if (key) {
    const baseKey = key.replace(/\.[^.]+$/, '');
    for (const ext of ['webp', 'png', 'jpg', 'jpeg']) {
      candidates.add(`${baseKey}-poster.${ext}`.toLowerCase());
    }
  }

  return Array.from(candidates);
}

function findRelatedPoster(media: MediaItem, mediaItems: MediaItem[]) {
  if (media.mediaType !== MediaType.VIDEO) return null;

  const candidates = buildVideoPosterCandidates(media);
  return (
    mediaItems.find((item) => {
      if (item.mediaType !== MediaType.IMAGE) return false;
      const filename = item.filename.toLowerCase();
      const key = (item.key || '').toLowerCase();
      return candidates.some((candidate) => filename === candidate || key === candidate);
    }) || null
  );
}

export function ContentManager() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null);
  const [uploadTargetKey, setUploadTargetKey] = useState<string>('content');
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

  const uploadTargets = useMemo(
    () => getUploadTargetOptions(selectedPage?.slug),
    [selectedPage?.slug]
  );
  const uploadFieldLabels = useMemo(
    () => getTargetFieldLabels(uploadTargetKey),
    [uploadTargetKey]
  );

  useEffect(() => {
    if (uploadTargets.length === 0) return;
    const isValidTarget = uploadTargets.some((target) => target.key === uploadTargetKey);
    if (!isValidTarget) {
      setUploadTargetKey(uploadTargets[0].key);
    }
  }, [uploadTargetKey, uploadTargets]);

  const nonSystemMedia = useMemo(
    () => media.filter((item) => !isSystemMediaAsset(item)),
    [media]
  );

  const mediaById = useMemo(() => {
    const map = new Map<string, MediaItem>();
    for (const item of nonSystemMedia) {
      map.set(item.id, item);
    }
    return map;
  }, [nonSystemMedia]);

  const linkedMediaEntries = useMemo(
    () =>
      normalizeMediaLinks(form.mediaLinks)
        .map((entry) => ({
          ...entry,
          media: mediaById.get(entry.mediaId) || null,
        }))
        .filter((entry) => Boolean(entry.media)),
    [form.mediaLinks, mediaById]
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
      mediaLinks: normalizeMediaLinks(
        (selectedPage.mediaLinks || []).map((link) => ({
          mediaId: link.mediaId,
          fieldKey: link.fieldKey || 'content',
        }))
      ),
    });
  }, [selectedPage]);

  function buildPagePayload(next: { mediaLinks?: FormMediaLink[]; heroImageId?: string | null } = {}) {
    const normalizedMediaLinks = normalizeMediaLinks(next.mediaLinks ?? form.mediaLinks).filter((link) =>
      nonSystemMedia.some((item) => item.id === link.mediaId)
    );

    const rawHeroImageId = next.heroImageId === undefined ? form.heroImageId : next.heroImageId || '';
    const safeHeroImageId =
      rawHeroImageId && nonSystemMedia.some((item) => item.id === rawHeroImageId) ? rawHeroImageId : null;

    return {
      title: form.title,
      headline: form.headline,
      subheadline: form.subheadline,
      body: form.body,
      status: form.status,
      publishedAt: fromDatetimeLocal(form.publishedAt),
      heroImageId: safeHeroImageId,
      mediaLinks: normalizedMediaLinks,
    };
  }

  async function savePage() {
    setMessage(null);

    if (!selectedId) {
      setMessage('Bitte zuerst eine Seite waehlen.');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/admin/pages/${selectedId}`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(buildPagePayload()),
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

  async function persistMediaLinks(nextLinks: FormMediaLink[], nextHeroImageId?: string | null) {
    if (!selectedPage) return false;

    const response = await fetch(`/api/admin/pages/${selectedPage.id}`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(
        buildPagePayload({
          mediaLinks: nextLinks,
          heroImageId: nextHeroImageId,
        })
      ),
    });

    const result = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) {
      setMessage(result?.error || 'Seitenmedien konnten nicht aktualisiert werden.');
      return false;
    }

    return true;
  }

  async function uploadAndAttachMedia(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!selectedPage) {
      setMessage('Bitte zuerst eine Seite waehlen.');
      return;
    }

    const target = uploadTargets.find((item) => item.key === uploadTargetKey);
    if (!target) {
      setMessage('Bitte Bereich fuer den Upload auswaehlen.');
      return;
    }

    const formData = new FormData(event.currentTarget);
    const file = formData.get('file');

    if (!(file instanceof File)) {
      setMessage('Bitte Datei auswaehlen.');
      return;
    }

    if (!canUploadForTarget(target.key, file)) {
      setMessage(
        target.key === 'video_showcase'
          ? 'Fuer Video Showcase sind nur Videos erlaubt.'
          : target.key === 'fish_showcase'
            ? 'Fuer Fish Showcase sind nur Bilder erlaubt.'
            : 'Dateityp fuer diesen Bereich nicht erlaubt.'
      );
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
      const nextLinks = upsertMediaLink(form.mediaLinks, {
        mediaId: uploadedItem.id,
        fieldKey: target.key,
      });

      const linked = await persistMediaLinks(nextLinks);
      if (!linked) {
        setMessage('Datei hochgeladen, aber Verknuepfung zur Seite fehlgeschlagen. Bitte erneut speichern.');
        return;
      }

      setMedia((prev) => [uploadedItem, ...prev]);
      setForm((prev) => ({
        ...prev,
        mediaLinks: nextLinks,
      }));
      event.currentTarget.reset();
      await loadData();
      setMessage(`Datei hochgeladen und zu "${target.label}" hinzugefuegt.`);
    } finally {
      setUploading(false);
    }
  }

  async function deleteLinkedMedia(mediaId: string) {
    if (!selectedPage) return;

    const targetMedia = mediaById.get(mediaId);
    if (!targetMedia) {
      setMessage('Medium nicht gefunden.');
      return;
    }

    if (!window.confirm(`Medium "${targetMedia.filename}" wirklich aus Blob und Datenbank loeschen?`)) {
      return;
    }

    setDeletingMediaId(mediaId);
    setMessage(null);

    try {
      const relatedPoster = findRelatedPoster(targetMedia, nonSystemMedia);
      const idsToRemove = new Set([mediaId]);

      if (relatedPoster) {
        idsToRemove.add(relatedPoster.id);
      }

      const nextLinks = form.mediaLinks.filter((link) => !idsToRemove.has(link.mediaId));
      const nextHeroImageId = form.heroImageId === mediaId ? '' : form.heroImageId;

      const unlinked = await persistMediaLinks(nextLinks, nextHeroImageId);
      if (!unlinked) {
        return;
      }

      for (const id of idsToRemove) {
        const response = await fetch(`/api/admin/media/${id}`, {
          method: 'DELETE',
        });
        const result = (await response.json().catch(() => null)) as { error?: string } | null;

        if (!response.ok) {
          setMessage(result?.error || 'Datei konnte nicht geloescht werden.');
          await loadData();
          return;
        }
      }

      setMedia((prev) => prev.filter((item) => !idsToRemove.has(item.id)));
      setForm((prev) => ({
        ...prev,
        mediaLinks: prev.mediaLinks.filter((link) => !idsToRemove.has(link.mediaId)),
        heroImageId: prev.heroImageId === mediaId ? '' : prev.heroImageId,
      }));
      await loadData();
      setMessage('Medium erfolgreich aus Seite, Blob und Datenbank entfernt.');
    } finally {
      setDeletingMediaId(null);
    }
  }

  function renderMediaSection(fieldKey: string, title: string, hint: string) {
    const allowedMediaType =
      fieldKey === 'fish_showcase' ? MediaType.IMAGE : fieldKey === 'video_showcase' ? MediaType.VIDEO : null;

    const entries: DisplayMediaItem[] = linkedMediaEntries
      .filter(
        (entry) =>
          entry.fieldKey === fieldKey &&
          entry.media &&
          (!allowedMediaType || entry.media.mediaType === allowedMediaType)
      )
      .map((entry) => {
        const mediaItem = entry.media;
        const poster = findRelatedPoster(mediaItem!, nonSystemMedia);

        return {
          id: mediaItem!.id,
          fieldKey: entry.fieldKey,
          mediaType: mediaItem!.mediaType,
          title: mediaItem!.filename,
          previewSrc:
            mediaItem!.mediaType === MediaType.VIDEO && poster
              ? `/api/admin/media/${poster.id}/preview`
              : `/api/admin/media/${mediaItem!.id}/preview`,
          altText: mediaItem!.altText,
        };
      });

    return (
      <div className="space-y-2 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-accent-300">{title}</p>
          <p className="mt-1 text-xs text-accent-400">{hint}</p>
        </div>

        {entries.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/15 bg-black/30 px-3 py-4 text-sm text-accent-300">
            Noch keine Medien in diesem Bereich.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => {
              const isDeleting = deletingMediaId === entry.id;

              return (
                <article key={`${entry.fieldKey}-${entry.id}`} className="overflow-hidden rounded-2xl border border-white/10 bg-black/35">
                  <div className="relative aspect-video overflow-hidden bg-black/60">
                    {entry.mediaType === MediaType.IMAGE ? (
                      <Image
                        src={entry.previewSrc}
                        alt={entry.altText || entry.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <video
                        src={entry.previewSrc}
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover"
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => void deleteLinkedMedia(entry.id)}
                      disabled={isDeleting}
                      className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-400/50 bg-red-500/90 text-white transition hover:bg-red-500 disabled:opacity-70"
                      aria-label={`Medium ${entry.title} loeschen`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="space-y-1 px-3 py-2">
                    <p className="line-clamp-1 text-sm font-semibold text-white">{entry.title}</p>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-accent-300">
                      {getSectionLabel(entry.fieldKey)} • {entry.mediaType}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    );
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

      <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
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

        <label className="block space-y-1">
          <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Titel</span>
          <input
            value={form.title}
            readOnly
            className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/70"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Headline</span>
            <input
              value={form.headline}
              onChange={(event) => setForm((prev) => ({ ...prev, headline: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Subheadline</span>
            <input
              value={form.subheadline}
              onChange={(event) => setForm((prev) => ({ ...prev, subheadline: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
        </div>

        <label className="block space-y-1">
          <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Textinhalt</span>
          <textarea
            value={form.body}
            onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
            className="h-40 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1">
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
          <p className="text-xs uppercase tracking-[0.16em] text-accent-300">Bild/Video hinzufuegen</p>
          <p className="text-xs text-accent-400">
            Waehlen Sie zuerst den Zielbereich aus. Die Datei wird danach sofort verknuepft.
          </p>

          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Bereich</span>
            <select
              value={uploadTargetKey}
              onChange={(event) => setUploadTargetKey(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            >
              {uploadTargets.map((target) => (
                <option key={target.key} value={target.key}>
                  {target.label}
                </option>
              ))}
            </select>
            {uploadTargets.find((target) => target.key === uploadTargetKey)?.helper ? (
              <p className="text-xs text-accent-400">
                {uploadTargets.find((target) => target.key === uploadTargetKey)?.helper}
              </p>
            ) : null}
            <p className="text-xs text-accent-400">{uploadFieldLabels.helper}</p>
          </label>

          <input
            name="file"
            type="file"
            accept="image/*,video/*"
            required
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
          <input
            name="altText"
            placeholder={uploadFieldLabels.altText}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
          <button
            type="submit"
            disabled={uploading || !selectedPage}
            className="rounded-full bg-primary-600 px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? 'Upload ...' : 'Bild/Video hinzufuegen'}
          </button>
        </form>

        {selectedPage?.slug === 'home' ? (
          <div className="space-y-4">
            {renderMediaSection('fish_showcase', 'Fish Showcase', 'Nur Bilder fuer diesen Homepage-Bereich.')}
            {renderMediaSection('video_showcase', 'Video Showcase', 'Nur Videos fuer diesen Homepage-Bereich.')}
          </div>
        ) : (
          renderMediaSection('content', 'Seitenmedien', 'Nur Medien dieser Seite.')
        )}

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
