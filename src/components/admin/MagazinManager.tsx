'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { ContentStatus, MediaType, type ContentStatus as ContentStatusValue } from '@/lib/client/prisma-enums';
import {
  AdminSingleMediaPicker,
  type PickerMediaItem,
} from '@/components/admin/MediaPicker';
import {
  BAD_SAAROW_TIPPS_CATEGORY_SLUG,
  LOCATION_FOCUS_SUGGESTIONS,
  MAGAZIN_CATEGORY_DEFINITIONS,
} from '@/lib/magazin/shared';

type MediaItem = PickerMediaItem;

type SeoItem = {
  title?: string | null;
  description?: string | null;
  canonicalUrl?: string | null;
  openGraphTitle?: string | null;
  openGraphDescription?: string | null;
  ogImageId?: string | null;
  ogImage?: MediaItem | null;
};

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  introHeadline: string | null;
  introContent: string | null;
  introMediaId: string | null;
  introMedia?: MediaItem | null;
  introPrimaryCtaLabel: string | null;
  introPrimaryCtaHref: string | null;
  introSecondaryCtaLabel: string | null;
  introSecondaryCtaHref: string | null;
  introIsEnabled: boolean;
};

type ArticleItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  status: ContentStatusValue;
  publishedAt: string | null;
  scheduledAt: string | null;
  locationFocus: string | null;
  eventStartAt: string | null;
  eventEndAt: string | null;
  eventVenue: string | null;
  eventUrl: string | null;
  coverImageId: string | null;
  coverImage?: MediaItem | null;
  categories: Array<{ category: { id: string; name: string; slug: string } }>;
  tags: Array<{ tag: { name: string } }>;
  mediaLinks: Array<{
    mediaId: string;
    fieldKey: string;
    media?: MediaItem | null;
  }>;
  seo?: SeoItem | null;
};

type CategoryFormState = {
  introHeadline: string;
  introContent: string;
  introMediaId: string;
  introPrimaryCtaLabel: string;
  introPrimaryCtaHref: string;
  introSecondaryCtaLabel: string;
  introSecondaryCtaHref: string;
  introIsEnabled: boolean;
};

type ArticleFormState = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: ContentStatusValue;
  publishedAt: string;
  scheduledAt: string;
  primaryCategorySlug: string;
  tags: string;
  locationFocus: string;
  eventStartAt: string;
  eventEndAt: string;
  eventVenue: string;
  eventUrl: string;
  coverImageId: string;
  galleryMediaIds: string[];
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImageId: string;
};

const emptyCategoryForm: CategoryFormState = {
  introHeadline: '',
  introContent: '',
  introMediaId: '',
  introPrimaryCtaLabel: '',
  introPrimaryCtaHref: '',
  introSecondaryCtaLabel: '',
  introSecondaryCtaHref: '',
  introIsEnabled: false,
};

const emptyArticleForm: ArticleFormState = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  status: ContentStatus.DRAFT,
  publishedAt: '',
  scheduledAt: '',
  primaryCategorySlug: MAGAZIN_CATEGORY_DEFINITIONS[0].slug,
  tags: '',
  locationFocus: '',
  eventStartAt: '',
  eventEndAt: '',
  eventVenue: '',
  eventUrl: '',
  coverImageId: '',
  galleryMediaIds: [],
  metaTitle: '',
  metaDescription: '',
  canonicalUrl: '',
  ogTitle: '',
  ogDescription: '',
  ogImageId: '',
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

function slugifyPreview(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180);
}

function createSeoExcerpt(content: string, fallback?: string, maxLength = 180) {
  const source = (fallback || content)
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/[*_`>#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!source) return '';
  if (source.length <= maxLength) return source;
  return `${source.slice(0, maxLength).trimEnd()}...`;
}

function buildSeoPreview(input: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  locationFocus: string;
  isBadSaarowTipps: boolean;
  manualTitle: string;
  manualDescription: string;
  manualCanonical: string;
  manualOgTitle: string;
  manualOgDescription: string;
}) {
  const fallbackSlug = slugifyPreview(input.slug || input.title) || 'beitrag';
  const defaultTitle =
    input.isBadSaarowTipps && input.locationFocus.trim()
      ? `${input.title || 'Magazinbeitrag'} - ${input.locationFocus.trim()} | Carpe Diem Bad Saarow`
      : `${input.title || 'Magazinbeitrag'} | Carpe Diem Bad Saarow`;
  const defaultDescription =
    input.isBadSaarowTipps && input.locationFocus.trim()
      ? `${input.title || 'Magazinbeitrag'} mit Fokus auf ${input.locationFocus.trim()} in Bad Saarow: Tipps für Essen, Trinken und lokale Erlebnisse vor oder nach Ihrem Besuch im Carpe Diem.`
      : createSeoExcerpt(input.content, input.excerpt) ||
        'Magazinbeitrag aus dem Carpe Diem Bad Saarow mit lokalem Restaurantbezug.';
  const canonical = input.manualCanonical.trim() || `https://www.carpediem-badsaarow.de/magazin/${fallbackSlug}`;
  const title = input.manualTitle.trim() || defaultTitle;
  const description = input.manualDescription.trim() || defaultDescription;

  return {
    title,
    description,
    canonical,
    ogTitle: input.manualOgTitle.trim() || title,
    ogDescription: input.manualOgDescription.trim() || description,
  };
}

export function MagazinManager() {
  const [items, setItems] = useState<ArticleItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [articleForm, setArticleForm] = useState<ArticleFormState>(emptyArticleForm);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm);
  const [loading, setLoading] = useState(true);
  const [savingArticle, setSavingArticle] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showCategoryEditor, setShowCategoryEditor] = useState(false);
  const [showSeoOverrides, setShowSeoOverrides] = useState(false);
  const [coverUploadAltText, setCoverUploadAltText] = useState('');
  const [introUploadAltText, setIntroUploadAltText] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingIntroMedia, setUploadingIntroMedia] = useState(false);
  const [coverUploadInputKey, setCoverUploadInputKey] = useState(0);
  const [introUploadInputKey, setIntroUploadInputKey] = useState(0);
  const editorRef = useRef<HTMLDivElement | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const [articleRes, categoryRes, mediaRes] = await Promise.all([
        fetch('/api/admin/articles', { cache: 'no-store' }),
        fetch('/api/admin/article-categories', { cache: 'no-store' }),
        fetch('/api/admin/media', { cache: 'no-store' }),
      ]);

      const articleData = (await articleRes.json()) as { items: ArticleItem[] };
      const categoryData = (await categoryRes.json()) as { items: CategoryItem[] };
      const mediaData = (await mediaRes.json()) as { items: MediaItem[] };

      setItems(articleData.items || []);
      setCategories(categoryData.items || []);
      setMediaItems(mediaData.items || []);
      setSelectedCategoryId((current) => current || categoryData.items?.[0]?.id || null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const selectedArticle = useMemo(
    () => items.find((item) => item.id === selectedArticleId) || null,
    [items, selectedArticleId]
  );

  const selectedCategory = useMemo(
    () => categories.find((item) => item.id === selectedCategoryId) || null,
    [categories, selectedCategoryId]
  );

  useEffect(() => {
    if (!selectedArticle) {
      setArticleForm(emptyArticleForm);
      return;
    }

    setArticleForm({
      title: selectedArticle.title,
      slug: selectedArticle.slug,
      excerpt: selectedArticle.excerpt || '',
      content: selectedArticle.content,
      status: selectedArticle.status,
      publishedAt: toDatetimeLocal(selectedArticle.publishedAt),
      scheduledAt: toDatetimeLocal(selectedArticle.scheduledAt),
      primaryCategorySlug: selectedArticle.categories[0]?.category.slug || MAGAZIN_CATEGORY_DEFINITIONS[0].slug,
      tags: selectedArticle.tags.map((item) => item.tag.name).join(', '),
      locationFocus: selectedArticle.locationFocus || '',
      eventStartAt: toDatetimeLocal(selectedArticle.eventStartAt),
      eventEndAt: toDatetimeLocal(selectedArticle.eventEndAt),
      eventVenue: selectedArticle.eventVenue || '',
      eventUrl: selectedArticle.eventUrl || '',
      coverImageId: selectedArticle.coverImageId || '',
      galleryMediaIds: selectedArticle.mediaLinks
        .filter((item) => item.fieldKey === 'gallery')
        .map((item) => item.mediaId),
      metaTitle: selectedArticle.seo?.title || '',
      metaDescription: selectedArticle.seo?.description || '',
      canonicalUrl: selectedArticle.seo?.canonicalUrl || '',
      ogTitle: selectedArticle.seo?.openGraphTitle || '',
      ogDescription: selectedArticle.seo?.openGraphDescription || '',
      ogImageId: selectedArticle.seo?.ogImageId || '',
    });
  }, [selectedArticle]);

  useEffect(() => {
    if (!selectedCategory) {
      setCategoryForm(emptyCategoryForm);
      return;
    }

    setCategoryForm({
      introHeadline: selectedCategory.introHeadline || '',
      introContent: selectedCategory.introContent || '',
      introMediaId: selectedCategory.introMediaId || '',
      introPrimaryCtaLabel: selectedCategory.introPrimaryCtaLabel || '',
      introPrimaryCtaHref: selectedCategory.introPrimaryCtaHref || '',
      introSecondaryCtaLabel: selectedCategory.introSecondaryCtaLabel || '',
      introSecondaryCtaHref: selectedCategory.introSecondaryCtaHref || '',
      introIsEnabled: selectedCategory.introIsEnabled,
    });
  }, [selectedCategory]);

  const selectedCover = useMemo(
    () => mediaItems.find((item) => item.id === articleForm.coverImageId) || selectedArticle?.coverImage || null,
    [articleForm.coverImageId, mediaItems, selectedArticle]
  );

  const selectedOgImage = useMemo(
    () => mediaItems.find((item) => item.id === articleForm.ogImageId) || selectedArticle?.seo?.ogImage || null,
    [articleForm.ogImageId, mediaItems, selectedArticle]
  );
  const selectedIntroMedia = useMemo(
    () => mediaItems.find((item) => item.id === categoryForm.introMediaId) || selectedCategory?.introMedia || null,
    [categoryForm.introMediaId, mediaItems, selectedCategory]
  );

  const isBadSaarowTipps = articleForm.primaryCategorySlug === BAD_SAAROW_TIPPS_CATEGORY_SLUG;
  const selectedArticleCategory = useMemo(
    () => categories.find((item) => item.slug === articleForm.primaryCategorySlug) || null,
    [articleForm.primaryCategorySlug, categories]
  );
  const seoPreview = useMemo(
    () =>
      buildSeoPreview({
        title: articleForm.title,
        slug: articleForm.slug,
        excerpt: articleForm.excerpt,
        content: articleForm.content,
        locationFocus: articleForm.locationFocus,
        isBadSaarowTipps,
        manualTitle: articleForm.metaTitle,
        manualDescription: articleForm.metaDescription,
        manualCanonical: articleForm.canonicalUrl,
        manualOgTitle: articleForm.ogTitle,
        manualOgDescription: articleForm.ogDescription,
      }),
    [articleForm, isBadSaarowTipps]
  );

  function startCreatePost() {
    setSelectedArticleId(null);
    setArticleForm({
      ...emptyArticleForm,
      primaryCategorySlug: categories[0]?.slug || emptyArticleForm.primaryCategorySlug,
    });
    setShowCategoryEditor(false);
    setShowSeoOverrides(false);
    setMessage(null);
  }

  useEffect(() => {
    if (!editorRef.current) return;
    if (typeof window === 'undefined') return;
    if (window.innerWidth >= 1024) return;

    editorRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [selectedArticleId]);

  async function uploadMediaAsset(input: {
    file: File;
    altText: string;
    acceptedTypes: ContentStatusValue[] | MediaType[];
  }) {
    const allowed = input.acceptedTypes as string[];
    const isImage = input.file.type.startsWith('image/');
    const isVideo = input.file.type.startsWith('video/');
    const mediaType =
      isImage ? MediaType.IMAGE : isVideo ? MediaType.VIDEO : null;

    if (!mediaType || !allowed.includes(mediaType)) {
      throw new Error('Dateityp für diesen Bereich nicht erlaubt.');
    }

    const formData = new FormData();
    formData.set('file', input.file);

    if (input.altText.trim()) {
      formData.set('altText', input.altText.trim());
    }

    const response = await fetch('/api/admin/media', {
      method: 'POST',
      body: formData,
    });

    const result = (await response.json().catch(() => null)) as { item?: MediaItem; error?: string } | null;

    if (!response.ok || !result?.item) {
      throw new Error(result?.error || 'Upload fehlgeschlagen.');
    }

    setMediaItems((prev) => [result.item!, ...prev]);
    return result.item;
  }

  async function handleCoverUpload(file: File | null) {
    if (!file) return;
    setUploadingCover(true);
    setMessage(null);

    try {
      const item = await uploadMediaAsset({
        file,
        altText: coverUploadAltText,
        acceptedTypes: [MediaType.IMAGE],
      });

      setArticleForm((prev) => ({ ...prev, coverImageId: item.id }));
      setCoverUploadAltText('');
      setCoverUploadInputKey((prev) => prev + 1);
      setMessage('Cover hochgeladen.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Cover-Upload fehlgeschlagen.');
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleIntroMediaUpload(file: File | null) {
    if (!file) return;
    setUploadingIntroMedia(true);
    setMessage(null);

    try {
      const item = await uploadMediaAsset({
        file,
        altText: introUploadAltText,
        acceptedTypes: [MediaType.IMAGE, MediaType.VIDEO],
      });

      setCategoryForm((prev) => ({ ...prev, introMediaId: item.id }));
      setIntroUploadAltText('');
      setIntroUploadInputKey((prev) => prev + 1);
      setMessage('Intro-Medium hochgeladen.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Intro-Upload fehlgeschlagen.');
    } finally {
      setUploadingIntroMedia(false);
    }
  }

  async function saveArticle() {
    setSavingArticle(true);
    setMessage(null);

    const payload = {
      title: articleForm.title,
      slug: articleForm.slug,
      excerpt: articleForm.excerpt,
      content: articleForm.content,
      status: articleForm.status,
      publishedAt: fromDatetimeLocal(articleForm.publishedAt),
      scheduledAt: fromDatetimeLocal(articleForm.scheduledAt),
      primaryCategorySlug: articleForm.primaryCategorySlug,
      tagNames: articleForm.tags
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
      coverImageId: articleForm.coverImageId || null,
      mediaLinks: articleForm.galleryMediaIds.map((mediaId) => ({
        mediaId,
        fieldKey: 'gallery',
      })),
      locationFocus: isBadSaarowTipps ? articleForm.locationFocus : null,
      eventStartAt: fromDatetimeLocal(articleForm.eventStartAt),
      eventEndAt: fromDatetimeLocal(articleForm.eventEndAt),
      eventVenue: articleForm.eventVenue || null,
      eventUrl: articleForm.eventUrl || null,
      metaTitle: articleForm.metaTitle || null,
      metaDescription: articleForm.metaDescription || null,
      canonicalUrl: articleForm.canonicalUrl || null,
      ogTitle: articleForm.ogTitle || null,
      ogDescription: articleForm.ogDescription || null,
      ogImageId: articleForm.ogImageId || null,
    };

    try {
      const isUpdate = Boolean(selectedArticleId);
      const response = await fetch(isUpdate ? `/api/admin/articles/${selectedArticleId}` : '/api/admin/articles', {
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

      if (!selectedArticleId && result?.item?.id) {
        setSelectedArticleId(result.item.id);
      }

      setMessage('Beitrag gespeichert.');
    } finally {
      setSavingArticle(false);
    }
  }

  async function saveCategory() {
    if (!selectedCategoryId) return;
    setSavingCategory(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/article-categories/${selectedCategoryId}`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          introHeadline: categoryForm.introHeadline || null,
          introContent: categoryForm.introContent || null,
          introMediaId: categoryForm.introMediaId || null,
          introPrimaryCtaLabel: categoryForm.introPrimaryCtaLabel || null,
          introPrimaryCtaHref: categoryForm.introPrimaryCtaHref || null,
          introSecondaryCtaLabel: categoryForm.introSecondaryCtaLabel || null,
          introSecondaryCtaHref: categoryForm.introSecondaryCtaHref || null,
          introIsEnabled: categoryForm.introIsEnabled,
        }),
      });

      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setMessage(result?.error || 'Kategorie konnte nicht gespeichert werden.');
        return;
      }

      await loadData();
      setMessage('Kategorie gespeichert.');
    } finally {
      setSavingCategory(false);
    }
  }

  async function deleteArticle() {
    const articleId = selectedArticleId;
    if (!articleId) return;

    await deleteArticleById(articleId);
  }

  async function deleteArticleById(articleId: string) {
    if (!window.confirm('Beitrag wirklich loeschen?')) return;

    const response = await fetch(`/api/admin/articles/${articleId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(result?.error || 'Loeschen fehlgeschlagen.');
      return;
    }

    if (selectedArticleId === articleId) {
      setSelectedArticleId(null);
      setArticleForm({
        ...emptyArticleForm,
        primaryCategorySlug: categories[0]?.slug || emptyArticleForm.primaryCategorySlug,
      });
    }
    await loadData();
    setMessage('Beitrag geloescht.');
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-[340px_1fr]">
        <aside className="order-2 space-y-6 md:order-1">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">Magazin-Beitraege</h3>
                <p className="text-sm text-accent-300">Posts erstellen, bearbeiten oder loeschen.</p>
              </div>
              <button
                type="button"
                onClick={startCreatePost}
                className="rounded-full bg-primary-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white"
              >
                Create Post
              </button>
            </div>

            <div className="space-y-3">
              {loading ? (
                <p className="text-sm text-accent-300">Lade Beitraege ...</p>
              ) : items.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-accent-300">
                  Noch keine Magazin-Beitraege vorhanden.
                </p>
              ) : (
                items.map((item) => (
                  <article
                    key={item.id}
                    className={`rounded-2xl border px-4 py-4 transition ${
                      selectedArticleId === item.id
                        ? 'border-primary-400/50 bg-primary-500/15'
                        : 'border-white/10 bg-black/20'
                    }`}
                  >
                    <div className="space-y-2">
                      <p className="line-clamp-2 text-sm font-semibold text-white">{item.title}</p>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-accent-300">
                        <span>{item.categories[0]?.category.name || 'Ohne Kategorie'}</span>
                        <span>•</span>
                        <span>{item.status}</span>
                        <span>•</span>
                        <span>
                          {item.publishedAt
                            ? new Date(item.publishedAt).toLocaleDateString('de-DE')
                            : 'Entwurf'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedArticleId(item.id);
                          setShowCategoryEditor(false);
                          setShowSeoOverrides(false);
                          setMessage(null);
                        }}
                        className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/90"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteArticleById(item.id)}
                        className="rounded-full border border-red-500/35 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <button
              type="button"
              onClick={() => setShowCategoryEditor((prev) => !prev)}
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <div>
                <h3 className="font-semibold text-white">Kategorie-Landingpages</h3>
                <p className="text-sm text-accent-300">
                  Intro-Block für {selectedCategory?.name || 'die ausgewählte Kategorie'} verwalten.
                </p>
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary-300">
                {showCategoryEditor ? 'Schliessen' : 'Bearbeiten'}
              </span>
            </button>

            {showCategoryEditor ? (
              <div className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-1 sm:col-span-2">
                    <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Kategorie</span>
                    <select
                      value={selectedCategoryId || ''}
                      onChange={(event) => setSelectedCategoryId(event.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                    >
                      {categories.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={categoryForm.introIsEnabled}
                      onChange={(event) =>
                        setCategoryForm((prev) => ({ ...prev, introIsEnabled: event.target.checked }))
                      }
                    />
                    Landingpage-Intro aktivieren
                  </label>

                  <label className="block space-y-1 sm:col-span-2">
                    <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Headline</span>
                    <input
                      value={categoryForm.introHeadline}
                      onChange={(event) =>
                        setCategoryForm((prev) => ({ ...prev, introHeadline: event.target.value }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                    />
                  </label>

                  <label className="block space-y-1 sm:col-span-2">
                    <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Content</span>
                    <textarea
                      value={categoryForm.introContent}
                      onChange={(event) =>
                        setCategoryForm((prev) => ({ ...prev, introContent: event.target.value }))
                      }
                      className="h-32 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Primaere CTA</span>
                    <input
                      value={categoryForm.introPrimaryCtaLabel}
                      onChange={(event) =>
                        setCategoryForm((prev) => ({ ...prev, introPrimaryCtaLabel: event.target.value }))
                      }
                      placeholder="Jetzt reservieren"
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Primaere CTA URL</span>
                    <input
                      value={categoryForm.introPrimaryCtaHref}
                      onChange={(event) =>
                        setCategoryForm((prev) => ({ ...prev, introPrimaryCtaHref: event.target.value }))
                      }
                      placeholder="/reservieren"
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Sekundaere CTA</span>
                    <input
                      value={categoryForm.introSecondaryCtaLabel}
                      onChange={(event) =>
                        setCategoryForm((prev) => ({ ...prev, introSecondaryCtaLabel: event.target.value }))
                      }
                      placeholder="Kontakt"
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Sekundaere CTA URL</span>
                    <input
                      value={categoryForm.introSecondaryCtaHref}
                      onChange={(event) =>
                        setCategoryForm((prev) => ({ ...prev, introSecondaryCtaHref: event.target.value }))
                      }
                      placeholder="/kontakt"
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                    />
                  </label>
                </div>

                <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-accent-300">Intro Medium</p>
                    <p className="mt-1 text-xs text-accent-400">
                      Einfach Bild oder Video für diese Kategorie hochladen. Die gesamte Media Library wird hier nicht angezeigt.
                    </p>
                  </div>

                  {selectedIntroMedia ? (
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/25">
                      <div className="relative aspect-[16/9] bg-black/40">
                        {selectedIntroMedia.mediaType === MediaType.VIDEO ? (
                          <video
                            src={`/api/admin/media/${selectedIntroMedia.id}/preview`}
                            controls
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Image
                            src={`/api/admin/media/${selectedIntroMedia.id}/preview`}
                            alt={selectedIntroMedia.altText || selectedIntroMedia.filename}
                            fill
                            sizes="(max-width: 1024px) 100vw, 40vw"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="space-y-1 px-3 py-2">
                        <p className="text-sm font-semibold text-white">{selectedIntroMedia.filename}</p>
                        <p className="text-[11px] text-accent-300">
                          Alt-Text: {selectedIntroMedia.altText || 'fehlt'}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  <input
                    key={introUploadInputKey}
                    type="file"
                    accept="image/*,video/*"
                    onChange={(event) => void handleIntroMediaUpload(event.target.files?.[0] || null)}
                    disabled={uploadingIntroMedia}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                  />
                  <input
                    value={introUploadAltText}
                    onChange={(event) => setIntroUploadAltText(event.target.value)}
                    placeholder="Alt-Text für Intro Medium"
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                  />
                  {categoryForm.introMediaId ? (
                    <button
                      type="button"
                      onClick={() => setCategoryForm((prev) => ({ ...prev, introMediaId: '' }))}
                      className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/90"
                    >
                      Intro Medium entfernen
                    </button>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void saveCategory()}
                    disabled={savingCategory || !selectedCategoryId}
                    className="rounded-full bg-primary-600 px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white disabled:opacity-60"
                  >
                    {savingCategory ? 'Speichere ...' : 'Landingpage speichern'}
                  </button>
                  {selectedCategory ? (
                    <Link
                      href={`/magazin/kategorie/${selectedCategory.slug}`}
                      target="_blank"
                      className="rounded-full border border-white/15 px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/90"
                    >
                      Kategorie ansehen
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </aside>

        <div
          ref={editorRef}
          className="order-1 scroll-mt-28 space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:order-2"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {selectedArticleId ? 'Post bearbeiten' : 'Neuen Post erstellen'}
              </h3>
              <p className="text-sm text-accent-300">
                SEO wird automatisch aus Titel, Kategorie, Inhalt und Location Focus erzeugt.
              </p>
            </div>
            {selectedArticleCategory ? (
              <span className="rounded-full border border-primary-500/35 bg-primary-500/12 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary-100">
                {selectedArticleCategory.name}
              </span>
            ) : null}
          </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Titel</span>
                <input
                  value={articleForm.title}
                  onChange={(event) => setArticleForm((prev) => ({ ...prev, title: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Slug</span>
                <input
                  value={articleForm.slug}
                  onChange={(event) => setArticleForm((prev) => ({ ...prev, slug: event.target.value }))}
                  placeholder="optional"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Kurzbeschreibung</span>
              <textarea
                value={articleForm.excerpt}
                onChange={(event) => setArticleForm((prev) => ({ ...prev, excerpt: event.target.value }))}
                className="h-24 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              />
              <p className="text-[11px] text-accent-400">Published posts brauchen mindestens 80 Zeichen.</p>
            </label>

            <label className="block space-y-1">
              <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Inhalt</span>
              <textarea
                value={articleForm.content}
                onChange={(event) => setArticleForm((prev) => ({ ...prev, content: event.target.value }))}
                className="h-64 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              />
              <p className="text-[11px] text-accent-400">Markdown-aehnliche Ueberschriften mit # und ## werden auf der Seite erkannt.</p>
            </label>

            <div className="grid gap-4 sm:grid-cols-4">
              <label className="block space-y-1">
                <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Status</span>
                <select
                  value={articleForm.status}
                  onChange={(event) =>
                    setArticleForm((prev) => ({ ...prev, status: event.target.value as ContentStatus }))
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
                <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Kategorie</span>
                <select
                  value={articleForm.primaryCategorySlug}
                  onChange={(event) =>
                    setArticleForm((prev) => ({ ...prev, primaryCategorySlug: event.target.value }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                >
                  {categories.map((item) => (
                    <option key={item.id} value={item.slug}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1">
                <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Veröffentlichen am</span>
                <input
                  type="datetime-local"
                  value={articleForm.publishedAt}
                  onChange={(event) => setArticleForm((prev) => ({ ...prev, publishedAt: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Planen für</span>
                <input
                  type="datetime-local"
                  value={articleForm.scheduledAt}
                  onChange={(event) => setArticleForm((prev) => ({ ...prev, scheduledAt: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Tags (Komma)</span>
              <input
                value={articleForm.tags}
                onChange={(event) => setArticleForm((prev) => ({ ...prev, tags: event.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                placeholder="bad saarow, restaurant, lokal"
              />
            </label>

            {isBadSaarowTipps ? (
              <label className="block space-y-1">
                <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Location Focus</span>
                <input
                  list="location-focus-suggestions"
                  value={articleForm.locationFocus}
                  onChange={(event) =>
                    setArticleForm((prev) => ({ ...prev, locationFocus: event.target.value }))
                  }
                  placeholder="z. B. Saarow Therme"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                />
                <datalist id="location-focus-suggestions">
                  {LOCATION_FOCUS_SUGGESTIONS.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
                <p className="text-[11px] text-accent-400">
                  Wird nur für Bad Saarow Tipps angezeigt und in SEO-Defaults genutzt, solange keine manuellen Werte gesetzt sind.
                </p>
              </label>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Event Start (optional)</span>
                <input
                  type="datetime-local"
                  value={articleForm.eventStartAt}
                  onChange={(event) => setArticleForm((prev) => ({ ...prev, eventStartAt: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Event Ende (optional)</span>
                <input
                  type="datetime-local"
                  value={articleForm.eventEndAt}
                  onChange={(event) => setArticleForm((prev) => ({ ...prev, eventEndAt: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Event Ort</span>
                <input
                  value={articleForm.eventVenue}
                  onChange={(event) => setArticleForm((prev) => ({ ...prev, eventVenue: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Event URL</span>
                <input
                  value={articleForm.eventUrl}
                  onChange={(event) => setArticleForm((prev) => ({ ...prev, eventUrl: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                />
              </label>
            </div>

            {selectedCover ? (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/25">
                <div className="relative aspect-[16/9] bg-black/40">
                  {selectedCover.mediaType === MediaType.IMAGE ? (
                    <Image
                      src={`/api/admin/media/${selectedCover.id}/preview`}
                      alt={selectedCover.altText || selectedCover.filename}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover"
                    />
                  ) : (
                    <video src={`/api/admin/media/${selectedCover.id}/preview`} controls className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="space-y-1 px-3 py-2">
                  <p className="text-sm font-semibold text-white">{selectedCover.filename}</p>
                  <p className="text-[11px] text-accent-300">Alt-Text: {selectedCover.altText || 'fehlt'}</p>
                </div>
              </div>
            ) : null}

            <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-accent-300">Cover Medium</p>
                <p className="mt-1 text-xs text-accent-400">
                  Laden Sie direkt das Coverbild für diesen Beitrag hoch. Die gesamte Media Library wird hier nicht angezeigt.
                </p>
              </div>

              <input
                key={coverUploadInputKey}
                type="file"
                accept="image/*"
                onChange={(event) => void handleCoverUpload(event.target.files?.[0] || null)}
                disabled={uploadingCover}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              />
              <input
                value={coverUploadAltText}
                onChange={(event) => setCoverUploadAltText(event.target.value)}
                placeholder="Alt-Text für Coverbild"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              />
              {articleForm.coverImageId ? (
                <button
                  type="button"
                  onClick={() => setArticleForm((prev) => ({ ...prev, coverImageId: '' }))}
                  className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/90"
                >
                  Cover entfernen
                </button>
              ) : null}
            </div>

            <section className="space-y-4 rounded-3xl border border-white/10 bg-black/20 p-4">
              <div>
                <h4 className="text-base font-semibold text-white">Automatische SEO-Vorschau</h4>
                <p className="text-sm text-accent-300">
                  Diese Werte nutzt das System automatisch, solange keine manuellen Overrides gesetzt sind.
                </p>
              </div>

              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:col-span-2">
                  <dt className="text-[11px] uppercase tracking-[0.16em] text-accent-300">Meta Title</dt>
                  <dd className="text-sm text-white">{seoPreview.title}</dd>
                </div>
                <div className="space-y-1 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:col-span-2">
                  <dt className="text-[11px] uppercase tracking-[0.16em] text-accent-300">Meta Description</dt>
                  <dd className="text-sm leading-relaxed text-white">{seoPreview.description}</dd>
                </div>
                <div className="space-y-1 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:col-span-2">
                  <dt className="text-[11px] uppercase tracking-[0.16em] text-accent-300">Canonical</dt>
                  <dd className="break-all text-sm text-white">{seoPreview.canonical}</dd>
                </div>
                <div className="space-y-1 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <dt className="text-[11px] uppercase tracking-[0.16em] text-accent-300">OG Title</dt>
                  <dd className="text-sm text-white">{seoPreview.ogTitle}</dd>
                </div>
                <div className="space-y-1 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <dt className="text-[11px] uppercase tracking-[0.16em] text-accent-300">OG Description</dt>
                  <dd className="text-sm text-white">{seoPreview.ogDescription}</dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={() => setShowSeoOverrides((prev) => !prev)}
                className="text-xs font-bold uppercase tracking-[0.16em] text-primary-300"
              >
                {showSeoOverrides ? 'Manuelle SEO-Overrides ausblenden' : 'Manuelle SEO-Overrides anzeigen'}
              </button>

              {showSeoOverrides ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block space-y-1">
                      <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Meta Title</span>
                      <input
                        value={articleForm.metaTitle}
                        onChange={(event) => setArticleForm((prev) => ({ ...prev, metaTitle: event.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                      />
                    </label>
                    <label className="block space-y-1">
                      <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Canonical URL</span>
                      <input
                        value={articleForm.canonicalUrl}
                        onChange={(event) => setArticleForm((prev) => ({ ...prev, canonicalUrl: event.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                      />
                    </label>
                    <label className="block space-y-1 sm:col-span-2">
                      <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Meta Description</span>
                      <textarea
                        value={articleForm.metaDescription}
                        onChange={(event) =>
                          setArticleForm((prev) => ({ ...prev, metaDescription: event.target.value }))
                        }
                        className="h-24 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                      />
                    </label>
                    <label className="block space-y-1">
                      <span className="text-xs uppercase tracking-[0.16em] text-accent-300">OG Title</span>
                      <input
                        value={articleForm.ogTitle}
                        onChange={(event) => setArticleForm((prev) => ({ ...prev, ogTitle: event.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                      />
                    </label>
                    <label className="block space-y-1">
                      <span className="text-xs uppercase tracking-[0.16em] text-accent-300">OG Description</span>
                      <textarea
                        value={articleForm.ogDescription}
                        onChange={(event) =>
                          setArticleForm((prev) => ({ ...prev, ogDescription: event.target.value }))
                        }
                        className="h-24 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                      />
                    </label>
                  </div>

                  {selectedOgImage ? (
                    <p className="text-xs text-accent-300">
                      OG Bild: <span className="font-semibold text-white">{selectedOgImage.filename}</span>
                    </p>
                  ) : null}

                  <AdminSingleMediaPicker
                    label="OG Bild"
                    hint="Optionales Open-Graph-Bild."
                    items={mediaItems}
                    selectedId={articleForm.ogImageId}
                    onSelect={(id) => setArticleForm((prev) => ({ ...prev, ogImageId: id }))}
                    acceptedTypes={[MediaType.IMAGE]}
                  />
                </div>
              ) : null}
            </section>

            {message ? (
              <p className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-accent-100">{message}</p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void saveArticle()}
                disabled={savingArticle}
                className="rounded-full bg-primary-600 px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white"
              >
                {savingArticle ? 'Speichere ...' : 'Beitrag speichern'}
              </button>
              {selectedArticleId ? (
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
    </div>
  );
}
