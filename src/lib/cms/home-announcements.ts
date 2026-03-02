type GenericSectionItem = {
  title?: string;
  text?: string;
};

export type HomeAnnouncementItem = {
  id: string;
  label: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  isEnabled: boolean;
  mediaId?: string | null;
  altText: string;
};

export type HomeAnnouncementSection = {
  isEnabled: boolean;
  eyebrow: string;
  title: string;
  description: string;
  items: HomeAnnouncementItem[];
};

export type HomePageSections = {
  announcementSection: HomeAnnouncementSection;
  contentSections: GenericSectionItem[];
};

const DEFAULT_SECTION_EYEBROW = 'Aktuelle Ankündigungen';
const DEFAULT_SECTION_TITLE = 'Besondere Abende, Events und wichtige Hinweise';
const DEFAULT_SECTION_DESCRIPTION =
  'Platz für aktuelle Veranstaltungsankündigungen, exklusive Menüs oder zeitlich begrenzte Hinweise direkt auf der Startseite.';

function asRecord(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeGenericSections(value: unknown): GenericSectionItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const record = asRecord(item);
      if (!record) return null;

      return {
        title: typeof record.title === 'string' ? record.title : '',
        text: typeof record.text === 'string' ? record.text : '',
      };
    })
    .filter(Boolean) as GenericSectionItem[];
}

function normalizeAnnouncementItem(value: unknown, index: number): HomeAnnouncementItem | null {
  const record = asRecord(value);
  if (!record) return null;

  return {
    id:
      typeof record.id === 'string' && record.id.trim()
        ? record.id.trim()
        : `announcement-${index + 1}`,
    label: typeof record.label === 'string' ? record.label : '',
    title: typeof record.title === 'string' ? record.title : '',
    body: typeof record.body === 'string' ? record.body : '',
    ctaLabel: typeof record.ctaLabel === 'string' ? record.ctaLabel : '',
    ctaHref: typeof record.ctaHref === 'string' ? record.ctaHref : '',
    isEnabled: record.isEnabled !== false,
    mediaId:
      typeof record.mediaId === 'string' && record.mediaId.trim() ? record.mediaId.trim() : null,
    altText: typeof record.altText === 'string' ? record.altText : '',
  };
}

function normalizeAnnouncementSection(value: unknown): HomeAnnouncementSection {
  const record = asRecord(value);
  const itemsSource = record?.items;

  return {
    isEnabled: record?.isEnabled !== false,
    eyebrow:
      typeof record?.eyebrow === 'string' && record.eyebrow.trim()
        ? record.eyebrow
        : DEFAULT_SECTION_EYEBROW,
    title:
      typeof record?.title === 'string' && record.title.trim()
        ? record.title
        : DEFAULT_SECTION_TITLE,
    description:
      typeof record?.description === 'string' && record.description.trim()
        ? record.description
        : DEFAULT_SECTION_DESCRIPTION,
    items: Array.isArray(itemsSource)
      ? itemsSource
          .map((item, index) => normalizeAnnouncementItem(item, index))
          .filter(Boolean) as HomeAnnouncementItem[]
      : [],
  };
}

export function normalizeHomePageSections(value: unknown): HomePageSections {
  if (Array.isArray(value)) {
    return {
      announcementSection: normalizeAnnouncementSection(null),
      contentSections: normalizeGenericSections(value),
    };
  }

  const record = asRecord(value);
  if (!record) {
    return {
      announcementSection: normalizeAnnouncementSection(null),
      contentSections: [],
    };
  }

  return {
    announcementSection: normalizeAnnouncementSection(record.announcementSection),
    contentSections: normalizeGenericSections(record.contentSections),
  };
}

export function cloneHomePageSections(value?: HomePageSections): HomePageSections {
  const source = value || normalizeHomePageSections(null);

  return {
    announcementSection: {
      ...source.announcementSection,
      items: source.announcementSection.items.map((item) => ({ ...item })),
    },
    contentSections: source.contentSections.map((item) => ({ ...item })),
  };
}

export function createHomeAnnouncementId() {
  return `announcement-${Math.random().toString(36).slice(2, 10)}`;
}

export function getHomeAnnouncementFieldKey(itemId: string) {
  return `home_announcement_${itemId}`;
}

export function isHomeAnnouncementFieldKey(fieldKey: string) {
  return fieldKey.startsWith('home_announcement_');
}

export function buildHomeAnnouncementMediaLinks(sections: HomePageSections) {
  return sections.announcementSection.items
    .filter((item) => Boolean(item.mediaId))
    .map((item) => ({
      mediaId: item.mediaId!,
      fieldKey: getHomeAnnouncementFieldKey(item.id),
    }));
}
