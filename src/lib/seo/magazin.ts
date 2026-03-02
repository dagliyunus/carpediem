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

type SeoWithImage = SeoMeta & {
  ogImage?: Pick<MediaAsset, 'id' | 'url' | 'altText'> | null;
};

type PostLike = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  locationFocus: string | null;
  eventStartAt: Date | null;
  eventEndAt: Date | null;
  eventVenue: string | null;
  eventUrl: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
  coverImage?: Pick<MediaAsset, 'id' | 'url' | 'altText'> | null;
  categories: CategoryMap[];
  tags: TagMap[];
  seo?: SeoWithImage | null;
};

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
  const primaryCategory = getPrimaryCategory(post);
  const defaultTitle =
    primaryCategory?.slug === 'bad-saarow-tipps' && post.locationFocus
      ? `${post.title} - ${post.locationFocus} | Carpe Diem Bad Saarow`
      : `${post.title} | Carpe Diem Bad Saarow`;
  const defaultDescription =
    primaryCategory?.slug === 'bad-saarow-tipps' && post.locationFocus
      ? `${post.title} mit Fokus auf ${post.locationFocus} in Bad Saarow: Tipps für Essen, Trinken und lokale Erlebnisse vor oder nach Ihrem Besuch im Carpe Diem.`
      : createMagazinExcerpt(post.content, post.excerpt) ||
        'Magazinbeitrag aus dem Carpe Diem Bad Saarow mit lokalem Restaurantbezug.';
  const canonical = post.seo?.canonicalUrl?.trim() || `${siteConfig.seo.domain}/magazin/${post.slug}`;
  const ogImage =
    post.seo?.ogImage?.url ||
    (post.coverImage ? `${siteConfig.seo.domain}${getPublicMediaUrl(post.coverImage.id, post.coverImage.url)}` : null) ||
    `${siteConfig.seo.domain}/images/outside_night.webp`;
  const title = post.seo?.title?.trim() || defaultTitle;
  const description = post.seo?.description?.trim() || defaultDescription;

  return {
    title,
    description,
    canonical,
    ogTitle: post.seo?.openGraphTitle?.trim() || title,
    ogDescription: post.seo?.openGraphDescription?.trim() || description,
    ogImage,
    ogImageAlt: post.seo?.ogImage?.altText || post.coverImage?.altText || post.title,
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
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: seo.canonical,
    image: [seo.ogImage],
    articleSection: primaryCategory?.name || 'Magazin',
    keywords,
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
    },
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
    startDate: post.eventStartAt.toISOString(),
    endDate: post.eventEndAt?.toISOString(),
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
