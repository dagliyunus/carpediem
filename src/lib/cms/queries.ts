import { ContentStatus, SeoTargetType } from '@prisma/client';
import { unstable_cache, unstable_noStore as noStore } from 'next/cache';
import { db } from '@/lib/db';
import { getOrCreateSiteSetting } from '@/lib/cms/content';
import { ensureMagazinCategories, MAGAZIN_CATEGORY_DEFINITIONS, MAGAZIN_POSTS_PER_PAGE, sortMagazinCategories } from '@/lib/cms/magazin';
import { PUBLIC_PAGE_CONTENT_TAG } from '@/lib/cms/revalidation';
import { publishDueScheduledArticles } from '@/lib/cms/scheduler';

const articleCardInclude = {
  coverImage: {
    select: {
      id: true,
      url: true,
      altText: true,
      filename: true,
      mediaType: true,
    },
  },
  categories: {
    include: {
      category: true,
    },
  },
  tags: {
    include: {
      tag: true,
    },
  },
  author: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  mediaLinks: {
    include: {
      media: {
        select: {
          id: true,
          url: true,
          altText: true,
          filename: true,
          mediaType: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  },
} as const;

async function publishDueScheduledArticlesSafe() {
  try {
    await publishDueScheduledArticles();
  } catch {
    // Keep content queries resilient even if scheduler check fails.
  }
}

function buildPublishedArticleWhere(input?: { search?: string; categorySlug?: string }) {
  const search = input?.search?.trim();
  const categorySlug = input?.categorySlug?.trim();

  return {
    status: ContentStatus.PUBLISHED,
    publishedAt: {
      lte: new Date(),
    },
    ...(categorySlug
      ? {
          categories: {
            some: {
              category: {
                slug: categorySlug,
              },
            },
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { excerpt: { contains: search, mode: 'insensitive' as const } },
            { content: { contains: search, mode: 'insensitive' as const } },
            {
              categories: {
                some: {
                  category: {
                    name: { contains: search, mode: 'insensitive' as const },
                  },
                },
              },
            },
            {
              tags: {
                some: {
                  tag: {
                    name: { contains: search, mode: 'insensitive' as const },
                  },
                },
              },
            },
            { locationFocus: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };
}

export async function getPublishedMagazinPosts() {
  noStore();
  await publishDueScheduledArticlesSafe();

  return db.article.findMany({
    where: buildPublishedArticleWhere(),
    include: articleCardInclude,
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function getPaginatedMagazinPosts(input?: {
  search?: string;
  categorySlug?: string;
  page?: number;
  pageSize?: number;
}) {
  noStore();
  await publishDueScheduledArticlesSafe();
  await ensureMagazinCategories();

  const pageSize = input?.pageSize || MAGAZIN_POSTS_PER_PAGE;
  const page = Math.max(1, input?.page || 1);
  const where = buildPublishedArticleWhere({
    search: input?.search,
    categorySlug: input?.categorySlug,
  });

  const [total, items] = await Promise.all([
    db.article.count({ where }),
    db.article.findMany({
      where,
      include: articleCardInclude,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getMagazinCategories() {
  noStore();
  await ensureMagazinCategories();

  const categories = await db.articleCategory.findMany({
    where: {
      slug: {
        in: MAGAZIN_CATEGORY_DEFINITIONS.map((item) => item.slug),
      },
    },
    include: {
      introMedia: {
        select: {
          id: true,
          url: true,
          altText: true,
          filename: true,
          mediaType: true,
        },
      },
      articles: {
        where: {
          article: {
            status: ContentStatus.PUBLISHED,
            publishedAt: {
              lte: new Date(),
            },
          },
        },
        select: {
          id: true,
        },
      },
    },
  });

  return sortMagazinCategories(categories);
}

export async function getMagazinCategoryBySlug(slug: string) {
  noStore();
  await ensureMagazinCategories();

  const category = await db.articleCategory.findUnique({
    where: { slug },
    include: {
      introMedia: {
        select: {
          id: true,
          url: true,
          altText: true,
          filename: true,
          mediaType: true,
        },
      },
    },
  });

  if (!category) return null;
  if (!MAGAZIN_CATEGORY_DEFINITIONS.some((item) => item.slug === category.slug)) return null;

  return category;
}

export async function getMagazinPostBySlug(slug: string) {
  noStore();
  await publishDueScheduledArticlesSafe();

  const post = await db.article.findUnique({
    where: { slug },
    include: articleCardInclude,
  });

  if (!post) {
    return null;
  }

  const seo = await db.seoMeta.findUnique({
    where: {
      targetType_targetId: {
        targetType: SeoTargetType.ARTICLE,
        targetId: post.id,
      },
    },
    include: {
      ogImage: {
        select: {
          id: true,
          url: true,
          altText: true,
        },
      },
    },
  });

  return {
    ...post,
    seo,
  };
}

export async function getRelatedMagazinPosts(input: {
  articleId: string;
  categorySlug?: string | null;
  take?: number;
}) {
  noStore();
  await publishDueScheduledArticlesSafe();

  if (!input.categorySlug) {
    return [];
  }

  return db.article.findMany({
    where: {
      ...buildPublishedArticleWhere({
        categorySlug: input.categorySlug,
      }),
      NOT: {
        id: input.articleId,
      },
    },
    include: articleCardInclude,
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    take: input.take || 3,
  });
}

export async function getSiteCmsData() {
  noStore();

  const site = await getOrCreateSiteSetting();
  const seo = await db.seoMeta.findUnique({
    where: {
      targetType_targetId: {
        targetType: SeoTargetType.GLOBAL,
        targetId: 'global',
      },
    },
    include: {
      ogImage: {
        select: {
          id: true,
          url: true,
          altText: true,
        },
      },
    },
  });

  const social = await db.socialAccount.findMany({
    where: {
      siteSettingId: 'global',
      isActive: true,
    },
    orderBy: {
      sortOrder: 'asc',
    },
  });

  return { site, seo, social };
}

const getCachedPageContent = unstable_cache(
  async (slug: string) =>
    db.page.findUnique({
      where: {
        slug,
      },
      include: {
        heroImage: {
          select: {
            id: true,
            url: true,
            altText: true,
            filename: true,
          },
        },
        mediaLinks: {
          select: {
            fieldKey: true,
            media: {
              select: {
                id: true,
                key: true,
                url: true,
                altText: true,
                filename: true,
                mediaType: true,
                width: true,
                height: true,
              },
            },
          },
        },
      },
    }),
  ['public-page-content'],
  {
    revalidate: 3600,
    tags: [PUBLIC_PAGE_CONTENT_TAG],
  }
);

export async function getPageContent(slug: string) {
  return getCachedPageContent(slug);
}
