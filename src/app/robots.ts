import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/siteConfig';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/wp-admin/',
        '/wp-content/',
        '/wp-includes/',
        '/category/',
        '/tag/',
        '/author/',
        '/admin/',
        '/blog',
        '/hello-world',
      ],
    },
    host: siteConfig.seo.domain,
    sitemap: `${siteConfig.seo.domain}/sitemap.xml`,
  };
}
