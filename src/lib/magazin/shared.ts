export const MAGAZIN_POSTS_PER_PAGE = 9;

export const MAGAZIN_CATEGORY_DEFINITIONS = [
  {
    name: 'Gerichte & Zutaten',
    slug: 'gerichte-zutaten',
    introHeadline: 'Gerichte und Zutaten aus dem Carpe Diem in Bad Saarow',
    introContent:
      'In dieser Kategorie zeigen wir Gerichte, Zutaten und kleine Einblicke aus unserer Küche. Wer wissen möchte, was bei uns auf den Teller kommt und was uns geschmacklich wichtig ist, findet hier aktuelle Beiträge aus dem Carpe Diem in Bad Saarow.',
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
      'Hier finden Sie Hinweise zu Live-Musik, besonderen Abenden und Veranstaltungen im Carpe Diem. Die Beiträge geben einen Überblick, was geplant ist und welche Atmosphäre Gäste bei uns erwarten können.',
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
      'Hier teilen wir Neuigkeiten aus dem Restaurant und aus dem direkten Umfeld in Bad Saarow. Dazu gehören Öffnungszeiten, Aktionen, Hinweise für Gäste und aktuelle Entwicklungen rund um unser Haus.',
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
    introHeadline: 'Bad Saarow Tipps für einen entspannten Aufenthalt',
    introContent:
      'Hier sammeln wir Tipps für einen schönen Aufenthalt in Bad Saarow. Ob Kurpark, Therme, Scharmützelsee oder ein ruhiger Spaziergang: Die Beiträge sollen Gästen ganz praktisch dabei helfen, den Tag rund um ihren Besuch im Carpe Diem zu planen.',
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
  'Scharmützelsee',
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
