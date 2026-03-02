export const SITE_LANGUAGES = [
  { code: 'de', label: 'Deutsch', deeplTarget: 'DE' },
  { code: 'en', label: 'English', deeplTarget: 'EN' },
  { code: 'it', label: 'Italiano', deeplTarget: 'IT' },
  { code: 'fr', label: 'Francais', deeplTarget: 'FR' },
  { code: 'es', label: 'Espanol', deeplTarget: 'ES' },
] as const;

export type SiteLanguageCode = (typeof SITE_LANGUAGES)[number]['code'];

export const DEFAULT_SITE_LANGUAGE: SiteLanguageCode = 'de';

export function isSiteLanguageCode(value: string): value is SiteLanguageCode {
  return SITE_LANGUAGES.some((language) => language.code === value);
}

export function getDeepLTargetLanguage(value: SiteLanguageCode) {
  return SITE_LANGUAGES.find((language) => language.code === value)?.deeplTarget ?? 'DE';
}
