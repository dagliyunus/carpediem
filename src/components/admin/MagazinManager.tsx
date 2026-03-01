'use client';

import { ContentStatus, MediaType } from '@prisma/client';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  AdminMultiMediaPicker,
  AdminSingleMediaPicker,
  type PickerMediaItem,
} from '@/components/admin/MediaPicker';
import {
  BAD_SAAROW_TIPPS_CATEGORY_SLUG,
  LOCATION_FOCUS_SUGGESTIONS,
  MAGAZIN_CATEGORY_DEFINITIONS,
} from '@/lib/cms/magazin';

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
  status: ContentStatus;
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
  status: ContentStatus;
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

  const isBadSaarowTipps = articleForm.primaryCategorySlug === BAD_SAAROW_TIPPS_CATEGORY_SLUG;

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
    if (!selectedArticleId) return;
    if (!window.confirm('Beitrag wirklich loeschen?')) return;

    const response = await fetch(`/api/admin/articles/${selectedArticleId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(result?.error || 'Loeschen fehlgeschlagen.');
      return;
    }

    setSelectedArticleId(null);
    setArticleForm(emptyArticleForm);
    await loadData();
    setMessage('Beitrag geloescht.');
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[280px_280px_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-white">Kategorien</h3>
          </div>
          <div className="space-y-2">
            {loading ? (
              <p className="text-sm text-accent-300">Lade Kategorien ...</p>
            ) : (
              categories.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(item.id)}
                  className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                    selectedCategoryId === item.id
                      ? 'border-primary-400/50 bg-primary-500/15 text-primary-100'
                      : 'border-white/10 bg-black/20 text-white/80 hover:border-white/20'
                  }`}
                >
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-accent-300">{item.slug}</p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-white">Beitraege</h3>
            <button
              type="button"
              onClick={() => {
                setSelectedArticleId(null);
                setArticleForm(emptyArticleForm);
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
                  onClick={() => setSelectedArticleId(item.id)}
                  className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                    selectedArticleId === item.id
                      ? 'border-primary-400/50 bg-primary-500/15 text-primary-100'
                      : 'border-white/10 bg-black/20 text-white/80 hover:border-white/20'
                  }`}
                >
                  <p className="line-clamp-1 text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-accent-300">
                    {item.categories[0]?.category.name || 'Ohne Kategorie'} · {item.status}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <section className="space-y-4 rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">Category Intro Block</h3>
                <p className="text-sm text-accent-300">
                  SEO-Landingpage-Inhalt fuer {selectedCategory?.name || 'die Kategorie'}.
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm text-white/90">
                <input
                  type="checkbox"
                  checked={categoryForm.introIsEnabled}
                  onChange={(event) =>
                    setCategoryForm((prev) => ({ ...prev, introIsEnabled: event.target.checked }))
                  }
                />
                Aktiv
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1 sm:col-span-2">
                <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Intro Headline</span>
                <input
                  value={categoryForm.introHeadline}
                  onChange={(event) =>
                    setCategoryForm((prev) => ({ ...prev, introHeadline: event.target.value }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                />
              </label>

              <label className="block space-y-1 sm:col-span-2">
                <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Intro Content</span>
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

            <AdminSingleMediaPicker
              label="Intro Medium"
              hint="Optionales Bild oder Video aus der bestehenden Media Library."
              items={mediaItems}
              selectedId={categoryForm.introMediaId}
              onSelect={(id) => setCategoryForm((prev) => ({ ...prev, introMediaId: id }))}
              acceptedTypes={[MediaType.IMAGE, MediaType.VIDEO]}
            />

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void saveCategory()}
                disabled={savingCategory || !selectedCategoryId}
                className="rounded-full bg-primary-600 px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white disabled:opacity-60"
              >
                {savingCategory ? 'Speichere ...' : 'Kategorie speichern'}
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Beitrag bearbeiten</h3>
              <p className="text-sm text-accent-300">
                Ein Beitrag hat genau eine Hauptkategorie. SEO-Overrides bleiben optional.
              </p>
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
                <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Veroeffentlichen am</span>
                <input
                  type="datetime-local"
                  value={articleForm.publishedAt}
                  onChange={(event) => setArticleForm((prev) => ({ ...prev, publishedAt: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Planen fuer</span>
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
                  Wird nur fuer Bad Saarow Tipps angezeigt und in SEO-Defaults genutzt, solange keine manuellen Werte gesetzt sind.
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

            <AdminSingleMediaPicker
              label="Cover Medium"
              hint="Published posts brauchen ein Cover mit gepflegtem Alt-Text in der Media Library."
              items={mediaItems}
              selectedId={articleForm.coverImageId}
              onSelect={(id) => setArticleForm((prev) => ({ ...prev, coverImageId: id }))}
              acceptedTypes={[MediaType.IMAGE]}
            />

            <AdminMultiMediaPicker
              label="Galerie / Video"
              hint="Optionale Zusatzmedien fuer den Beitrag."
              items={mediaItems}
              selectedIds={articleForm.galleryMediaIds}
              onToggle={(id) =>
                setArticleForm((prev) => ({
                  ...prev,
                  galleryMediaIds: prev.galleryMediaIds.includes(id)
                    ? prev.galleryMediaIds.filter((item) => item !== id)
                    : [...prev.galleryMediaIds, id],
                }))
              }
              acceptedTypes={[MediaType.IMAGE, MediaType.VIDEO]}
            />

            <section className="space-y-4 rounded-3xl border border-white/10 bg-black/20 p-4">
              <div>
                <h4 className="text-base font-semibold text-white">SEO Overrides</h4>
                <p className="text-sm text-accent-300">
                  Leer lassen, damit die Magazin-Defaults und Local-SEO-Regeln greifen.
                </p>
              </div>

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
          </section>
        </div>
      </div>
    </div>
  );
}
