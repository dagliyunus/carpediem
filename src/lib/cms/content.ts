import { AiChannel, ContentStatus, Prisma, SeoTargetType, SocialPlatform } from '@prisma/client';
import { db } from '@/lib/db';
import {
  ensureMagazinCategories,
  getDefaultMagazinCategory,
  getMagazinCategoryDefinitionByName,
  getMagazinCategoryDefinitionBySlug,
  inferMagazinCategory,
  isBadSaarowTippsCategory,
} from '@/lib/cms/magazin';

const WORDS_PER_MINUTE = 220;
const TAG_LIMIT = 8;
const PUBLISHED_EXCERPT_MIN = 80;
const PUBLISHED_CONTENT_MIN = 900;

const STOP_WORDS = new Set([
  'a',
  'ab',
  'aber',
  'als',
  'am',
  'an',
  'auch',
  'auf',
  'aus',
  'bei',
  'ben',
  'bis',
  'carpe',
  'das',
  'de',
  'dem',
  'den',
  'der',
  'des',
  'diem',
  'die',
  'ein',
  'eine',
  'einem',
  'einen',
  'einer',
  'es',
  'for',
  'fuer',
  'fur',
  'im',
  'in',
  'ist',
  'mit',
  'nach',
  'oder',
  'of',
  'on',
  'the',
  'to',
  'und',
  'unser',
  'unsere',
  'von',
  'vor',
  'wie',
  'wir',
  'you',
  'zum',
  'zur',
]);

const PHRASE_TAG_RULES: Array<{ pattern: RegExp; tag: string }> = [
  { pattern: /\bbad\s*saarow\b/, tag: 'bad saarow' },
  { pattern: /\bcarpe\s*diem\b/, tag: 'carpe diem' },
  { pattern: /\bmediterran\w*\b/, tag: 'mediterran' },
  { pattern: /\blive\s*musik\b/, tag: 'live musik' },
  { pattern: /\bfisch\b/, tag: 'fisch' },
  { pattern: /\bgrill\w*\b/, tag: 'grill' },
];

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function estimateReadTimeMinutes(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export type UpsertArticleInput = {
  id?: string;
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  status: ContentStatus;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  coverImageId?: string | null;
  authorId?: string | null;
  primaryCategorySlug?: string | null;
  primaryCategoryName?: string | null;
  categoryNames?: string[];
  tagNames?: string[];
  mediaIds?: string[];
  mediaLinks?: Array<{
    mediaId: string;
    fieldKey?: string;
  }>;
  locationFocus?: string | null;
  eventStartAt?: string | null;
  eventEndAt?: string | null;
  eventVenue?: string | null;
  eventUrl?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageId?: string | null;
};

function normalizeUniqueList(values: string[] | undefined) {
  if (!values) return [];

  return Array.from(
    new Set(
      values
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => item.slice(0, 80))
    )
  );
}

function normalizeText(input: string) {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(input: string) {
  return normalizeText(input)
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length >= 3)
    .filter((token) => !STOP_WORDS.has(token))
    .filter((token) => !/^\d+$/.test(token));
}

function inferArticleTaxonomy(input: {
  title: string;
  excerpt?: string | null;
  content: string;
}) {
  const normalizedTitle = normalizeText(input.title);
  const normalizedExcerpt = normalizeText(input.excerpt || '');
  const normalizedContent = normalizeText(input.content);
  const merged = `${normalizedTitle} ${normalizedExcerpt} ${normalizedContent}`.trim();

  const tokenWeights = new Map<string, number>();
  const addWeightedTokens = (tokens: string[], weight: number) => {
    for (const token of tokens) {
      tokenWeights.set(token, (tokenWeights.get(token) || 0) + weight);
    }
  };

  addWeightedTokens(tokenize(input.title), 3);
  addWeightedTokens(tokenize(input.excerpt || ''), 2);
  addWeightedTokens(tokenize(input.content), 1);

  const inferredCategory = inferMagazinCategory(input);

  const phraseTags = PHRASE_TAG_RULES.filter((rule) => rule.pattern.test(merged)).map((rule) => rule.tag);

  const rankedTokenTags = Array.from(tokenWeights.entries())
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    })
    .map(([token]) => token);

  const uniqueTags = Array.from(new Set([...phraseTags, ...rankedTokenTags])).slice(0, TAG_LIMIT);
  if (uniqueTags.length === 0) {
    uniqueTags.push('magazin');
  }

  return {
    categoryNames: [inferredCategory.name],
    tagNames: uniqueTags,
  };
}

function normalizeArticleMediaLinks(input: {
  mediaIds?: string[];
  mediaLinks?: Array<{ mediaId: string; fieldKey?: string }>;
}) {
  const links =
    input.mediaLinks && input.mediaLinks.length > 0
      ? input.mediaLinks.map((link) => ({
          mediaId: link.mediaId,
          fieldKey: (link.fieldKey || 'gallery').trim() || 'gallery',
        }))
      : (input.mediaIds || []).map((mediaId) => ({
          mediaId,
          fieldKey: 'gallery',
        }));

  const unique = new Map<string, { mediaId: string; fieldKey: string }>();
  for (const link of links) {
    if (!link.mediaId) continue;
    unique.set(`${link.mediaId}:${link.fieldKey}`, link);
  }

  return Array.from(unique.values());
}

async function resolvePrimaryCategory(
  tx: Prisma.TransactionClient,
  input: Pick<UpsertArticleInput, 'primaryCategorySlug' | 'primaryCategoryName' | 'categoryNames' | 'title' | 'excerpt' | 'content'>
) {
  const explicitValue =
    input.primaryCategorySlug?.trim() ||
    input.primaryCategoryName?.trim() ||
    input.categoryNames?.map((value) => value.trim()).find(Boolean) ||
    '';

  const definition =
    getMagazinCategoryDefinitionBySlug(explicitValue) ||
    getMagazinCategoryDefinitionByName(explicitValue) ||
    inferMagazinCategory(input) ||
    getDefaultMagazinCategory();

  return tx.articleCategory.upsert({
    where: { slug: definition.slug },
    update: {
      name: definition.name,
    },
    create: {
      name: definition.name,
      slug: definition.slug,
      introHeadline: definition.introHeadline,
      introContent: definition.introContent,
      introPrimaryCtaLabel: definition.introPrimaryCtaLabel,
      introPrimaryCtaHref: definition.introPrimaryCtaHref,
      introSecondaryCtaLabel: definition.introSecondaryCtaLabel,
      introSecondaryCtaHref: definition.introSecondaryCtaHref,
      introIsEnabled: definition.introIsEnabled,
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}

async function resolveTags(tx: Prisma.TransactionClient, names: string[]) {
  const results = await Promise.all(
    names.map((name) =>
      tx.articleTag.upsert({
        where: { slug: slugify(name) },
        update: { name },
        create: {
          name,
          slug: slugify(name),
        },
        select: { id: true },
      })
    )
  );

  return results.map((item) => item.id);
}

async function syncArticleSeoMeta(
  tx: Prisma.TransactionClient,
  articleId: string,
  input: Pick<
    UpsertArticleInput,
    'metaTitle' | 'metaDescription' | 'canonicalUrl' | 'ogTitle' | 'ogDescription' | 'ogImageId'
  >
) {
  const seoPayload = {
    title: input.metaTitle?.trim() || null,
    description: input.metaDescription?.trim() || null,
    canonicalUrl: input.canonicalUrl?.trim() || null,
    openGraphTitle: input.ogTitle?.trim() || null,
    openGraphDescription: input.ogDescription?.trim() || null,
    ogImageId: input.ogImageId || null,
  };

  const hasManualSeo = Object.values(seoPayload).some(Boolean);

  if (!hasManualSeo) {
    await tx.seoMeta.deleteMany({
      where: {
        targetType: SeoTargetType.ARTICLE,
        targetId: articleId,
      },
    });
    return;
  }

  await tx.seoMeta.upsert({
    where: {
      targetType_targetId: {
        targetType: SeoTargetType.ARTICLE,
        targetId: articleId,
      },
    },
    update: seoPayload,
    create: {
      targetType: SeoTargetType.ARTICLE,
      targetId: articleId,
      twitterCard: 'summary_large_image',
      ...seoPayload,
    },
  });
}

export async function upsertArticle(input: UpsertArticleInput) {
  const safeTitle = input.title.trim();
  const safeContent = input.content.trim();
  const safeExcerpt = input.excerpt?.trim() || null;

  if (!safeTitle) {
    throw new Error('Title is required.');
  }

  if (!safeContent) {
    throw new Error('Content is required.');
  }

  const slug = slugify(input.slug?.trim() || safeTitle);

  if (!slug) {
    throw new Error('A valid slug could not be generated.');
  }

  const manualTags = normalizeUniqueList(input.tagNames);
  const inferredTaxonomy = inferArticleTaxonomy({
    title: safeTitle,
    excerpt: safeExcerpt || '',
    content: safeContent,
  });
  const tags = manualTags.length > 0 ? manualTags : inferredTaxonomy.tagNames;
  const mediaLinks = normalizeArticleMediaLinks({
    mediaIds: input.mediaIds,
    mediaLinks: input.mediaLinks,
  });
  const parsedPublishedAt = input.publishedAt ? new Date(input.publishedAt) : null;
  const parsedScheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : null;
  const parsedEventStartAt = input.eventStartAt ? new Date(input.eventStartAt) : null;
  const parsedEventEndAt = input.eventEndAt ? new Date(input.eventEndAt) : null;
  const scheduleReferenceAt = parsedScheduledAt || parsedPublishedAt;

  if (input.status === ContentStatus.SCHEDULED && !scheduleReferenceAt) {
    throw new Error('For scheduled posts, set Publish At or Schedule At.');
  }

  const resolvedPublishedAt =
    input.status === ContentStatus.PUBLISHED
      ? parsedPublishedAt || new Date()
      : parsedPublishedAt;
  const resolvedScheduledAt = input.status === ContentStatus.SCHEDULED ? scheduleReferenceAt : parsedScheduledAt;

  return db.$transaction(async (tx) => {
    await ensureMagazinCategories(tx);

    const primaryCategory = await resolvePrimaryCategory(tx, {
      title: safeTitle,
      excerpt: safeExcerpt || undefined,
      content: safeContent,
      primaryCategorySlug: input.primaryCategorySlug,
      primaryCategoryName: input.primaryCategoryName,
      categoryNames: input.categoryNames && input.categoryNames.length > 0 ? input.categoryNames : inferredTaxonomy.categoryNames,
    });
    const safeLocationFocus = isBadSaarowTippsCategory(primaryCategory.name, primaryCategory.slug)
      ? input.locationFocus?.trim() || null
      : null;

    if (input.status === ContentStatus.PUBLISHED) {
      if (!safeExcerpt || safeExcerpt.length < PUBLISHED_EXCERPT_MIN) {
        throw new Error(`Published posts require an excerpt with at least ${PUBLISHED_EXCERPT_MIN} characters.`);
      }

      if (safeContent.length < PUBLISHED_CONTENT_MIN) {
        throw new Error(`Published posts require at least ${PUBLISHED_CONTENT_MIN} characters of body copy.`);
      }

      if (!input.coverImageId) {
        throw new Error('Published posts require a cover image.');
      }

      const coverImage = await tx.mediaAsset.findUnique({
        where: { id: input.coverImageId },
        select: { id: true, altText: true },
      });

      if (!coverImage) {
        throw new Error('Selected cover image was not found.');
      }

      if (!coverImage.altText?.trim()) {
        throw new Error('Published posts require cover media alt text in the media library.');
      }
    }

    if (input.id) {
      const duplicate = await tx.article.findFirst({
        where: {
          slug,
          NOT: { id: input.id },
        },
        select: { id: true },
      });

      if (duplicate) {
        throw new Error('Slug already exists.');
      }

      const updated = await tx.article.update({
        where: { id: input.id },
        data: {
          title: safeTitle,
          slug,
          excerpt: safeExcerpt,
          content: safeContent,
          status: input.status,
          readTimeMinutes: estimateReadTimeMinutes(safeContent),
          coverImageId: input.coverImageId || null,
          authorId: input.authorId || null,
          publishedAt: resolvedPublishedAt,
          scheduledAt: resolvedScheduledAt,
          locationFocus: safeLocationFocus,
          eventStartAt: parsedEventStartAt,
          eventEndAt: parsedEventEndAt,
          eventVenue: input.eventVenue?.trim() || null,
          eventUrl: input.eventUrl?.trim() || null,
        },
      });

      await tx.articleCategoryMap.deleteMany({ where: { articleId: updated.id } });
      await tx.articleTagMap.deleteMany({ where: { articleId: updated.id } });
      await tx.articleMediaLink.deleteMany({ where: { articleId: updated.id } });

      const tagIds = await resolveTags(tx, tags);

      await tx.articleCategoryMap.create({
        data: {
          articleId: updated.id,
          categoryId: primaryCategory.id,
        },
      });

      if (tagIds.length > 0) {
        await tx.articleTagMap.createMany({
          data: tagIds.map((tagId) => ({
            articleId: updated.id,
            tagId,
          })),
        });
      }

      if (mediaLinks.length > 0) {
        await tx.articleMediaLink.createMany({
          data: mediaLinks.map((link) => ({
            articleId: updated.id,
            mediaId: link.mediaId,
            fieldKey: link.fieldKey,
          })),
          skipDuplicates: true,
        });
      }

      await syncArticleSeoMeta(tx, updated.id, input);

      return updated;
    }

    const duplicate = await tx.article.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (duplicate) {
      throw new Error('Slug already exists.');
    }

    const created = await tx.article.create({
      data: {
        title: safeTitle,
        slug,
        excerpt: safeExcerpt,
        content: safeContent,
        status: input.status,
        readTimeMinutes: estimateReadTimeMinutes(safeContent),
        coverImageId: input.coverImageId || null,
        authorId: input.authorId || null,
        publishedAt: resolvedPublishedAt,
        scheduledAt: resolvedScheduledAt,
        locationFocus: safeLocationFocus,
        eventStartAt: parsedEventStartAt,
        eventEndAt: parsedEventEndAt,
        eventVenue: input.eventVenue?.trim() || null,
        eventUrl: input.eventUrl?.trim() || null,
      },
    });

    const tagIds = await resolveTags(tx, tags);

    await tx.articleCategoryMap.create({
      data: {
        articleId: created.id,
        categoryId: primaryCategory.id,
      },
    });

    if (tagIds.length > 0) {
      await tx.articleTagMap.createMany({
        data: tagIds.map((tagId) => ({
          articleId: created.id,
          tagId,
        })),
      });
    }

    if (mediaLinks.length > 0) {
      await tx.articleMediaLink.createMany({
        data: mediaLinks.map((link) => ({
          articleId: created.id,
          mediaId: link.mediaId,
          fieldKey: link.fieldKey,
        })),
        skipDuplicates: true,
      });
    }

    await syncArticleSeoMeta(tx, created.id, input);

    return created;
  });
}

export async function getOrCreateSiteSetting() {
  return db.siteSetting.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      siteName: 'Carpe Diem bei Ben',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.carpediem-badsaarow.de',
      brandTagline: 'Mediterrane Gastronomie in Bad Saarow',
      defaultLocale: 'de-DE',
      timezone: 'Europe/Berlin',
      defaultSeoTitle: 'Carpe Diem bei Ben',
      defaultSeoDescription: 'Carpe Diem bei Ben in Bad Saarow - mediterrane Küche, Ambiente und Reservierung.',
    },
  });
}

export async function ensureDefaultAiAgents() {
  const channels = [AiChannel.MAGAZIN, AiChannel.INSTAGRAM, AiChannel.PINTEREST, AiChannel.TIKTOK];

  await Promise.all(
    channels.map((channel) =>
      db.aiAgentConfig.upsert({
        where: { channel },
        update: {},
        create: {
          channel,
          promptTemplate:
            channel === AiChannel.MAGAZIN
              ? 'Erzeuge einen SEO-optimierten Magazinbeitrag auf Deutsch mit lokalem Bezug zu Bad Saarow.'
              : `Erzeuge einen tagesaktuellen Beitrag für ${channel} auf Deutsch mit klarer Handlungsaufforderung.`,
          isEnabled: false,
          runWindowStart: '08:00',
          runWindowEnd: '10:00',
          timezone: 'Europe/Berlin',
          frequencyMins: 1440,
          targetLanguage: 'de',
        },
      })
    )
  );
}

export async function ensureDefaultSocialAccounts() {
  const defaults: Array<{
    platform: SocialPlatform;
    url: string;
    handle: string;
    sortOrder: number;
  }> = [
    {
      platform: SocialPlatform.INSTAGRAM,
      url: 'https://instagram.com/carpediembadsaarow',
      handle: '@carpediembadsaarow',
      sortOrder: 1,
    },
    {
      platform: SocialPlatform.TIKTOK,
      url: 'https://tiktok.com/@carpediem_badsaarow',
      handle: '@carpediem_badsaarow',
      sortOrder: 2,
    },
    {
      platform: SocialPlatform.PINTEREST,
      url: 'https://pinterest.com/carpediembadsaarow',
      handle: '@carpediembadsaarow',
      sortOrder: 3,
    },
  ];

  await Promise.all(
    defaults.map((account) =>
      db.socialAccount.upsert({
        where: {
          id: `${account.platform.toLowerCase()}-default`,
        },
        update: {},
        create: {
          id: `${account.platform.toLowerCase()}-default`,
          siteSettingId: 'global',
          platform: account.platform,
          url: account.url,
          handle: account.handle,
          isActive: true,
          sortOrder: account.sortOrder,
        },
      })
    )
  );
}

export async function upsertSeoMeta(input: {
  targetType: SeoTargetType;
  targetId: string;
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  robots?: string;
  openGraphTitle?: string;
  openGraphDescription?: string;
  twitterCard?: string;
  schemaType?: string;
  ogImageId?: string | null;
  extra?: Prisma.JsonValue;
}) {
  return db.seoMeta.upsert({
    where: {
      targetType_targetId: {
        targetType: input.targetType,
        targetId: input.targetId,
      },
    },
    update: {
      title: input.title || null,
      description: input.description || null,
      keywords: input.keywords || null,
      canonicalUrl: input.canonicalUrl || null,
      robots: input.robots || null,
      openGraphTitle: input.openGraphTitle || null,
      openGraphDescription: input.openGraphDescription || null,
      twitterCard: input.twitterCard || null,
      schemaType: input.schemaType || null,
      ogImageId: input.ogImageId || null,
      extra: input.extra ?? Prisma.JsonNull,
    },
    create: {
      targetType: input.targetType,
      targetId: input.targetId,
      title: input.title || null,
      description: input.description || null,
      keywords: input.keywords || null,
      canonicalUrl: input.canonicalUrl || null,
      robots: input.robots || null,
      openGraphTitle: input.openGraphTitle || null,
      openGraphDescription: input.openGraphDescription || null,
      twitterCard: input.twitterCard || null,
      schemaType: input.schemaType || null,
      ogImageId: input.ogImageId || null,
      extra: input.extra ?? Prisma.JsonNull,
    },
  });
}
