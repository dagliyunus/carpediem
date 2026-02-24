import { AiChannel, ContentStatus, Prisma, SeoTargetType, SocialPlatform } from '@prisma/client';
import { db } from '@/lib/db';

const WORDS_PER_MINUTE = 220;

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

  const categories = normalizeUniqueList(input.categoryNames);
  const tags = normalizeUniqueList(input.tagNames);
  const mediaIds = Array.from(new Set((input.mediaIds || []).filter(Boolean)));

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
          publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
          scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
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
        publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
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
      siteName: 'Pivado',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pivado.de',
      brandTagline: 'Mediterrane Gastronomie in Bad Saarow',
      defaultLocale: 'de-DE',
      timezone: 'Europe/Berlin',
      defaultSeoTitle: 'Pivado',
      defaultSeoDescription: 'Pivado in Bad Saarow - mediterrane Küche, Ambiente und Reservierung.',
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
