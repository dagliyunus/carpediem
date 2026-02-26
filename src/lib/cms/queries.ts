import { ContentStatus, SeoTargetType } from '@prisma/client';
import { unstable_noStore as noStore } from 'next/cache';
import { db } from '@/lib/db';
import { getOrCreateSiteSetting } from '@/lib/cms/content';

export async function getPublishedMagazinPosts() {
  noStore();

  return db.article.findMany({
    where: {
      status: ContentStatus.PUBLISHED,
    },
    include: {
      coverImage: {
        select: {
          id: true,
          url: true,
          altText: true,
          filename: true,
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
    },
    orderBy: [
      {
        publishedAt: 'desc',
      },
      {
        createdAt: 'desc',
      },
    ],
  });
}

export async function getMagazinPostBySlug(slug: string) {
  noStore();

  return db.article.findUnique({
    where: { slug },
    include: {
      coverImage: {
        select: {
          id: true,
          url: true,
          altText: true,
          filename: true,
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
    },
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

export async function getPageContent(slug: string) {
  noStore();

  return db.page.findUnique({
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
              url: true,
              altText: true,
              filename: true,
              mediaType: true,
              width: true,
              height: true,
              title: true,
              caption: true,
            },
          },
        },
      },
    },
  });
}
