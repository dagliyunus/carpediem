import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Carpe Diem bei Ben',
    short_name: 'Carpe Diem',
    description:
      'Premium Restaurant in Bad Saarow am Kurpark mit mediterraner Küche und Reservierungsmöglichkeit.',
    start_url: '/',
    display: 'standalone',
    background_color: '#050505',
    theme_color: '#050505',
    icons: [
      {
        src: '/images/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/images/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
