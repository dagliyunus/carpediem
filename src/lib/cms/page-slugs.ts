export const HOME_PAGE_SLUGS = ['home', 'startseite'] as const;

export function isHomePageSlug(slug: string | null | undefined) {
  if (!slug) return false;
  return HOME_PAGE_SLUGS.includes(slug as (typeof HOME_PAGE_SLUGS)[number]);
}
