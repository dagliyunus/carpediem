import { MetadataRoute } from 'next';
import { ContentStatus } from '@prisma/client';
import { siteConfig } from '@/config/siteConfig';
import { db } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.seo.domain;
  const lastModified = new Date();

  const baseRoutes = [
    '',
    '/menu',
    '/drinks',
    '/reservieren',
    '/galerie',
    '/kontakt',
    '/magazin',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
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

  return [...baseRoutes, ...postRoutes];
}
