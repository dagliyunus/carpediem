export const HOME_PAGE_SLUGS = ['home', 'startseite'] as const;

export function isHomePageSlug(slug: string | null | undefined) {
  if (!slug) return false;
  return HOME_PAGE_SLUGS.includes(slug as (typeof HOME_PAGE_SLUGS)[number]);
}

export function isHomePageTitle(title: string | null | undefined) {
  if (!title) return false;
  const normalized = title.trim().toLowerCase();
  return normalized === 'startseite' || normalized === 'home' || normalized === 'homepage';
}

export function isHomePageRecord(input: {
  slug?: string | null;
  title?: string | null;
}) {
  return isHomePageSlug(input.slug) || isHomePageTitle(input.title);
}
