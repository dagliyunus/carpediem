import { MetadataRoute } from 'next';
import { ContentStatus } from '@prisma/client';
import { siteConfig } from '@/config/siteConfig';
import { db } from '@/lib/db';
import { ensureMagazinCategories, MAGAZIN_CATEGORY_DEFINITIONS } from '@/lib/cms/magazin';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.seo.domain;
  const lastModified = new Date();
  await ensureMagazinCategories();

  const baseRoutes = [
    { route: '', priority: 1 },
    { route: '/menu', priority: 0.92 },
    { route: '/drinks', priority: 0.9 },
    { route: '/reservieren', priority: 0.95 },
    { route: '/galerie', priority: 0.82 },
    { route: '/kontakt', priority: 0.9 },
    { route: '/magazin', priority: 0.85 },
  ].map((item) => ({
    url: `${baseUrl}${item.route}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: item.priority,
  }));

  const posts = await db.article.findMany({
    where: {
      status: ContentStatus.PUBLISHED,
      publishedAt: {
        lte: new Date(),
      },
    },
    select: {
      slug: true,
      updatedAt: true,
      publishedAt: true,
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: 500,
  });

  const postRoutes = posts.map((post) => ({
    url: `${baseUrl}/magazin/${post.slug}`,
    lastModified: post.updatedAt || post.publishedAt || lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const categoryRoutes = MAGAZIN_CATEGORY_DEFINITIONS.map((category) => ({
    url: `${baseUrl}/magazin/kategorie/${category.slug}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));

  return [...baseRoutes, ...categoryRoutes, ...postRoutes];
}
