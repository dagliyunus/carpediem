import React from 'react';
import { siteConfig } from '@/config/siteConfig';
import { getPublicSiteRuntime } from '@/lib/cms/runtime';

export const JsonLd = async () => {
  const runtime = await getPublicSiteRuntime();

  const baseUrl = runtime.site?.siteUrl || siteConfig.seo.domain;
  const logoUrl = `${baseUrl}/images/logo.webp`;
  const coverImageUrl = runtime.seo?.ogImage?.url || `${baseUrl}/images/outside_night.webp`;
  const sameAs = runtime.social.map((item) => item.url);
  const businessPhone = runtime.site?.businessPhone || siteConfig.contact.phone;
  const businessEmail = runtime.site?.businessEmail || siteConfig.contact.email;

  const restaurantSchema = {
    '@context': 'https://schema.org',
    '@type': runtime.seo?.schemaType || 'Restaurant',
    name: runtime.site?.siteName || siteConfig.name,
    image: [coverImageUrl, logoUrl],
    '@id': `${baseUrl}#restaurant`,
    url: baseUrl,
    logo: logoUrl,
    telephone: businessPhone,
    email: businessEmail,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Am Kurpark 6',
      addressLocality: 'Bad Saarow',
      postalCode: '15526',
      addressRegion: 'Brandenburg',
      addressCountry: 'DE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: siteConfig.location.lat,
      longitude: siteConfig.location.lng,
    },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.location.address)}`,
    openingHoursSpecification: siteConfig.openingHours
      .filter((h) => h.open !== 'Ruhetag')
      .map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek:
          h.days === 'Mo'
            ? 'Monday'
            : h.days === 'Di'
              ? 'Tuesday'
              : h.days === 'Mi'
                ? 'Wednesday'
                : h.days === 'Do'
                  ? 'Thursday'
                  : h.days === 'Fr'
                    ? 'Friday'
                    : h.days === 'Sa'
                      ? 'Saturday'
                      : 'Sunday',
        opens: h.open,
        closes: h.close,
      })),
    servesCuisine: ['Mediterran', 'Aegean', 'Deutsch'],
    priceRange: '€€',
    acceptsReservations: true,
    menu: `${baseUrl}/menu`,
    sameAs,
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}#website`,
    url: baseUrl,
    name: runtime.site?.siteName || siteConfig.name,
    inLanguage: runtime.site?.defaultLocale || 'de-DE',
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}#organization`,
    name: runtime.site?.siteName || siteConfig.name,
    url: baseUrl,
    logo: logoUrl,
    sameAs,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: businessPhone,
        email: businessEmail,
        areaServed: 'DE',
        availableLanguage: ['de'],
      },
    ],
  };

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [websiteSchema, organizationSchema, restaurantSchema],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
};
