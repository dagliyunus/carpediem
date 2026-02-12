import { useSyncExternalStore } from 'react';

export type CookieConsent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

const STORAGE_KEY = 'cookie-consent';
const EVENT_NAME = 'carpediem:cookie-consent';

let lastRawConsent: string | null = null;
let lastParsedConsent: CookieConsent | null = null;

function safeParseConsent(raw: string | null): CookieConsent | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsent> | null;
    if (!parsed || parsed.necessary !== true) return null;
    if (typeof parsed.analytics !== 'boolean') return null;
    if (typeof parsed.marketing !== 'boolean') return null;
    return { necessary: true, analytics: parsed.analytics, marketing: parsed.marketing };
  } catch {
    return null;
  }
}

export function getCookieConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === lastRawConsent) return lastParsedConsent;
  lastRawConsent = raw;
  lastParsedConsent = safeParseConsent(raw);
  return lastParsedConsent;
}

export function setCookieConsent(consent: CookieConsent) {
  if (typeof window === 'undefined') return;
  const raw = JSON.stringify(consent);
  lastRawConsent = raw;
  lastParsedConsent = consent;
  window.localStorage.setItem(STORAGE_KEY, raw);
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function clearCookieConsent() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
  lastRawConsent = null;
  lastParsedConsent = null;
  window.dispatchEvent(new Event(EVENT_NAME));
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    onStoreChange();
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(EVENT_NAME, onStoreChange);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(EVENT_NAME, onStoreChange);
  };
}

export function useCookieConsent(): CookieConsent | null {
  return useSyncExternalStore(subscribe, getCookieConsent, () => null);
}
