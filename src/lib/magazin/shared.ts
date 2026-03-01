export const MAGAZIN_POSTS_PER_PAGE = 9;

export const MAGAZIN_CATEGORY_DEFINITIONS = [
  {
    name: 'Gerichte & Zutaten',
    slug: 'gerichte-zutaten',
    introHeadline: 'Gerichte und Zutaten aus dem Carpe Diem in Bad Saarow',
    introContent:
      'Hier zeigen wir mediterrane Teller, saisonale Zutaten und kulinarische Ideen aus unserer Kueche in Bad Saarow. Wer nach Restaurant-Inspiration, frischem Fisch, Grillgerichten oder besonderen Aromen sucht, findet hier regelmaessig neue Einblicke.',
    introPrimaryCtaLabel: 'Jetzt reservieren',
    introPrimaryCtaHref: '/reservieren',
    introSecondaryCtaLabel: 'Speisekarte ansehen',
    introSecondaryCtaHref: '/menu',
    introIsEnabled: true,
    keywordHints: ['gericht', 'gerichte', 'zutat', 'zutaten', 'speise', 'speisen', 'kueche', 'fisch', 'grill', 'rezept', 'menu', 'menue'],
  },
  {
    name: 'Events & Live-Musik',
    slug: 'events-live-musik',
    introHeadline: 'Events und Live-Musik in Bad Saarow',
    introContent:
      'Diese Kategorie sammelt Hinweise zu Live-Musik, Eventabenden und besonderen Restaurant-Momenten im Carpe Diem Bad Saarow. Ideal fuer alle, die Essen, Drinks und lokale Abendstimmung am Kurpark verbinden moechten.',
    introPrimaryCtaLabel: 'Tisch reservieren',
    introPrimaryCtaHref: '/reservieren',
    introSecondaryCtaLabel: 'Kontakt aufnehmen',
    introSecondaryCtaHref: '/kontakt',
    introIsEnabled: true,
    keywordHints: ['event', 'events', 'live', 'musik', 'dj', 'konzert', 'abend', 'veranstaltung'],
  },
  {
    name: 'News',
    slug: 'news',
    introHeadline: 'News aus dem Carpe Diem und aus Bad Saarow',
    introContent:
      'Hier erscheinen Neuigkeiten aus dem Restaurant sowie relevante Meldungen aus dem direkten Umfeld von Bad Saarow. Der Fokus bleibt lokal: Oeffnungszeiten, Aktionen, Kooperationen und Entwicklungen rund um unser Haus und die Umgebung.',
    introPrimaryCtaLabel: 'Kontakt',
    introPrimaryCtaHref: '/kontakt',
    introSecondaryCtaLabel: 'Reservieren',
    introSecondaryCtaHref: '/reservieren',
    introIsEnabled: true,
    keywordHints: ['news', 'neu', 'neuigkeit', 'ankuendigung', 'update', 'bad saarow', 'umgebung'],
  },
  {
    name: 'Bad Saarow Tipps',
    slug: 'bad-saarow-tipps',
    introHeadline: 'Bad Saarow Tipps fuer Genuss, Ausflug und lokale Entdeckungen',
    introContent:
      'Diese SEO-Landingpage verbindet lokale Tipps in Bad Saarow mit Restaurant-Intent. Ob Saarow Therme, Kurpark, Scharmuetzelsee oder Tagesausflug: Hier finden Gaeste Ideen, was sich vor oder nach dem Essen im Carpe Diem entdecken laesst.',
    introPrimaryCtaLabel: 'Jetzt reservieren',
    introPrimaryCtaHref: '/reservieren',
    introSecondaryCtaLabel: 'Kontakt aufnehmen',
    introSecondaryCtaHref: '/kontakt',
    introIsEnabled: true,
    keywordHints: ['bad saarow', 'saarow therme', 'kurpark', 'scharmuetzelsee', 'ausflug', 'tipps', 'umgebung'],
  },
] as const;

export const BAD_SAAROW_TIPPS_CATEGORY_SLUG = 'bad-saarow-tipps';
export const BAD_SAAROW_TIPPS_CATEGORY_NAME = 'Bad Saarow Tipps';

export const LOCATION_FOCUS_SUGGESTIONS = [
  'Saarow Therme',
  'Kurpark Bad Saarow',
  'Scharmuetzelsee',
  'Theater am See',
  'Bahnhof Bad Saarow',
  'Seestrasse Bad Saarow',
  'Kurparksteg',
  'Bad Saarow Zentrum',
];

export function getMagazinCategoryDefinitionBySlug(slug: string) {
  return MAGAZIN_CATEGORY_DEFINITIONS.find((item) => item.slug === slug) || null;
}

export function getMagazinCategoryDefinitionByName(name: string) {
  return MAGAZIN_CATEGORY_DEFINITIONS.find((item) => item.name === name) || null;
}

export function getDefaultMagazinCategory() {
  return MAGAZIN_CATEGORY_DEFINITIONS[2];
}

export function inferMagazinCategory(input: { title: string; excerpt?: string | null; content: string }) {
  const merged = `${input.title} ${input.excerpt || ''} ${input.content}`.toLowerCase();

  const matched =
    MAGAZIN_CATEGORY_DEFINITIONS.find((category) =>
      category.keywordHints.some((keyword) => merged.includes(keyword))
    ) || getDefaultMagazinCategory();

  return matched;
}

export function isBadSaarowTippsCategory(categoryName?: string | null, categorySlug?: string | null) {
  return categoryName === BAD_SAAROW_TIPPS_CATEGORY_NAME || categorySlug === BAD_SAAROW_TIPPS_CATEGORY_SLUG;
}
