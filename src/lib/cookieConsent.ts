import { useSyncExternalStore } from 'react';

export type CookieConsent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

const STORAGE_KEY = 'cookie-consent';
const EVENT_NAME = 'carpediem:cookie-consent';

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
  return safeParseConsent(window.localStorage.getItem(STORAGE_KEY));
}

export function setCookieConsent(consent: CookieConsent) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function clearCookieConsent() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
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
