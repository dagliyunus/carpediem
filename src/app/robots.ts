import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/siteConfig';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        // Keep legacy URLs crawlable so Google can confirm 410 and drop them.
        allow: ['/'],
        disallow: [
          '/api/',
          '/admin/',
          '/*?*q=',
          '/*?*kategorie=',
        ],
      },
    ],
    host: siteConfig.seo.domain,
    sitemap: `${siteConfig.seo.domain}/sitemap.xml`,
  };
}
