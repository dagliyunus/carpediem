export const GALLERY_SECTION_KEYS = [
  'gallery_ambiente',
  'gallery_food',
  'gallery_events',
] as const;

export type GallerySectionKey = (typeof GALLERY_SECTION_KEYS)[number];

export type GalleryImageItem = {
  id: string;
  mediaId?: string;
  url?: string;
  altText?: string;
  caption: string;
};

export type GallerySection = {
  key: GallerySectionKey;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  images: GalleryImageItem[];
};

export type GalleryPageSections = {
  introEyebrow: string;
  introTitle: string;
  audienceTitle: string;
  audienceItems: string[];
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  sections: GallerySection[];
};

export const DEFAULT_GALLERY_PAGE_HEADLINE = 'Galerie';

export const DEFAULT_GALLERY_PAGE_SUBHEADLINE =
  'Bilder aus dem Carpe Diem Bad Saarow: Restaurantambiente, mediterrane Gerichte und Eindruecke von Abenden am Kurpark.';

export const DEFAULT_GALLERY_PAGE_BODY =
  'Die Galerie hilft vor allem Gästen, die das Carpe Diem zum ersten Mal entdecken und sich ein Bild von Atmosphäre, Küche und Rahmen machen möchten.\n\nStatt nur eine Bildsammlung zu zeigen, möchten wir einen realistischen Eindruck davon vermitteln, wie sich ein Restaurantbesuch am Kurpark in Bad Saarow bei uns anfühlt.\n\nWer nach einem Abendessen, einem Besuch nach der Therme oder einer Location für einen entspannten Abend sucht, sieht hier sowohl das Ambiente als auch die Küche.';

export const DEFAULT_GALLERY_PAGE_SECTIONS: GalleryPageSections = {
  introEyebrow: 'Lokale Orientierung vor dem Besuch',
  introTitle: 'So sieht ein Restaurantbesuch in Bad Saarow bei uns aus',
  audienceTitle: 'Die Galerie ist besonders hilfreich für',
  audienceItems: [
    'Gäste, die vorab das Restaurantambiente in Bad Saarow sehen möchten',
    'Besucher, die Gerichte und Event-Stimmung vergleichen wollen',
    'Gruppen und Wochenendgaeste mit klarem Reservierungsinteresse',
  ],
  primaryCtaLabel: 'Jetzt reservieren',
  primaryCtaHref: '/reservieren',
  secondaryCtaLabel: 'Speisekarte',
  secondaryCtaHref: '/menu',
  sections: [
    {
      key: 'gallery_ambiente',
      title: 'Ambiente am Kurpark',
      description:
        'Diese Eindrücke zeigen, wie sich ein Besuch im Carpe Diem Bad Saarow anfühlt: außen am Kurpark, im Restaurant selbst und in den Abendstunden. Für viele Gäste ist genau diese Kombination aus Lage, Licht und Atmosphäre ein Grund, ihren Restaurantbesuch in Bad Saarow frühzeitig zu planen.',
      ctaLabel: 'Kontakt & Anfahrt',
      ctaHref: '/kontakt',
      images: [
        {
          id: 'ambiente-inside1',
          url: '/images/Galerie_page/inside1.webp',
          altText: 'Innenbereich des Restaurants',
          caption: 'Innenraum mit Blick auf das Restaurantambiente.',
        },
        {
          id: 'ambiente-outside1',
          url: '/images/Galerie_page/outside1.webp',
          altText: 'Außenansicht des Restaurants',
          caption: 'Außenansicht des Carpe Diem in Bad Saarow.',
        },
        {
          id: 'ambiente-outside2',
          url: '/images/Galerie_page/outside2.webp',
          altText: 'Außenbereich bei Abendstimmung',
          caption: 'Außenbereich am Abend rund um den Kurpark.',
        },
        {
          id: 'ambiente-prosecco',
          url: '/images/Galerie_page/OutsideProsecco.webp',
          altText: 'Prosecco im Außenbereich serviert',
          caption: 'Außenbereich mit Getränkeservice und entspannter Stimmung.',
        },
        {
          id: 'ambiente-visitors1',
          url: '/images/Galerie_page/Visitors1.webp',
          altText: 'Gäste genießen die Atmosphäre im Carpe Diem',
          caption: 'Gäste genießen ihren Aufenthalt im Restaurant.',
        },
      ],
    },
    {
      key: 'gallery_food',
      title: 'Gerichte und mediterrane Küche',
      description:
        'Die Galerie macht sichtbar, wofür Gäste unsere Speisekarte nutzen: Fisch, kreative Hauptgerichte, vegetarische Optionen und klassische Teller mit mediterraner Handschrift. Wer vor der Reservierung sehen möchte, welche Richtung die Küche einschlägt, bekommt hier einen konkreten Eindruck und kann danach direkt in die Speisekarte wechseln.',
      ctaLabel: 'Zur Speisekarte',
      ctaHref: '/menu',
      images: [
        {
          id: 'food-fish2',
          url: '/images/Galerie_page/fish2.webp',
          altText: 'Fischgericht als Spezialität des Hauses',
          caption: 'Fischgericht mit mediterraner Praesentation.',
        },
        {
          id: 'food-fish10',
          url: '/images/Galerie_page/fish10.webp',
          altText: 'Frisch zubereitetes Fischgericht',
          caption: 'Frisch zubereiteter Teller aus der Fischkueche.',
        },
        {
          id: 'food-meal1',
          url: '/images/Galerie_page/meal1.webp',
          altText: 'Kreativ angerichtetes Hauptgericht',
          caption: 'Hauptgericht mit Fokus auf Praesentation und Produktqualitaet.',
        },
        {
          id: 'food-meal2',
          url: '/images/Galerie_page/meal2.webp',
          altText: 'Kulinarische Kreation aus der Küche',
          caption: 'Weitere kulinarische Kreation aus unserer Küche.',
        },
        {
          id: 'food-veggie',
          url: '/images/Galerie_page/veggie.webp',
          altText: 'Frisches vegetarisches Gericht',
          caption: 'Vegetarische Option für leichte und frische Restaurantbesuche.',
        },
      ],
    },
    {
      key: 'gallery_events',
      title: 'Events, Drinks und besondere Momente',
      description:
        'Bad Saarow ist nicht nur ein Ort für Essen, sondern auch für gemeinsame Abende. In diesem Teil der Galerie stehen Event-Momente, Drinks und Details, die häufig rund um Reservierungen, Gruppenbesuche und Wochenendabende gefragt sind. Wenn Sie dazu passende Beiträge lesen möchten, finden Sie mehr im Magazin oder buchen direkt Ihren Tisch.',
      ctaLabel: 'Magazin ansehen',
      ctaHref: '/magazin',
      images: [
        {
          id: 'events-dj',
          url: '/images/Galerie_page/DJ.webp',
          altText: 'DJ bei einem Event im Carpe Diem',
          caption: 'Event-Abend mit DJ im Carpe Diem.',
        },
        {
          id: 'events-champagne',
          url: '/images/Galerie_page/BlacckChampagne.webp',
          altText: 'Champagner-Moment im Ambiente',
          caption: 'Drink- und Champagner-Moment für besondere Anlässe.',
        },
        {
          id: 'events-meatball',
          url: '/images/Galerie_page/meatball.webp',
          altText: 'Hausgemachte Fleischspezialität aus der Küche',
          caption: 'Herzhafte Spezialität für den Abend.',
        },
        {
          id: 'events-suppe',
          url: '/images/Galerie_page/suppe.webp',
          altText: 'Frisch servierte Suppe als Vorspeise',
          caption: 'Vorspeise als Einstieg in den Restaurantbesuch.',
        },
        {
          id: 'events-table-meal',
          url: '/images/Galerie_page/table_meal.webp',
          altText: 'Serviertes Gericht auf dem Tisch',
          caption: 'Servierter Tischmoment mit Blick auf das Gesamterlebnis.',
        },
      ],
    },
  ],
};

export function isGallerySectionKey(value: string): value is GallerySectionKey {
  return GALLERY_SECTION_KEYS.some((key) => key === value);
}

function cloneGalleryImage(image: GalleryImageItem): GalleryImageItem {
  return {
    id: image.id,
    mediaId: image.mediaId,
    url: image.url,
    altText: image.altText,
    caption: image.caption,
  };
}

function cloneGallerySection(section: GallerySection): GallerySection {
  return {
    key: section.key,
    title: section.title,
    description: section.description,
    ctaLabel: section.ctaLabel,
    ctaHref: section.ctaHref,
    images: section.images.map(cloneGalleryImage),
  };
}

export function cloneGalleryPageSections(value: GalleryPageSections = DEFAULT_GALLERY_PAGE_SECTIONS): GalleryPageSections {
  return {
    introEyebrow: value.introEyebrow,
    introTitle: value.introTitle,
    audienceTitle: value.audienceTitle,
    audienceItems: [...value.audienceItems],
    primaryCtaLabel: value.primaryCtaLabel,
    primaryCtaHref: value.primaryCtaHref,
    secondaryCtaLabel: value.secondaryCtaLabel,
    secondaryCtaHref: value.secondaryCtaHref,
    sections: value.sections.map(cloneGallerySection),
  };
}

function normalizeGalleryImage(value: unknown, fallback: GalleryImageItem): GalleryImageItem {
  if (!value || typeof value !== 'object') {
    return cloneGalleryImage(fallback);
  }

  const item = value as Partial<GalleryImageItem>;
  const id = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : fallback.id;
  const mediaId = typeof item.mediaId === 'string' && item.mediaId.trim() ? item.mediaId.trim() : undefined;
  const url = typeof item.url === 'string' && item.url.trim() ? item.url.trim() : undefined;

  if (!mediaId && !url) {
    return cloneGalleryImage(fallback);
  }

  return {
    id,
    mediaId,
    url,
    altText:
      typeof item.altText === 'string'
        ? item.altText
        : fallback.altText,
    caption:
      typeof item.caption === 'string' && item.caption.trim()
        ? item.caption
        : fallback.caption,
  };
}

function normalizeGallerySection(value: unknown, fallback: GallerySection): GallerySection {
  if (!value || typeof value !== 'object') {
    return cloneGallerySection(fallback);
  }

  const item = value as Partial<GallerySection>;
  const images = Array.isArray(item.images)
    ? item.images
        .map((image, index) =>
          normalizeGalleryImage(image, fallback.images[index] || fallback.images[0] || {
            id: `${fallback.key}-${index + 1}`,
            caption: '',
          })
        )
        .filter((image) => image.mediaId || image.url)
    : fallback.images.map(cloneGalleryImage);

  return {
    key: fallback.key,
    title: typeof item.title === 'string' && item.title.trim() ? item.title : fallback.title,
    description:
      typeof item.description === 'string' && item.description.trim()
        ? item.description
        : fallback.description,
    ctaLabel:
      typeof item.ctaLabel === 'string' && item.ctaLabel.trim()
        ? item.ctaLabel
        : fallback.ctaLabel,
    ctaHref:
      typeof item.ctaHref === 'string' && item.ctaHref.trim()
        ? item.ctaHref
        : fallback.ctaHref,
    images,
  };
}

export function normalizeGalleryPageSections(value: unknown): GalleryPageSections {
  if (!value || typeof value !== 'object') {
    return cloneGalleryPageSections();
  }

  const input = value as Partial<GalleryPageSections>;
  const sectionInput = Array.isArray(input.sections) ? input.sections : [];

  return {
    introEyebrow:
      typeof input.introEyebrow === 'string' && input.introEyebrow.trim()
        ? input.introEyebrow
        : DEFAULT_GALLERY_PAGE_SECTIONS.introEyebrow,
    introTitle:
      typeof input.introTitle === 'string' && input.introTitle.trim()
        ? input.introTitle
        : DEFAULT_GALLERY_PAGE_SECTIONS.introTitle,
    audienceTitle:
      typeof input.audienceTitle === 'string' && input.audienceTitle.trim()
        ? input.audienceTitle
        : DEFAULT_GALLERY_PAGE_SECTIONS.audienceTitle,
    audienceItems: Array.isArray(input.audienceItems)
      ? input.audienceItems
          .filter((item): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter(Boolean)
      : [...DEFAULT_GALLERY_PAGE_SECTIONS.audienceItems],
    primaryCtaLabel:
      typeof input.primaryCtaLabel === 'string' && input.primaryCtaLabel.trim()
        ? input.primaryCtaLabel
        : DEFAULT_GALLERY_PAGE_SECTIONS.primaryCtaLabel,
    primaryCtaHref:
      typeof input.primaryCtaHref === 'string' && input.primaryCtaHref.trim()
        ? input.primaryCtaHref
        : DEFAULT_GALLERY_PAGE_SECTIONS.primaryCtaHref,
    secondaryCtaLabel:
      typeof input.secondaryCtaLabel === 'string' && input.secondaryCtaLabel.trim()
        ? input.secondaryCtaLabel
        : DEFAULT_GALLERY_PAGE_SECTIONS.secondaryCtaLabel,
    secondaryCtaHref:
      typeof input.secondaryCtaHref === 'string' && input.secondaryCtaHref.trim()
        ? input.secondaryCtaHref
        : DEFAULT_GALLERY_PAGE_SECTIONS.secondaryCtaHref,
    sections: DEFAULT_GALLERY_PAGE_SECTIONS.sections.map((section) => {
      const matched =
        sectionInput.find(
          (candidate) =>
            candidate &&
            typeof candidate === 'object' &&
            'key' in candidate &&
            candidate.key === section.key
        ) || null;
      return normalizeGallerySection(matched, section);
    }),
  };
}

export function buildGalleryMediaLinks(value: GalleryPageSections) {
  const unique = new Map<string, { mediaId: string; fieldKey: string }>();

  value.sections.forEach((section) => {
    section.images.forEach((image) => {
      if (!image.mediaId) return;
      unique.set(`${image.mediaId}:${section.key}`, {
        mediaId: image.mediaId,
        fieldKey: section.key,
      });
    });
  });

  return Array.from(unique.values());
}
