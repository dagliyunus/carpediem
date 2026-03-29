import { Prisma, SeoTargetType } from '@prisma/client';
import { db } from '@/lib/db';
import { buildGeneratedMagazinPostSeo } from '@/lib/seo/magazin';

const articleSeoInclude = {
  coverImage: {
    select: {
      id: true,
      url: true,
      altText: true,
    },
  },
  categories: {
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  },
  tags: {
    include: {
      tag: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  },
  author: {
    select: {
      name: true,
    },
  },
} as const;

function coalesceText(value: string | null | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed || fallback;
}

export async function ensureArticleSeoDefaults(articleId: string) {
  const article = await db.article.findUnique({
    where: { id: articleId },
    include: articleSeoInclude,
  });

  if (!article) {
    return;
  }

  const existing = await db.seoMeta.findUnique({
    where: {
      targetType_targetId: {
        targetType: SeoTargetType.ARTICLE,
        targetId: article.id,
      },
    },
  });

  const generated = buildGeneratedMagazinPostSeo({
    ...article,
    seo: null,
  });

  await db.seoMeta.upsert({
    where: {
      targetType_targetId: {
        targetType: SeoTargetType.ARTICLE,
        targetId: article.id,
      },
    },
    update: {
      title: coalesceText(existing?.title, generated.title),
      description: coalesceText(existing?.description, generated.description),
      canonicalUrl: coalesceText(existing?.canonicalUrl, generated.canonical),
      openGraphTitle: coalesceText(existing?.openGraphTitle, generated.ogTitle),
      openGraphDescription: coalesceText(existing?.openGraphDescription, generated.ogDescription),
      twitterCard: coalesceText(existing?.twitterCard, 'summary_large_image'),
      schemaType: coalesceText(existing?.schemaType, 'BlogPosting'),
      ogImageId: existing?.ogImageId || article.coverImage?.id || null,
      extra: existing?.extra ?? Prisma.JsonNull,
    },
    create: {
      targetType: SeoTargetType.ARTICLE,
      targetId: article.id,
      title: generated.title,
      description: generated.description,
      canonicalUrl: generated.canonical,
      openGraphTitle: generated.ogTitle,
      openGraphDescription: generated.ogDescription,
      twitterCard: 'summary_large_image',
      schemaType: 'BlogPosting',
      ogImageId: article.coverImage?.id || null,
      extra: Prisma.JsonNull,
    },
  });
}
