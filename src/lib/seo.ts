import type { Metadata } from 'next';
import { siteConfig } from '@/config/siteConfig';

const DEFAULT_OG_IMAGE = '/images/outside_night.webp';

type BuildMetadataInput = {
  title: string;
  description: string;
  path?: string;
  index?: boolean;
  follow?: boolean;
};

export function buildMetadata({
  title,
  description,
  path = '/',
  index = true,
  follow = true,
}: BuildMetadataInput): Metadata {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const canonicalUrl = `${siteConfig.seo.domain}${normalizedPath}`;
  const ogImageUrl = `${siteConfig.seo.domain}${DEFAULT_OG_IMAGE}`;

  return {
    title,
    description,
    alternates: {
      canonical: normalizedPath,
    },
    robots: {
      index,
      follow,
      noarchive: !index,
      googleBot: {
        index,
        follow,
        noarchive: !index,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      locale: 'de_DE',
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1536,
          height: 1024,
          alt: `${siteConfig.name} in Bad Saarow`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${siteConfig.name}`,
      description,
      images: [ogImageUrl],
    },
  };
}
