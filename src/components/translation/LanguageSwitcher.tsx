'use client';

import React from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { SITE_LANGUAGES } from '@/lib/translation/languages';
import { useTranslation } from '@/components/translation/TranslationProvider';

export function LanguageSwitcher({ mobile = false }: { mobile?: boolean }) {
  const { enabled, language, setLanguage, isTranslating } = useTranslation();

  return (
    <div
      data-no-translate
      translate="no"
      title={!enabled ? 'DeepL API aktivieren, um weitere Sprachen freizuschalten.' : undefined}
      className={[
        'relative isolate',
        mobile ? 'w-full max-w-xs' : 'w-[170px]',
      ].join(' ')}
    >
      <label className="sr-only" htmlFor={mobile ? 'language-switcher-mobile' : 'language-switcher'}>
        Sprache wählen
      </label>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/55">
        <Globe className="h-4 w-4" aria-hidden="true" />
      </div>
      <select
        id={mobile ? 'language-switcher-mobile' : 'language-switcher'}
        value={language}
        onChange={(event) => setLanguage(event.target.value as (typeof SITE_LANGUAGES)[number]['code'])}
        className={[
          'h-11 w-full appearance-none rounded-full border border-white/15 bg-white/5 pl-11 pr-10 text-sm font-semibold text-white outline-none transition-colors',
          'hover:border-primary-400/40 focus:border-primary-400/60',
          mobile ? 'text-center' : '',
          isTranslating ? 'opacity-80' : '',
        ].join(' ')}
      >
        {SITE_LANGUAGES.map((option) => (
          <option
            key={option.code}
            value={option.code}
            disabled={!enabled && option.code !== 'de'}
            className="bg-neutral-950 text-white"
          >
            {option.label}
            {!enabled && option.code !== 'de' ? ' (DeepL)' : ''}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-white/55">
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </div>
      {!enabled && mobile ? (
        <p className="mt-2 px-2 text-[10px] uppercase tracking-[0.18em] text-white/40">
          Weitere Sprachen werden mit DeepL API aktiviert.
        </p>
      ) : null}
    </div>
  );
}
