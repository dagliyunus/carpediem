import { type ArticleCategory, type MediaAsset, type SeoMeta } from '@prisma/client';
import { siteConfig } from '@/config/siteConfig';
import { getPublicMediaUrl } from '@/lib/cms/public-media';

type CategoryMap = {
  category: Pick<ArticleCategory, 'name' | 'slug'>;
};

type TagMap = {
  tag: {
    name: string;
    slug: string;
  };
};

type AuthorLike = {
  name: string;
};

type SeoWithImage = SeoMeta & {
  ogImage?: Pick<MediaAsset, 'id' | 'url' | 'altText'> | null;
};

type DateInput = Date | string | null | undefined;

type PostLike = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  locationFocus: string | null;
  eventStartAt: Date | string | null;
  eventEndAt: Date | string | null;
  eventVenue: string | null;
  eventUrl: string | null;
  publishedAt: Date | string | null;
  updatedAt: Date | string;
  coverImage?: Pick<MediaAsset, 'id' | 'url' | 'altText'> | null;
  categories: CategoryMap[];
  tags: TagMap[];
  author?: AuthorLike | null;
  seo?: SeoWithImage | null;
};

function parseDate(input: DateInput) {
  if (!input) return null;

  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

function clampText(input: string, maxLength: number) {
  const normalized = input.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;

  const slice = normalized.slice(0, maxLength);
  const boundary = slice.lastIndexOf(' ');

  return `${(boundary > maxLength * 0.6 ? slice.slice(0, boundary) : slice).trimEnd()}...`;
}

function formatPublishedDate(date: DateInput) {
  const parsedDate = parseDate(date);

  if (!parsedDate) return null;

  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'long',
    timeZone: 'Europe/Berlin',
  }).format(parsedDate);
}

function buildDefaultMagazinTitle(post: PostLike, primaryCategory: ReturnType<typeof getPrimaryCategory>) {
  if (primaryCategory?.slug === 'bad-saarow-tipps' && post.locationFocus) {
    return `${post.title} | ${post.locationFocus} in Bad Saarow`;
  }

  if (primaryCategory?.slug === 'events-live-musik') {
    return `${post.title} | Live-Musik in Bad Saarow`;
  }

  if (primaryCategory?.slug === 'gerichte-zutaten') {
    return `${post.title} | Mediterrane Küche in Bad Saarow`;
  }

  return `${post.title} | Carpe Diem Bad Saarow`;
}

function buildDefaultMagazinDescription(post: PostLike, primaryCategory: ReturnType<typeof getPrimaryCategory>) {
  const excerpt = createMagazinExcerpt(post.content, post.excerpt, 150);
  const publishedDate = formatPublishedDate(post.publishedAt);

  if (primaryCategory?.slug === 'bad-saarow-tipps') {
    const locationLine = post.locationFocus
      ? `Fokus: ${post.locationFocus} in Bad Saarow.`
      : 'Lokal eingeordnet für einen entspannten Aufenthalt in Bad Saarow.';
    return clampText([excerpt, locationLine].filter(Boolean).join(' '), 180);
  }

  if (primaryCategory?.slug === 'events-live-musik') {
    return clampText(
      [excerpt, publishedDate ? `Veröffentlicht am ${publishedDate}.` : null, 'Mehr über Atmosphäre, Live-Musik und Abende im Carpe Diem Bad Saarow.']
        .filter(Boolean)
        .join(' '),
      180
    );
  }

  if (primaryCategory?.slug === 'gerichte-zutaten') {
    return clampText(
      [excerpt, 'Einblick in mediterrane Küche, saisonale Zutaten und den Restaurantalltag im Carpe Diem Bad Saarow.']
        .filter(Boolean)
        .join(' '),
      180
    );
  }

  return clampText(
    [excerpt, publishedDate ? `Veröffentlicht am ${publishedDate}.` : null, 'Magazinbeitrag aus dem Carpe Diem Bad Saarow mit lokalem Restaurantbezug.']
      .filter(Boolean)
      .join(' '),
    180
  );
}

export function buildGeneratedMagazinPostSeo(post: PostLike) {
  const primaryCategory = getPrimaryCategory(post);
  const canonical = `${siteConfig.seo.domain}/magazin/${post.slug}`;
  const ogImage =
    (post.coverImage ? `${siteConfig.seo.domain}${getPublicMediaUrl(post.coverImage.id, post.coverImage.url)}` : null) ||
    `${siteConfig.seo.domain}/images/outside_night.webp`;
  const title = buildDefaultMagazinTitle(post, primaryCategory);
  const description = buildDefaultMagazinDescription(post, primaryCategory);

  return {
    title,
    description,
    canonical,
    ogTitle: title,
    ogDescription: description,
    ogImage,
    ogImageAlt: post.coverImage?.altText || post.title,
  };
}

export function stripRichText(input: string) {
  return input
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/[*_`>#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function createMagazinExcerpt(content: string, fallback?: string | null, maxLength = 180) {
  const source = fallback?.trim() || stripRichText(content);
  if (!source) return '';
  if (source.length <= maxLength) return source;
  return `${source.slice(0, maxLength).trimEnd()}...`;
}

export function getPrimaryCategory(post: Pick<PostLike, 'categories'>) {
  return post.categories[0]?.category || null;
}

export function buildMagazinPostSeo(post: PostLike) {
  const generated = buildGeneratedMagazinPostSeo(post);
  const title = post.seo?.title?.trim() || generated.title;
  const description = post.seo?.description?.trim() || generated.description;

  return {
    title,
    description,
    canonical: post.seo?.canonicalUrl?.trim() || generated.canonical,
    ogTitle: post.seo?.openGraphTitle?.trim() || title,
    ogDescription: post.seo?.openGraphDescription?.trim() || description,
    ogImage: post.seo?.ogImage?.url || generated.ogImage,
    ogImageAlt: post.seo?.ogImage?.altText || generated.ogImageAlt,
  };
}

export function buildBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildArticleSchema(post: PostLike) {
  const seo = buildMagazinPostSeo(post);
  const primaryCategory = getPrimaryCategory(post);
  const publishedDate = formatPublishedDate(post.publishedAt);
  const keywords = Array.from(
    new Set([
      ...(post.tags || []).map((tag) => tag.tag.name),
      primaryCategory?.name,
      post.locationFocus || undefined,
      'Bad Saarow',
      'Carpe Diem',
    ].filter(Boolean) as string[])
  );

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: seo.description,
    inLanguage: 'de-DE',
    datePublished: parseDate(post.publishedAt)?.toISOString(),
    dateModified: parseDate(post.updatedAt)?.toISOString(),
    mainEntityOfPage: seo.canonical,
    image: [seo.ogImage],
    articleSection: primaryCategory?.name || 'Magazin',
    keywords,
    wordCount: stripRichText(post.content).split(/\s+/).filter(Boolean).length,
    isAccessibleForFree: true,
    author: post.author
      ? {
          '@type': 'Person',
          name: post.author.name,
        }
      : undefined,
    about: post.locationFocus
      ? [
          {
            '@type': 'Place',
            name: post.locationFocus,
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Bad Saarow',
              addressRegion: 'Brandenburg',
              addressCountry: 'DE',
            },
          },
        ]
      : undefined,
    publisher: {
      '@type': 'Restaurant',
      name: siteConfig.name,
      url: siteConfig.seo.domain,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.seo.domain}/images/icons/favicon-logo.png`,
      },
    },
    alternativeHeadline: publishedDate ? `Veröffentlicht am ${publishedDate}` : undefined,
  };
}

export function buildEventSchema(post: PostLike) {
  const primaryCategory = getPrimaryCategory(post);
  if (primaryCategory?.slug !== 'events-live-musik' || !post.eventStartAt) {
    return null;
  }

  const seo = buildMagazinPostSeo(post);

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: post.title,
    description: seo.description,
    startDate: parseDate(post.eventStartAt)?.toISOString(),
    endDate: parseDate(post.eventEndAt)?.toISOString(),
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    image: [seo.ogImage],
    url: post.eventUrl || seo.canonical,
    location: {
      '@type': 'Place',
      name: post.eventVenue || siteConfig.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Am Kurpark 6',
        addressLocality: 'Bad Saarow',
        postalCode: '15526',
        addressRegion: 'Brandenburg',
        addressCountry: 'DE',
      },
    },
    organizer: {
      '@type': 'Restaurant',
      name: siteConfig.name,
      url: siteConfig.seo.domain,
    },
  };
}
