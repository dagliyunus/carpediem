import React from 'react';
import { siteConfig } from '@/config/siteConfig';

export const JsonLd = () => {
  const baseUrl = siteConfig.seo.domain;
  const logoUrl = `${baseUrl}/images/logo_carpediem.webp`;
  const coverImageUrl = `${baseUrl}/images/outside_night.webp`;
  const sameAs = Object.values(siteConfig.contact.socials);

  const restaurantSchema = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: siteConfig.name,
    image: [coverImageUrl, logoUrl],
    '@id': `${baseUrl}#restaurant`,
    url: baseUrl,
    logo: logoUrl,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
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
          h.days === 'Mo' ? 'Monday' :
          h.days === 'Di' ? 'Tuesday' :
          h.days === 'Mi' ? 'Wednesday' :
          h.days === 'Do' ? 'Thursday' :
          h.days === 'Fr' ? 'Friday' :
          h.days === 'Sa' ? 'Saturday' : 'Sunday',
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
    name: siteConfig.name,
    inLanguage: 'de-DE',
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}#organization`,
    name: siteConfig.name,
    url: baseUrl,
    logo: logoUrl,
    sameAs,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: siteConfig.contact.phone,
        email: siteConfig.contact.email,
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
