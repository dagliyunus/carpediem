'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from 'react';
import { usePathname } from 'next/navigation';
import { DEFAULT_SITE_LANGUAGE, SITE_LANGUAGES, SiteLanguageCode, isSiteLanguageCode } from '@/lib/translation/languages';

type TranslationContextValue = {
  enabled: boolean;
  language: SiteLanguageCode;
  setLanguage: (value: SiteLanguageCode) => void;
  isTranslating: boolean;
};

const STORAGE_KEY = 'carpediem-site-language';
const MAX_BATCH_TEXTS = 40;
const MAX_BATCH_BYTES = 80 * 1024;
const translatableAttributes = ['placeholder', 'aria-label', 'title'] as const;
const skippableTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'OPTION']);
const translationMemory = new Map<string, string>();

const TranslationContext = createContext<TranslationContextValue | null>(null);

type TrackedAttribute = {
  element: Element;
  attribute: (typeof translatableAttributes)[number];
  original: string;
};

function hasTranslatableText(value: string) {
  return /\p{L}/u.test(value) && !/^[\s@/.:,+\-()0-9]+$/u.test(value.trim());
}

function shouldSkipElement(element: Element | null) {
  if (!element) return true;
  if (skippableTags.has(element.tagName)) return true;
  if (element.closest('[data-no-translate], .notranslate, [translate="no"]')) return true;
  if (element instanceof HTMLElement && element.isContentEditable) return true;
  return false;
}

function splitOuterWhitespace(value: string) {
  const leading = value.match(/^\s*/)?.[0] ?? '';
  const trailing = value.match(/\s*$/)?.[0] ?? '';
  return {
    leading,
    trailing,
    core: value.trim(),
  };
}

function getUtf8Bytes(value: string) {
  return new TextEncoder().encode(value).length;
}

async function requestTranslations(texts: string[], targetLanguage: SiteLanguageCode, signal: AbortSignal) {
  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ texts, targetLanguage }),
    signal,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error || 'Translation failed');
  }

  const payload = (await response.json()) as { translations: string[] };
  return payload.translations;
}

export function TranslationProvider({
  children,
  enabled,
}: {
  children: React.ReactNode;
  enabled: boolean;
}) {
  const pathname = usePathname();
  const [language, setLanguageState] = useState<SiteLanguageCode>(DEFAULT_SITE_LANGUAGE);
  const [isTranslating, setIsTranslating] = useState(false);
  const trackedTextNodesRef = useRef(new Map<Text, string>());
  const trackedAttributesRef = useRef<TrackedAttribute[]>([]);
  const originalTitleRef = useRef<string | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const applyTimeoutRef = useRef<number | null>(null);
  const isApplyingRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && isSiteLanguageCode(stored)) {
      setLanguageState(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    if (enabled || language === 'de') return;
    setLanguageState('de');
  }, [enabled, language]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const restoreTrackedContent = useEffectEvent(() => {
    for (const [node, original] of trackedTextNodesRef.current.entries()) {
      if (!node.isConnected) {
        trackedTextNodesRef.current.delete(node);
        continue;
      }
      node.nodeValue = original;
    }

    trackedAttributesRef.current = trackedAttributesRef.current.filter((entry) => {
      if (!entry.element.isConnected) return false;
      entry.element.setAttribute(entry.attribute, entry.original);
      return true;
    });

    if (originalTitleRef.current !== null) {
      document.title = originalTitleRef.current;
    }
  });

  const collectTargets = useEffectEvent(() => {
    const texts: Array<{ node: Text; original: string }> = [];
    const attributes: TrackedAttribute[] = [];
    const root = document.body;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      const parent = node.parentElement;
      const currentValue = node.nodeValue ?? '';

      if (!parent || shouldSkipElement(parent) || !hasTranslatableText(currentValue)) {
        continue;
      }

      const original = trackedTextNodesRef.current.get(node) ?? currentValue;
      trackedTextNodesRef.current.set(node, original);
      texts.push({ node, original });
    }

    const elements = Array.from(document.body.querySelectorAll<HTMLElement>('*'));
    for (const element of elements) {
      if (shouldSkipElement(element)) continue;

      for (const attribute of translatableAttributes) {
        const currentValue = element.getAttribute(attribute);
        if (!currentValue || !hasTranslatableText(currentValue)) continue;

        const existing = trackedAttributesRef.current.find(
          (entry) => entry.element === element && entry.attribute === attribute,
        );
        const original = existing?.original ?? currentValue;

        if (!existing) {
          const entry: TrackedAttribute = { element, attribute, original };
          trackedAttributesRef.current.push(entry);
          attributes.push(entry);
          continue;
        }

        attributes.push({ element, attribute, original });
      }
    }

    if (originalTitleRef.current === null) {
      originalTitleRef.current = document.title;
    }

    return { texts, attributes, title: originalTitleRef.current ?? document.title };
  });

  const applyTranslations = useEffectEvent(async (targetLanguage: SiteLanguageCode, signal: AbortSignal) => {
    if (!enabled || targetLanguage === 'de' || pathname.startsWith('/admin')) {
      restoreTrackedContent();
      setIsTranslating(false);
      return;
    }

    isApplyingRef.current = true;
    setIsTranslating(true);
    restoreTrackedContent();

    try {
      const { texts, attributes, title } = collectTargets();
      const originals = new Set<string>();

      for (const item of texts) originals.add(item.original);
      for (const item of attributes) originals.add(item.original);
      if (hasTranslatableText(title)) originals.add(title);

      const uncached = Array.from(originals).filter(
        (text) => !translationMemory.has(`${targetLanguage}:${text}`),
      );

      let batch: string[] = [];
      let batchBytes = 0;

      const flushBatch = async () => {
        if (batch.length === 0) return;
        const translations = await requestTranslations(batch, targetLanguage, signal);
        batch.forEach((text, index) => {
          translationMemory.set(`${targetLanguage}:${text}`, translations[index] ?? text);
        });
        batch = [];
        batchBytes = 0;
      };

      for (const text of uncached) {
        const nextBytes = getUtf8Bytes(text);
        if (batch.length >= MAX_BATCH_TEXTS || batchBytes + nextBytes > MAX_BATCH_BYTES) {
          await flushBatch();
        }
        batch.push(text);
        batchBytes += nextBytes;
      }

      await flushBatch();

      for (const item of texts) {
        const { leading, trailing, core } = splitOuterWhitespace(item.original);
        const translated = translationMemory.get(`${targetLanguage}:${item.original}`)
          ?? translationMemory.get(`${targetLanguage}:${core}`)
          ?? item.original;
        item.node.nodeValue = `${leading}${translated.trim()}${trailing}`;
      }

      for (const item of attributes) {
        const translated = translationMemory.get(`${targetLanguage}:${item.original}`) ?? item.original;
        item.element.setAttribute(item.attribute, translated);
      }

      if (hasTranslatableText(title)) {
        document.title = translationMemory.get(`${targetLanguage}:${title}`) ?? title;
      }
    } finally {
      isApplyingRef.current = false;
      setIsTranslating(false);
    }
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const controller = new AbortController();
    const scheduleApply = () => {
      if (applyTimeoutRef.current !== null) {
        window.clearTimeout(applyTimeoutRef.current);
      }

      applyTimeoutRef.current = window.setTimeout(() => {
        void applyTranslations(language, controller.signal).catch((error) => {
          if (!controller.signal.aborted) {
            console.error('Site translation failed', error);
            restoreTrackedContent();
            setIsTranslating(false);
          }
        });
      }, 80);
    };

    scheduleApply();

    if (!pathname.startsWith('/admin')) {
      observerRef.current?.disconnect();
      observerRef.current = new MutationObserver(() => {
        if (isApplyingRef.current || language === 'de') return;
        scheduleApply();
      });
      observerRef.current.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: false,
      });
    }

    return () => {
      controller.abort();
      observerRef.current?.disconnect();
      observerRef.current = null;
      if (applyTimeoutRef.current !== null) {
        window.clearTimeout(applyTimeoutRef.current);
        applyTimeoutRef.current = null;
      }
    };
  }, [enabled, language, pathname]);

  const value = useMemo<TranslationContextValue>(
    () => ({
      enabled,
      language,
      setLanguage: setLanguageState,
      isTranslating,
    }),
    [enabled, language, isTranslating],
  );

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
}

export function getLanguageLabel(code: SiteLanguageCode) {
  return SITE_LANGUAGES.find((language) => language.code === code)?.label ?? 'Deutsch';
}
