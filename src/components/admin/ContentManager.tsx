'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import {
  ContentStatus,
  MediaType,
  type ContentStatus as ContentStatusValue,
  type MediaType as MediaTypeValue,
} from '@/lib/client/prisma-enums';
import {
  buildGalleryMediaLinks,
  cloneGalleryPageSections,
  DEFAULT_GALLERY_PAGE_BODY,
  DEFAULT_GALLERY_PAGE_HEADLINE,
  DEFAULT_GALLERY_PAGE_SUBHEADLINE,
  GALLERY_SECTION_KEYS,
  isGallerySectionKey,
  normalizeGalleryPageSections,
  type GalleryPageSections,
  type GallerySectionKey,
} from '@/lib/cms/gallery-page';
import { isHomePageRecord } from '@/lib/cms/page-slugs';
import {
  buildHomeAnnouncementMediaLinks,
  cloneHomePageSections,
  createHomeAnnouncementId,
  isHomeAnnouncementFieldKey,
  normalizeHomePageSections,
  type HomeAnnouncementItem,
  type HomePageSections,
} from '@/lib/cms/home-announcements';

type PageItem = {
  id: string;
  slug: string;
  title: string;
  headline: string | null;
  subheadline: string | null;
  body: string | null;
  template: string;
  status: ContentStatusValue;
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
  mediaType: MediaTypeValue;
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
  status: ContentStatusValue;
  publishedAt: string;
  heroImageId: string;
  mediaLinks: FormMediaLink[];
};

type GalleryDisplayMediaItem = {
  id: string;
  mediaId?: string;
  url?: string;
  fieldKey: GallerySectionKey;
  previewSrc: string;
  title: string;
  altText: string;
  caption: string;
  mediaType: MediaTypeValue;
  isStatic: boolean;
};

type UploadTargetOption = {
  key: string;
  label: string;
  helper: string;
};

type DisplayMediaItem = {
  id: string;
  fieldKey: string;
  mediaType: MediaTypeValue;
  title: string;
  previewSrc: string;
  previewType: MediaTypeValue;
  altText?: string | null;
};

type HomeAnnouncementDisplayItem = HomeAnnouncementItem & {
  media: MediaItem | null;
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

const MANAGED_PAGE_SLUGS = ['galerie'] as const;

const MANAGED_PAGE_ORDER: Record<(typeof MANAGED_PAGE_SLUGS)[number], number> = {
  galerie: 1,
};

const MANAGED_PAGE_LABELS: Record<(typeof MANAGED_PAGE_SLUGS)[number], string> = {
  galerie: 'Galerie',
};

const SECTION_LABELS: Record<string, string> = {
  content: 'Seiteninhalt',
  fish_showcase: 'Fish Showcase',
  video_showcase: 'Video Showcase',
  home_announcements: 'Ankündigungen',
  gallery_ambiente: 'Ambiente am Kurpark',
  gallery_food: 'Gerichte und mediterrane Küche',
  gallery_events: 'Events, Drinks und besondere Momente',
};

const HOME_UPLOAD_TARGETS: UploadTargetOption[] = [
  {
    key: 'fish_showcase',
    label: 'Fish Showcase',
    helper: 'Nur Bilder für den Fish-Showcase Bereich.',
  },
  {
    key: 'video_showcase',
    label: 'Video Showcase',
    helper: 'Nur Videos für den Video-Showcase Bereich.',
  },
];

const GALLERY_UPLOAD_TARGETS: UploadTargetOption[] = [
  {
    key: 'gallery_ambiente',
    label: 'Ambiente am Kurpark',
    helper: 'Bilder für den Ambiente-Bereich der Galerie.',
  },
  {
    key: 'gallery_food',
    label: 'Gerichte und mediterrane Küche',
    helper: 'Bilder für den Food-Bereich der Galerie.',
  },
  {
    key: 'gallery_events',
    label: 'Events, Drinks und besondere Momente',
    helper: 'Bilder für den Event- und Drinks-Bereich der Galerie.',
  },
];

const DEFAULT_UPLOAD_TARGET: UploadTargetOption = {
  key: 'content',
  label: 'Seiteninhalt',
  helper: 'Medien für diese Seite.',
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
  if (pageSlug === 'galerie') {
    return GALLERY_UPLOAD_TARGETS;
  }
  return [DEFAULT_UPLOAD_TARGET];
}

function getSectionLabel(fieldKey: string) {
  return SECTION_LABELS[fieldKey] || fieldKey;
}

function canUploadForTarget(targetKey: string, file: File) {
  if (targetKey === 'fish_showcase') return file.type.startsWith('image/');
  if (targetKey === 'video_showcase') return file.type.startsWith('video/');
  if (isGallerySectionKey(targetKey)) return file.type.startsWith('image/');
  return file.type.startsWith('image/') || file.type.startsWith('video/');
}

function getTargetFieldLabels(targetKey: string) {
  if (targetKey === 'fish_showcase') {
    return {
      altText: 'Alt-Text für Bild (optional)',
      helper: 'Dieses Bild wird ohne eingeblendeten Titel oder Untertitel dargestellt.',
    };
  }

  if (targetKey === 'video_showcase') {
    return {
      altText: 'Alt-Text für Video (optional)',
      helper: 'Dieses Video wird ohne eingeblendeten Titel oder Untertitel dargestellt.',
    };
  }

  if (isGallerySectionKey(targetKey)) {
    return {
      altText: 'Alt-Text für Bild (optional)',
      helper: 'Bild wird dem ausgewählten Galerie-Bereich zugeordnet. Titel, Beschreibung und Caption können Sie darunter bearbeiten.',
    };
  }

  return {
    altText: 'Alt-Text (optional)',
    helper: 'Alt-Text wird für die Darstellung und Barrierefreiheit verwendet.',
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

function createGalleryImageId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
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
  const [galleryContent, setGalleryContent] = useState<GalleryPageSections>(
    cloneGalleryPageSections()
  );
  const [homeSections, setHomeSections] = useState<HomePageSections>(
    cloneHomePageSections()
  );

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
        .filter((page) => isHomePageRecord(page) || MANAGED_PAGE_SLUGS.includes(page.slug as (typeof MANAGED_PAGE_SLUGS)[number]))
        .sort(
          (a, b) => {
            const aOrder = isHomePageRecord(a) ? 0 : MANAGED_PAGE_ORDER[a.slug as (typeof MANAGED_PAGE_SLUGS)[number]] ?? 99;
            const bOrder = isHomePageRecord(b) ? 0 : MANAGED_PAGE_ORDER[b.slug as (typeof MANAGED_PAGE_SLUGS)[number]] ?? 99;
            return aOrder - bOrder;
          }
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
      setGalleryContent(cloneGalleryPageSections());
      setHomeSections(cloneHomePageSections());
      return;
    }

    const isGalleryPage = selectedPage.slug === 'galerie';
    const isHomePage = isHomePageRecord(selectedPage);
    const normalizedGalleryContent = isGalleryPage
      ? normalizeGalleryPageSections(selectedPage.sections)
      : cloneGalleryPageSections();
    const normalizedHomeSections = isHomePage
      ? normalizeHomePageSections(selectedPage.sections)
      : cloneHomePageSections();

    setGalleryContent(normalizedGalleryContent);
    setHomeSections(normalizedHomeSections);

    setForm({
      title: selectedPage.title,
      headline:
        selectedPage.headline ||
        (isGalleryPage ? DEFAULT_GALLERY_PAGE_HEADLINE : ''),
      subheadline:
        selectedPage.subheadline ||
        (isGalleryPage ? DEFAULT_GALLERY_PAGE_SUBHEADLINE : ''),
      body:
        selectedPage.body ||
        (isGalleryPage ? DEFAULT_GALLERY_PAGE_BODY : ''),
      status: selectedPage.status,
      publishedAt: toDatetimeLocal(selectedPage.publishedAt),
      heroImageId: selectedPage.heroImageId || '',
      mediaLinks: isGalleryPage
        ? normalizeMediaLinks(buildGalleryMediaLinks(normalizedGalleryContent))
        : isHomePage
          ? normalizeMediaLinks(
              (selectedPage.mediaLinks || [])
                .filter((link) => !isHomeAnnouncementFieldKey(link.fieldKey || ''))
                .map((link) => ({
                  mediaId: link.mediaId,
                  fieldKey: link.fieldKey || 'content',
                }))
            )
        : normalizeMediaLinks(
            (selectedPage.mediaLinks || []).map((link) => ({
              mediaId: link.mediaId,
              fieldKey: link.fieldKey || 'content',
            }))
          ),
    });
  }, [selectedPage]);

  function buildPagePayload(next: {
    mediaLinks?: FormMediaLink[];
    heroImageId?: string | null;
    sections?: unknown;
  } = {}) {
    const isGalleryPage = selectedPage?.slug === 'galerie';
    const isHomePage = isHomePageRecord(selectedPage || {});
    const nextSections =
      next.sections !== undefined
        ? next.sections
        : isGalleryPage
          ? galleryContent
          : isHomePage
            ? homeSections
          : selectedPage?.sections;
    const normalizedMediaLinks = (
      isGalleryPage
        ? buildGalleryMediaLinks(normalizeGalleryPageSections(nextSections))
        : isHomePage
          ? [
              ...normalizeMediaLinks(next.mediaLinks ?? form.mediaLinks),
              ...buildHomeAnnouncementMediaLinks(normalizeHomePageSections(nextSections)),
            ]
        : normalizeMediaLinks(next.mediaLinks ?? form.mediaLinks)
    ).filter((link) => nonSystemMedia.some((item) => item.id === link.mediaId));

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
      sections: nextSections,
      mediaLinks: normalizedMediaLinks,
    };
  }

  async function savePage() {
    setMessage(null);

    if (!selectedId) {
      setMessage('Bitte zuerst eine Seite wählen.');
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

  async function persistPageState(next: {
    mediaLinks?: FormMediaLink[];
    heroImageId?: string | null;
    sections?: unknown;
  }) {
    if (!selectedPage) return false;

    const response = await fetch(`/api/admin/pages/${selectedPage.id}`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(buildPagePayload(next)),
    });

    const result = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) {
      setMessage(result?.error || 'Seitenmedien konnten nicht aktualisiert werden.');
      return false;
    }

    return true;
  }

  function updateGallerySection(
    sectionKey: GallerySectionKey,
    updater: (section: GalleryPageSections['sections'][number]) => GalleryPageSections['sections'][number]
  ) {
    setGalleryContent((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.key === sectionKey ? updater(section) : section
      ),
    }));
  }

  function updateHomeAnnouncementSection(
    updater: (section: HomePageSections['announcementSection']) => HomePageSections['announcementSection']
  ) {
    setHomeSections((prev) => ({
      ...prev,
      announcementSection: updater(prev.announcementSection),
    }));
  }

  function updateHomeAnnouncementItem(
    itemId: string,
    updater: (item: HomeAnnouncementItem) => HomeAnnouncementItem
  ) {
    updateHomeAnnouncementSection((section) => ({
      ...section,
      items: section.items.map((item) => (item.id === itemId ? updater(item) : item)),
    }));
  }

  async function removeMediaAssetById(mediaId: string) {
    const response = await fetch(`/api/admin/media/${mediaId}`, {
      method: 'DELETE',
    });
    const result = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      throw new Error(result?.error || 'Datei konnte nicht gelöscht werden.');
    }
  }

  async function uploadHomeAnnouncementMedia(itemId: string, file: File) {
    if (!selectedPage || selectedPage.slug !== 'home') return;

    const item = homeSections.announcementSection.items.find((entry) => entry.id === itemId);
    if (!item) {
      setMessage('Ankündigung nicht gefunden.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setMessage('Für Ankündigungen sind nur Bilder erlaubt.');
      return;
    }

    const formData = new FormData();
    formData.set('file', file);
    if (item.altText.trim()) {
      formData.set('altText', item.altText.trim());
    }

    setUploading(true);
    setMessage(null);

    try {
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
      const previousMediaId = item.mediaId || null;
      const nextHomeSections = {
        ...homeSections,
        announcementSection: {
          ...homeSections.announcementSection,
          items: homeSections.announcementSection.items.map((entry) =>
            entry.id === itemId
              ? {
                  ...entry,
                  mediaId: uploadedItem.id,
                  altText: entry.altText || uploadedItem.altText || '',
                }
              : entry
          ),
        },
      };

      const saved = await persistPageState({
        sections: nextHomeSections,
      });

      if (!saved) return;

      if (previousMediaId && previousMediaId !== uploadedItem.id) {
        await removeMediaAssetById(previousMediaId).catch((error) => {
          console.error(error);
        });
      }

      setHomeSections(nextHomeSections);
      setMedia((prev) => [uploadedItem, ...prev.filter((entry) => entry.id !== uploadedItem.id && entry.id !== previousMediaId)]);
      await loadData();
      setMessage('Ankündigungsbild erfolgreich aktualisiert.');
    } finally {
      setUploading(false);
    }
  }

  async function removeHomeAnnouncementMedia(itemId: string) {
    if (!selectedPage || selectedPage.slug !== 'home') return;

    const item = homeSections.announcementSection.items.find((entry) => entry.id === itemId);
    if (!item?.mediaId) return;

    setUploading(true);
    setMessage(null);

    try {
      const nextHomeSections = {
        ...homeSections,
        announcementSection: {
          ...homeSections.announcementSection,
          items: homeSections.announcementSection.items.map((entry) =>
            entry.id === itemId
              ? {
                  ...entry,
                  mediaId: null,
                }
              : entry
          ),
        },
      };

      const saved = await persistPageState({
        sections: nextHomeSections,
      });

      if (!saved) return;

      await removeMediaAssetById(item.mediaId);
      setHomeSections(nextHomeSections);
      setMedia((prev) => prev.filter((entry) => entry.id !== item.mediaId));
      await loadData();
      setMessage('Ankündigungsbild entfernt.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Ankündigungsbild konnte nicht entfernt werden.');
    } finally {
      setUploading(false);
    }
  }

  async function deleteHomeAnnouncementItem(itemId: string) {
    if (!selectedPage || selectedPage.slug !== 'home') return;

    const item = homeSections.announcementSection.items.find((entry) => entry.id === itemId);
    if (!item) return;

    const nextHomeSections = {
      ...homeSections,
      announcementSection: {
        ...homeSections.announcementSection,
        items: homeSections.announcementSection.items.filter((entry) => entry.id !== itemId),
      },
    };

    setUploading(true);
    setMessage(null);

    try {
      const saved = await persistPageState({
        sections: nextHomeSections,
      });

      if (!saved) return;

      if (item.mediaId) {
        await removeMediaAssetById(item.mediaId);
      }

      setHomeSections(nextHomeSections);
      if (item.mediaId) {
        setMedia((prev) => prev.filter((entry) => entry.id !== item.mediaId));
      }
      await loadData();
      setMessage('Ankündigung entfernt.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Ankündigung konnte nicht entfernt werden.');
    } finally {
      setUploading(false);
    }
  }

  async function uploadAndAttachMedia(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!selectedPage) {
      setMessage('Bitte zuerst eine Seite wählen.');
      return;
    }

    const target = uploadTargets.find((item) => item.key === uploadTargetKey);
    if (!target) {
      setMessage('Bitte Bereich für den Upload auswählen.');
      return;
    }

    const formData = new FormData(event.currentTarget);
    const file = formData.get('file');

    if (!(file instanceof File)) {
      setMessage('Bitte Datei auswählen.');
      return;
    }

    if (!canUploadForTarget(target.key, file)) {
      setMessage(
        target.key === 'video_showcase'
          ? 'Fuer Video Showcase sind nur Videos erlaubt.'
          : target.key === 'fish_showcase'
            ? 'Fuer Fish Showcase sind nur Bilder erlaubt.'
            : 'Dateityp für diesen Bereich nicht erlaubt.'
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
	      if (selectedPage.slug === 'galerie' && isGallerySectionKey(target.key)) {
	        const nextGalleryContent = {
	          ...galleryContent,
	          sections: galleryContent.sections.map((section) =>
	            section.key === target.key
	              ? {
	                  ...section,
	                  images: [
	                    ...section.images,
	                    {
	                      id: createGalleryImageId(target.key),
	                      mediaId: uploadedItem.id,
	                      altText: uploadedItem.altText || '',
	                      caption: '',
	                    },
	                  ],
	                }
	              : section
	          ),
	        };
	        const linked = await persistPageState({
	          sections: nextGalleryContent,
	        });
	        if (!linked) {
	          setMessage('Datei hochgeladen, aber Verknuepfung zur Galerie fehlgeschlagen. Bitte erneut speichern.');
	          return;
	        }

	        setGalleryContent(nextGalleryContent);
	        setMedia((prev) => [uploadedItem, ...prev]);
	        setForm((prev) => ({
	          ...prev,
	          mediaLinks: normalizeMediaLinks(buildGalleryMediaLinks(nextGalleryContent)),
	        }));
	        event.currentTarget.reset();
	        await loadData();
	        setMessage(`Datei hochgeladen und zu "${target.label}" hinzugefuegt.`);
	        return;
	      }

	      const nextLinks = upsertMediaLink(form.mediaLinks, {
	        mediaId: uploadedItem.id,
	        fieldKey: target.key,
	      });

	      const linked = await persistPageState({
	        mediaLinks: nextLinks,
	      });
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
      const nextSections =
        selectedPage.slug === 'galerie'
          ? {
              ...galleryContent,
              sections: galleryContent.sections.map((section) => ({
                ...section,
                images: section.images.filter((image) => !image.mediaId || !idsToRemove.has(image.mediaId)),
              })),
            }
          : undefined;

      const unlinked = await persistPageState({
        mediaLinks: nextLinks,
        heroImageId: nextHeroImageId,
        sections: nextSections,
      });
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
      if (nextSections) {
        setGalleryContent(nextSections);
      }
      await loadData();
      setMessage('Medium erfolgreich aus Seite, Blob und Datenbank entfernt.');
    } finally {
      setDeletingMediaId(null);
    }
  }

  async function deleteGalleryImage(sectionKey: GallerySectionKey, imageId: string, mediaId?: string) {
    if (mediaId) {
      await deleteLinkedMedia(mediaId);
      return;
    }

    const nextGalleryContent = {
      ...galleryContent,
      sections: galleryContent.sections.map((section) =>
        section.key === sectionKey
          ? {
              ...section,
              images: section.images.filter((image) => image.id !== imageId),
            }
          : section
      ),
    };

    const saved = await persistPageState({
      sections: nextGalleryContent,
    });

    if (!saved) return;

    setGalleryContent(nextGalleryContent);
    setForm((prev) => ({
      ...prev,
      mediaLinks: normalizeMediaLinks(buildGalleryMediaLinks(nextGalleryContent)),
    }));
    await loadData();
    setMessage('Bild aus dem Galerie-Bereich entfernt.');
  }

  function renderGallerySectionEditor(sectionKey: GallerySectionKey) {
    const section = galleryContent.sections.find((item) => item.key === sectionKey);
    if (!section) return null;

    const items: GalleryDisplayMediaItem[] = section.images
      .map((image) => {
        const mediaItem = image.mediaId ? mediaById.get(image.mediaId) || null : null;
        const previewSrc = mediaItem ? `/api/admin/media/${mediaItem.id}/preview` : image.url || '';

        if (!previewSrc) return null;

        return {
          id: image.id,
          mediaId: image.mediaId,
          url: image.url,
          fieldKey: section.key,
          previewSrc,
          title: mediaItem?.filename || image.url || image.id,
          altText: image.altText || mediaItem?.altText || '',
          caption: image.caption,
          mediaType: mediaItem?.mediaType || MediaType.IMAGE,
          isStatic: !image.mediaId,
        };
      })
      .filter(Boolean) as GalleryDisplayMediaItem[];

    return (
      <section key={section.key} className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Bereichstitel</span>
            <input
              value={section.title}
              onChange={(event) =>
                updateGallerySection(section.key, (current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">CTA Text</span>
            <input
              value={section.ctaLabel}
              onChange={(event) =>
                updateGallerySection(section.key, (current) => ({
                  ...current,
                  ctaLabel: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block space-y-1 md:col-span-2">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Beschreibung</span>
            <textarea
              value={section.description}
              onChange={(event) =>
                updateGallerySection(section.key, (current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              className="h-28 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block space-y-1 md:col-span-2">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">CTA URL</span>
            <input
              value={section.ctaHref}
              onChange={(event) =>
                updateGallerySection(section.key, (current) => ({
                  ...current,
                  ctaHref: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
        </div>

        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/15 bg-black/30 px-3 py-4 text-sm text-accent-300">
            Noch keine Bilder in diesem Bereich.
          </p>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {items.map((item) => {
              const isDeleting = deletingMediaId === item.mediaId;

              return (
                <article key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-black/35">
                  <div className="relative aspect-video overflow-hidden bg-black/60">
                    <Image
                      src={item.previewSrc}
                      alt={item.altText || item.title}
                      fill
                      sizes="(max-width: 1280px) 100vw, 40vw"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => void deleteGalleryImage(section.key, item.id, item.mediaId)}
                      disabled={Boolean(item.mediaId) && isDeleting}
                      className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-400/50 bg-red-500/90 text-white transition hover:bg-red-500 disabled:opacity-70"
                      aria-label={`Bild ${item.title} loeschen`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="space-y-3 px-3 py-3">
                    <div className="space-y-1">
                      <p className="line-clamp-1 text-sm font-semibold text-white">{item.title}</p>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-accent-300">
                        {getSectionLabel(section.key)} {item.isStatic ? '• Statisch' : '• Media Library'}
                      </p>
                    </div>

                    <label className="block space-y-1">
                      <span className="text-[11px] uppercase tracking-[0.16em] text-accent-300">Caption</span>
                      <textarea
                        value={item.caption}
                        onChange={(event) =>
                          updateGallerySection(section.key, (current) => ({
                            ...current,
                            images: current.images.map((image) =>
                              image.id === item.id
                                ? {
                                    ...image,
                                    caption: event.target.value,
                                  }
                                : image
                            ),
                          }))
                        }
                        className="h-24 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                      />
                    </label>

                    <label className="block space-y-1">
                      <span className="text-[11px] uppercase tracking-[0.16em] text-accent-300">Alt-Text</span>
                      <input
                        value={item.altText}
                        onChange={(event) =>
                          updateGallerySection(section.key, (current) => ({
                            ...current,
                            images: current.images.map((image) =>
                              image.id === item.id
                                ? {
                                    ...image,
                                    altText: event.target.value,
                                  }
                                : image
                            ),
                          }))
                        }
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                      />
                    </label>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    );
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
          previewType:
            mediaItem!.mediaType === MediaType.VIDEO && poster ? MediaType.IMAGE : mediaItem!.mediaType,
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
                    {entry.previewType === MediaType.IMAGE ? (
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

  function renderHomeAnnouncementEditor() {
    const items: HomeAnnouncementDisplayItem[] = homeSections.announcementSection.items.map((item) => ({
      ...item,
      media: item.mediaId ? mediaById.get(item.mediaId) || null : null,
    }));

    return (
      <section className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-accent-300">Premium Ankündigungen</p>
            <p className="mt-1 text-xs text-accent-400">
              Dieser Bereich erscheint auf der Startseite zwischen Hero und Kulinarische Highlights.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              updateHomeAnnouncementSection((section) => ({
                ...section,
                items: [
                  ...section.items,
                  {
                    id: createHomeAnnouncementId(),
                    label: '',
                    title: '',
                    body: '',
                    ctaLabel: '',
                    ctaHref: '',
                    isEnabled: true,
                    mediaId: null,
                    altText: '',
                  },
                ],
              }))
            }
            className="rounded-full border border-primary-400/40 bg-primary-500/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-primary-100"
          >
            Ankündigung hinzufügen
          </button>
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white">
          <input
            type="checkbox"
            checked={homeSections.announcementSection.isEnabled}
            onChange={(event) =>
              updateHomeAnnouncementSection((section) => ({
                ...section,
                isEnabled: event.target.checked,
              }))
            }
            className="h-4 w-4 rounded border-white/20 bg-black/40"
          />
          <span>Ankündigungsbereich auf der Startseite anzeigen</span>
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Eyebrow</span>
            <input
              value={homeSections.announcementSection.eyebrow}
              onChange={(event) =>
                updateHomeAnnouncementSection((section) => ({
                  ...section,
                  eyebrow: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Sektionstitel</span>
            <input
              value={homeSections.announcementSection.title}
              onChange={(event) =>
                updateHomeAnnouncementSection((section) => ({
                  ...section,
                  title: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block space-y-1 md:col-span-2">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Einleitung</span>
            <textarea
              value={homeSections.announcementSection.description}
              onChange={(event) =>
                updateHomeAnnouncementSection((section) => ({
                  ...section,
                  description: event.target.value,
                }))
              }
              className="h-24 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
        </div>

        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/15 bg-black/30 px-3 py-4 text-sm text-accent-300">
            Noch keine Ankündigungen angelegt.
          </p>
        ) : (
          <div className="space-y-5">
            {items.map((item, index) => (
              <article key={item.id} className="rounded-[1.8rem] border border-white/10 bg-black/30 p-4">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-accent-300">Ankündigung {index + 1}</p>
                    <p className="mt-1 text-sm text-accent-400">
                      Premium-Card mit Bild, Text und optionalem CTA.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void deleteHomeAnnouncementItem(item.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-400/40 bg-red-500/15 text-red-100"
                    aria-label={`Ankündigung ${index + 1} löschen`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
                  <div className="space-y-3">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/50">
                      {item.media ? (
                        <Image
                          src={`/api/admin/media/${item.media.id}/preview`}
                          alt={item.altText || item.media.altText || item.title || item.media.filename}
                          fill
                          sizes="(max-width: 1280px) 100vw, 30vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-accent-400">
                          Noch kein Ankündigungsbild hochgeladen.
                        </div>
                      )}
                    </div>

                    <label className="block space-y-1">
                      <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Bild ersetzen</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          void uploadHomeAnnouncementMedia(item.id, file);
                          event.currentTarget.value = '';
                        }}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                      />
                    </label>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => void removeHomeAnnouncementMedia(item.id)}
                        disabled={!item.mediaId}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Bild entfernen
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white">
                      <input
                        type="checkbox"
                        checked={item.isEnabled}
                        onChange={(event) =>
                          updateHomeAnnouncementItem(item.id, (current) => ({
                            ...current,
                            isEnabled: event.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-white/20 bg-black/40"
                      />
                      <span>Diese Ankündigung anzeigen</span>
                    </label>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="block space-y-1">
                        <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Label</span>
                        <input
                          value={item.label}
                          onChange={(event) =>
                            updateHomeAnnouncementItem(item.id, (current) => ({
                              ...current,
                              label: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                        />
                      </label>
                      <label className="block space-y-1">
                        <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Alt-Text</span>
                        <input
                          value={item.altText}
                          onChange={(event) =>
                            updateHomeAnnouncementItem(item.id, (current) => ({
                              ...current,
                              altText: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                        />
                      </label>
                      <label className="block space-y-1 md:col-span-2">
                        <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Titel</span>
                        <input
                          value={item.title}
                          onChange={(event) =>
                            updateHomeAnnouncementItem(item.id, (current) => ({
                              ...current,
                              title: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                        />
                      </label>
                      <label className="block space-y-1 md:col-span-2">
                        <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Text</span>
                        <textarea
                          value={item.body}
                          onChange={(event) =>
                            updateHomeAnnouncementItem(item.id, (current) => ({
                              ...current,
                              body: event.target.value,
                            }))
                          }
                          className="h-28 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                        />
                      </label>
                      <label className="block space-y-1">
                        <span className="text-xs uppercase tracking-[0.16em] text-accent-300">CTA Text</span>
                        <input
                          value={item.ctaLabel}
                          onChange={(event) =>
                            updateHomeAnnouncementItem(item.id, (current) => ({
                              ...current,
                              ctaLabel: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                        />
                      </label>
                      <label className="block space-y-1">
                        <span className="text-xs uppercase tracking-[0.16em] text-accent-300">CTA URL</span>
                        <input
                          value={item.ctaHref}
                          onChange={(event) =>
                            updateHomeAnnouncementItem(item.id, (current) => ({
                              ...current,
                              ctaHref: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    );
  }

  const isGalleryPage = selectedPage?.slug === 'galerie';
  const isHomePage = isHomePageRecord(selectedPage || {});

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
                  {isHomePageRecord(page)
                    ? 'Startseite'
                    : MANAGED_PAGE_LABELS[page.slug as (typeof MANAGED_PAGE_SLUGS)[number]] || page.title}
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
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">
              {isGalleryPage ? 'Seitenheadline' : 'Headline'}
            </span>
            <input
              value={form.headline}
              onChange={(event) => setForm((prev) => ({ ...prev, headline: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">
              {isGalleryPage ? 'Einleitung unter der Headline' : 'Subheadline'}
            </span>
            <input
              value={form.subheadline}
              onChange={(event) => setForm((prev) => ({ ...prev, subheadline: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
        </div>

        <label className="block space-y-1">
          <span className="text-xs uppercase tracking-[0.16em] text-accent-300">
            {isGalleryPage ? 'Einleitungstext der Galerie' : 'Textinhalt'}
          </span>
          <textarea
            value={form.body}
            onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
            className="h-40 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
          {isGalleryPage ? (
            <p className="text-xs text-accent-400">
              Abschnitte mit Leerzeile trennen. Dieser Text erscheint im linken Einleitungsblock der Galerie.
            </p>
          ) : null}
        </label>

        {isGalleryPage ? (
          <>
            <section className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-accent-300">Galerie Einleitungsblock</p>
                <p className="mt-1 text-xs text-accent-400">
                  Inhalte für die obere Infobox rechts neben dem Einleitungstext.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-1">
                  <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Eyebrow</span>
                  <input
                    value={galleryContent.introEyebrow}
                    onChange={(event) =>
                      setGalleryContent((prev) => ({ ...prev, introEyebrow: event.target.value }))
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Box Titel</span>
                  <input
                    value={galleryContent.introTitle}
                    onChange={(event) =>
                      setGalleryContent((prev) => ({ ...prev, introTitle: event.target.value }))
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                  />
                </label>
                <label className="block space-y-1 md:col-span-2">
                  <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Audience Titel</span>
                  <input
                    value={galleryContent.audienceTitle}
                    onChange={(event) =>
                      setGalleryContent((prev) => ({ ...prev, audienceTitle: event.target.value }))
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                  />
                </label>
                <label className="block space-y-1 md:col-span-2">
                  <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Audience Punkte</span>
                  <textarea
                    value={galleryContent.audienceItems.join('\n')}
                    onChange={(event) =>
                      setGalleryContent((prev) => ({
                        ...prev,
                        audienceItems: event.target.value
                          .split('\n')
                          .map((item) => item.trim())
                          .filter(Boolean),
                      }))
                    }
                    className="h-28 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Primaere CTA</span>
                  <input
                    value={galleryContent.primaryCtaLabel}
                    onChange={(event) =>
                      setGalleryContent((prev) => ({ ...prev, primaryCtaLabel: event.target.value }))
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Primaere CTA URL</span>
                  <input
                    value={galleryContent.primaryCtaHref}
                    onChange={(event) =>
                      setGalleryContent((prev) => ({ ...prev, primaryCtaHref: event.target.value }))
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Sekundaere CTA</span>
                  <input
                    value={galleryContent.secondaryCtaLabel}
                    onChange={(event) =>
                      setGalleryContent((prev) => ({ ...prev, secondaryCtaLabel: event.target.value }))
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Sekundaere CTA URL</span>
                  <input
                    value={galleryContent.secondaryCtaHref}
                    onChange={(event) =>
                      setGalleryContent((prev) => ({ ...prev, secondaryCtaHref: event.target.value }))
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                  />
                </label>
              </div>
            </section>

            <div className="space-y-4">
              {GALLERY_SECTION_KEYS.map((sectionKey) => renderGallerySectionEditor(sectionKey))}
            </div>
          </>
        ) : null}

        {isHomePage ? renderHomeAnnouncementEditor() : null}

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

        {isHomePage ? (
          <div className="space-y-4">
            {renderMediaSection('fish_showcase', 'Fish Showcase', 'Nur Bilder für diesen Homepage-Bereich.')}
            {renderMediaSection('video_showcase', 'Video Showcase', 'Nur Videos für diesen Homepage-Bereich.')}
          </div>
        ) : isGalleryPage ? (
          <div className="space-y-4">
            <p className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-accent-300">
              Galerie-Bilder sind oben pro Bereich zugeordnet. Caption und Alt-Text lassen sich direkt an jedem Bild bearbeiten.
            </p>
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
