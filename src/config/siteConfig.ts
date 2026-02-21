export type ReservationMode = 'EMBED' | 'NATIVE';

export const siteConfig = {
  name: 'Carpe Diem bei Ben',
  location: {
    address: 'Am Kurpark 6, 15526 Bad Saarow, Deutschland',
    lat: 52.2889,
    lng: 14.0628,
  },
  openingHours: [
    { days: 'Mo', open: '12:00', close: '20:00' },
    { days: 'Di', open: 'Ruhetag', close: 'Ruhetag' },
    { days: 'Mi', open: 'Ruhetag', close: 'Ruhetag' },
    { days: 'Do', open: '12:00', close: '20:00' },
    { days: 'Fr', open: '12:00', close: '20:00' },
    { days: 'Sa', open: '12:00', close: '20:00' },
    { days: 'So', open: '12:00', close: '20:00' },
  ],
  contact: {
    phone: '+49 33631 123456', // Placeholder
    email: 'info@carpediem-badsaarow.de', // Placeholder
    socials: {
      instagram: 'https://instagram.com/carpediembadsaarow',
      facebook: 'https://facebook.com/carpediem_badsaarow',
      tiktok: 'https://tiktok.com/@carpediem_badsaarow',
      pinterest: 'https://pinterest.com/carpediembadsaarow',
    },
  },
  reservations: {
    mode: 'NATIVE' as ReservationMode,
    embedUrl: 'https://booking-widget.example.com',
    policies: {
      cancellation: 'Stornierungen sind bis zu 2 Stunden vor dem Termin kostenfrei möglich.',
      noShow: 'Bei Nichterscheinen ohne Absage behalten wir uns vor, den Tisch nach 15 Minuten freizugeben.',
    },
  },
  seo: {
    domain: 'https://carpediem-badsaarow.de',
    titleTemplate: '%s | Carpe Diem bei Ben - Restaurant Bad Saarow',
    defaultDescription: 'Premium Restaurant in Bad Saarow am Kurpark. Genießen Sie mediterrane Küche direkt an der Therme. Jetzt Tisch reservieren!',
  },
  tracking: {
    gtmId: '', // G-XXXXXX
    ga4Id: '', // G-XXXXXX
    metaPixelId: '',
    googleAdsId: '',
  },
  menu: {
    pdfUrl: '/menus/menu-2024.pdf',
    drinksPdfUrl: '/menus/drinks-2024.pdf',
  },
};
