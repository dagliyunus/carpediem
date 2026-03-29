import { MetadataRoute } from 'next';
import { ContentStatus } from '@prisma/client';
import { siteConfig } from '@/config/siteConfig';
import { db } from '@/lib/db';
import { ensureMagazinCategories, MAGAZIN_CATEGORY_DEFINITIONS } from '@/lib/cms/magazin';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.seo.domain;
  const now = new Date();
  await ensureMagazinCategories();

  const [posts, categories] = await Promise.all([
    db.article.findMany({
      where: {
        status: ContentStatus.PUBLISHED,
        publishedAt: {
          lte: now,
        },
      },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
        categories: {
          select: {
            category: {
              select: {
                slug: true,
              },
            },
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 500,
    }),
    db.articleCategory.findMany({
      where: {
        slug: {
          in: MAGAZIN_CATEGORY_DEFINITIONS.map((category) => category.slug),
        },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    }),
  ]);

  const latestMagazinUpdate = posts[0]?.updatedAt || posts[0]?.publishedAt || now;
  const latestPostByCategory = new Map<string, Date>();

  for (const post of posts) {
    const postLastModified = post.updatedAt || post.publishedAt || now;

    for (const category of post.categories) {
      if (!latestPostByCategory.has(category.category.slug)) {
        latestPostByCategory.set(category.category.slug, postLastModified);
      }
    }
  }

  const baseRoutes = [
    { route: '', priority: 1, lastModified: now },
    { route: '/menu', priority: 0.92, lastModified: now },
    { route: '/drinks', priority: 0.9, lastModified: now },
    { route: '/reservieren', priority: 0.95, lastModified: now },
    { route: '/galerie', priority: 0.82, lastModified: now },
    { route: '/kontakt', priority: 0.9, lastModified: now },
    { route: '/magazin', priority: 0.85, lastModified: latestMagazinUpdate },
  ].map((item) => ({
    url: `${baseUrl}${item.route}`,
    lastModified: item.lastModified,
    changeFrequency: 'weekly' as const,
    priority: item.priority,
  }));

  const postRoutes = posts.map((post) => ({
    url: `${baseUrl}/magazin/${post.slug}`,
    lastModified: post.updatedAt || post.publishedAt || latestMagazinUpdate,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/magazin/kategorie/${category.slug}`,
    lastModified: latestPostByCategory.get(category.slug) || category.updatedAt || latestMagazinUpdate,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));

  return [...baseRoutes, ...categoryRoutes, ...postRoutes];
}
