import { ContentStatus, SeoTargetType } from '@prisma/client';
import { unstable_cache, unstable_noStore as noStore } from 'next/cache';
import { db } from '@/lib/db';
import { getOrCreateSiteSetting } from '@/lib/cms/content';
import { ensureMagazinCategories, MAGAZIN_CATEGORY_DEFINITIONS, MAGAZIN_POSTS_PER_PAGE, sortMagazinCategories } from '@/lib/cms/magazin';
import { PUBLIC_MAGAZIN_CONTENT_TAG, PUBLIC_PAGE_CONTENT_TAG } from '@/lib/cms/revalidation';
import { HOME_PAGE_SLUGS } from '@/lib/cms/page-slugs';

const MAGAZIN_CACHE_REVALIDATE_SECONDS = 3600;

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
  return unstable_cache(
    async () =>
      db.article.findMany({
        where: buildPublishedArticleWhere(),
        include: articleCardInclude,
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      }),
    ['magazin-published-posts'],
    {
      revalidate: MAGAZIN_CACHE_REVALIDATE_SECONDS,
      tags: [PUBLIC_MAGAZIN_CONTENT_TAG],
    }
  )();
}

export async function getPaginatedMagazinPosts(input?: {
  search?: string;
  categorySlug?: string;
  page?: number;
  pageSize?: number;
}) {
  await ensureMagazinCategories();

  const search = input?.search?.trim() || '';
  const categorySlug = input?.categorySlug?.trim() || '';
  const pageSize = input?.pageSize || MAGAZIN_POSTS_PER_PAGE;
  const page = Math.max(1, input?.page || 1);

  return unstable_cache(
    async () => {
      const where = buildPublishedArticleWhere({
        search,
        categorySlug,
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
    },
    ['magazin-paginated-posts', search || '_', categorySlug || '_', String(page), String(pageSize)],
    {
      revalidate: MAGAZIN_CACHE_REVALIDATE_SECONDS,
      tags: [PUBLIC_MAGAZIN_CONTENT_TAG],
    }
  )();
}

export async function getMagazinCategories() {
  await ensureMagazinCategories();

  return unstable_cache(
    async () => {
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
    },
    ['magazin-categories'],
    {
      revalidate: MAGAZIN_CACHE_REVALIDATE_SECONDS,
      tags: [PUBLIC_MAGAZIN_CONTENT_TAG],
    }
  )();
}

export async function getMagazinCategoryBySlug(slug: string) {
  await ensureMagazinCategories();

  return unstable_cache(
    async () => {
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
    },
    ['magazin-category', slug],
    {
      revalidate: MAGAZIN_CACHE_REVALIDATE_SECONDS,
      tags: [PUBLIC_MAGAZIN_CONTENT_TAG],
    }
  )();
}

export async function getMagazinPostBySlug(slug: string) {
  return unstable_cache(
    async () => {
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
    },
    ['magazin-post', slug],
    {
      revalidate: MAGAZIN_CACHE_REVALIDATE_SECONDS,
      tags: [PUBLIC_MAGAZIN_CONTENT_TAG],
    }
  )();
}

export async function getRelatedMagazinPosts(input: {
  articleId: string;
  categorySlug?: string | null;
  take?: number;
}) {
  if (!input.categorySlug) {
    return [];
  }

  const take = input.take || 3;

  return unstable_cache(
    async () =>
      db.article.findMany({
        where: {
          ...buildPublishedArticleWhere({
            categorySlug: input.categorySlug || undefined,
          }),
          NOT: {
            id: input.articleId,
          },
        },
        include: articleCardInclude,
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        take,
      }),
    ['magazin-related-posts', input.articleId, input.categorySlug, String(take)],
    {
      revalidate: MAGAZIN_CACHE_REVALIDATE_SECONDS,
      tags: [PUBLIC_MAGAZIN_CONTENT_TAG],
    }
  )();
}

export async function getPublishedMagazinPostSlugs() {
  return unstable_cache(
    async () =>
      db.article.findMany({
        where: buildPublishedArticleWhere(),
        select: {
          slug: true,
        },
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      }),
    ['magazin-published-slugs'],
    {
      revalidate: MAGAZIN_CACHE_REVALIDATE_SECONDS,
      tags: [PUBLIC_MAGAZIN_CONTENT_TAG],
    }
  )();
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

const getCachedHomeByTitle = unstable_cache(
  async () =>
    db.page.findFirst({
      where: {
        title: {
          in: ['Startseite', 'startseite', 'Home', 'home', 'Homepage', 'homepage'],
        },
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
      orderBy: {
        updatedAt: 'desc',
      },
    }),
  ['public-page-home-fallback'],
  {
    revalidate: 3600,
    tags: [PUBLIC_PAGE_CONTENT_TAG],
  }
);

export async function getPageContent(slug: string) {
  return getCachedPageContent(slug);
}

export async function getHomePageContent() {
  for (const slug of HOME_PAGE_SLUGS) {
    const page = await getCachedPageContent(slug);
    if (page) return page;
  }

  return getCachedHomeByTitle();
}
