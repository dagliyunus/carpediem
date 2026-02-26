import { AiChannel, ContentStatus, Prisma, SeoTargetType, SocialPlatform } from '@prisma/client';
import { db } from '@/lib/db';

const WORDS_PER_MINUTE = 220;
const TAG_LIMIT = 8;
const CATEGORY_LIMIT = 3;

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

const CATEGORY_RULES: Array<{ name: string; keywords: string[] }> = [
  {
    name: 'Events',
    keywords: ['event', 'events', 'live', 'musik', 'dj', 'konzert', 'party', 'abend'],
  },
  {
    name: 'Kulinarik',
    keywords: ['kulinar', 'gericht', 'speise', 'menu', 'menue', 'taste', 'rezept', 'kueche'],
  },
  {
    name: 'Fisch & Meeresfruechte',
    keywords: ['fisch', 'meeresfrucht', 'seafood', 'dorade', 'lachs', 'thunfisch'],
  },
  {
    name: 'Grill',
    keywords: ['grill', 'steak', 'haehnchen', 'fleisch', 'bbq'],
  },
  {
    name: 'Getraenke',
    keywords: ['cocktail', 'wein', 'getraenk', 'drink', 'aperitivo', 'bar'],
  },
  {
    name: 'Bad Saarow',
    keywords: ['bad saarow', 'saarow'],
  },
];

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
  categoryNames?: string[];
  tagNames?: string[];
  mediaIds?: string[];
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

  const inferredCategories = CATEGORY_RULES.filter((rule) =>
    rule.keywords.some((keyword) => merged.includes(keyword))
  ).map((rule) => rule.name);

  if (inferredCategories.length === 0) {
    inferredCategories.push('Magazin');
  }

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
    categoryNames: inferredCategories.slice(0, CATEGORY_LIMIT),
    tagNames: uniqueTags,
  };
}

async function resolveCategories(tx: Prisma.TransactionClient, names: string[]) {
  const results = await Promise.all(
    names.map((name) =>
      tx.articleCategory.upsert({
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

export async function upsertArticle(input: UpsertArticleInput) {
  const safeTitle = input.title.trim();
  const safeContent = input.content.trim();

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

  const manualCategories = normalizeUniqueList(input.categoryNames);
  const manualTags = normalizeUniqueList(input.tagNames);
  const inferredTaxonomy = inferArticleTaxonomy({
    title: safeTitle,
    excerpt: input.excerpt?.trim() || '',
    content: safeContent,
  });
  const categories = manualCategories.length > 0 ? manualCategories : inferredTaxonomy.categoryNames;
  const tags = manualTags.length > 0 ? manualTags : inferredTaxonomy.tagNames;
  const mediaIds = Array.from(new Set((input.mediaIds || []).filter(Boolean)));
  const parsedPublishedAt = input.publishedAt ? new Date(input.publishedAt) : null;
  const parsedScheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : null;
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
          excerpt: input.excerpt?.trim() || null,
          content: safeContent,
          status: input.status,
          readTimeMinutes: estimateReadTimeMinutes(safeContent),
          coverImageId: input.coverImageId || null,
          authorId: input.authorId || null,
          publishedAt: resolvedPublishedAt,
          scheduledAt: resolvedScheduledAt,
        },
      });

      await tx.articleCategoryMap.deleteMany({ where: { articleId: updated.id } });
      await tx.articleTagMap.deleteMany({ where: { articleId: updated.id } });
      await tx.articleMediaLink.deleteMany({ where: { articleId: updated.id } });

      const categoryIds = await resolveCategories(tx, categories);
      const tagIds = await resolveTags(tx, tags);

      if (categoryIds.length > 0) {
        await tx.articleCategoryMap.createMany({
          data: categoryIds.map((categoryId) => ({
            articleId: updated.id,
            categoryId,
          })),
        });
      }

      if (tagIds.length > 0) {
        await tx.articleTagMap.createMany({
          data: tagIds.map((tagId) => ({
            articleId: updated.id,
            tagId,
          })),
        });
      }

      if (mediaIds.length > 0) {
        await tx.articleMediaLink.createMany({
          data: mediaIds.map((mediaId) => ({
            articleId: updated.id,
            mediaId,
            fieldKey: 'content',
          })),
          skipDuplicates: true,
        });
      }

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
        excerpt: input.excerpt?.trim() || null,
        content: safeContent,
        status: input.status,
        readTimeMinutes: estimateReadTimeMinutes(safeContent),
        coverImageId: input.coverImageId || null,
        authorId: input.authorId || null,
        publishedAt: resolvedPublishedAt,
        scheduledAt: resolvedScheduledAt,
      },
    });

    const categoryIds = await resolveCategories(tx, categories);
    const tagIds = await resolveTags(tx, tags);

    if (categoryIds.length > 0) {
      await tx.articleCategoryMap.createMany({
        data: categoryIds.map((categoryId) => ({
          articleId: created.id,
          categoryId,
        })),
      });
    }

    if (tagIds.length > 0) {
      await tx.articleTagMap.createMany({
        data: tagIds.map((tagId) => ({
          articleId: created.id,
          tagId,
        })),
      });
    }

    if (mediaIds.length > 0) {
      await tx.articleMediaLink.createMany({
        data: mediaIds.map((mediaId) => ({
          articleId: created.id,
          mediaId,
          fieldKey: 'content',
        })),
        skipDuplicates: true,
      });
    }

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
      defaultSeoDescription: 'Carpe Diem bei Ben in Bad Saarow - mediterrane Kueche, Ambiente und Reservierung.',
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
              : `Erzeuge einen tagesaktuellen Beitrag fuer ${channel} auf Deutsch mit klarer Handlungsaufforderung.`,
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
