import React from 'react';
import { siteConfig } from '@/config/siteConfig';

export const JsonLd = () => {
  const restaurantSchema = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: siteConfig.name,
    image: `${siteConfig.seo.domain}/images/hero-restaurant.jpg`, // Placeholder
    '@id': siteConfig.seo.domain,
    url: siteConfig.seo.domain,
    telephone: siteConfig.contact.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Am Kurpark 6',
      addressLocality: 'Bad Saarow',
      postalCode: '15526',
      addressCountry: 'DE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: siteConfig.location.lat,
      longitude: siteConfig.location.lng,
    },
    openingHoursSpecification: siteConfig.openingHours
      .filter((h) => h.open !== 'Ruhetag')
      .map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          h.days === 'Mo' ? 'Monday' :
          h.days === 'Di' ? 'Tuesday' :
          h.days === 'Mi' ? 'Wednesday' :
          h.days === 'Do' ? 'Thursday' :
          h.days === 'Fr' ? 'Friday' :
          h.days === 'Sa' ? 'Saturday' : 'Sunday'
        ],
        opens: h.open,
        closes: h.close,
      })),
    servesCuisine: ['Mediterran', 'Aegean', 'Deutsch'],
    priceRange: '€€',
    acceptsReservations: 'true',
    menu: `${siteConfig.seo.domain}/menu`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
    />
  );
};
