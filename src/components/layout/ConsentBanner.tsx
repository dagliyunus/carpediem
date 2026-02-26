'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import {
  OPEN_SETTINGS_EVENT_NAME,
  getCookieConsent,
  setCookieConsent,
  useCookieConsent,
} from '@/lib/cookieConsent';

type PreferenceToggleProps = {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onToggle?: () => void;
};

function PreferenceToggle({
  label,
  description,
  checked,
  disabled = false,
  onToggle,
}: PreferenceToggleProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
      <div className="flex items-start gap-4">
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm md:text-base font-semibold text-white">{label}</h3>
            {disabled ? (
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/65">
                Immer aktiv
              </span>
            ) : null}
          </div>
          <p className="text-xs md:text-sm text-white/65 leading-relaxed">{description}</p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          disabled={disabled}
          onClick={onToggle}
          className={[
            'relative h-7 w-12 shrink-0 rounded-full border transition-all duration-200',
            checked ? 'border-primary-300 bg-primary-500/80' : 'border-white/20 bg-white/10',
            disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-[1.02]',
          ].join(' ')}
        >
          <span
            className={[
              'absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-md transition-transform duration-200',
              checked ? 'translate-x-6' : 'translate-x-1',
            ].join(' ')}
          />
        </button>
      </div>
    </div>
  );
}

export const ConsentBanner = () => {
  const consent = useCookieConsent();
  const [isOpen, setIsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    const handleOpenSettings = () => {
      const currentConsent = getCookieConsent();
      setAnalytics(currentConsent?.analytics ?? false);
      setMarketing(currentConsent?.marketing ?? false);
      setIsOpen(true);
    };

    window.addEventListener(OPEN_SETTINGS_EVENT_NAME, handleOpenSettings);
    return () => {
      window.removeEventListener(OPEN_SETTINGS_EVENT_NAME, handleOpenSettings);
    };
  }, []);

  const applyConsent = (nextAnalytics: boolean, nextMarketing: boolean) => {
    setCookieConsent({ necessary: true, analytics: nextAnalytics, marketing: nextMarketing });
    setIsOpen(false);
  };

  const handleAcceptNecessary = () => {
    setAnalytics(false);
    setMarketing(false);
    applyConsent(false, false);
  };

  const handleSaveSelection = () => {
    applyConsent(analytics, marketing);
  };

  const handleAcceptAll = () => {
    setAnalytics(true);
    setMarketing(true);
    applyConsent(true, true);
  };

  const canClose = Boolean(consent);
  const mustChoose = !consent;

  if (!isClient) return null;
  if (!mustChoose && !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative flex min-h-full items-end justify-center p-4 md:items-center md:p-8">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Datenschutz-Einstellungen"
          className="w-full max-w-2xl rounded-3xl border border-white/10 bg-background/95 backdrop-blur-2xl shadow-2xl ring-1 ring-white/5"
        >
          <div className="p-6 md:p-8 space-y-6">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-white tracking-tight">
                  Datenschutz-Einstellungen
                </h2>
                {canClose ? (
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="Einstellungen schließen"
                  >
                    ×
                  </button>
                ) : null}
              </div>
              <p className="text-sm md:text-base text-white/70 leading-relaxed">
                Wählen Sie aus, welche Kategorien Sie erlauben möchten. Notwendige Technologien sind für den Betrieb
                der Website erforderlich und können nicht deaktiviert werden.
              </p>
              <p className="text-sm text-white/60 leading-relaxed">
                Mehr Informationen in unserer{' '}
                <a href="/datenschutz" className="underline hover:text-primary-400 transition-colors">
                  Datenschutzerklärung
                </a>
                .
              </p>
            </div>

            <div className="space-y-3">
              <PreferenceToggle
                label="Notwendige Technologien"
                description="Erforderlich für Kernfunktionen wie Sicherheit, Seitennavigation und Speicherung Ihrer Datenschutzauswahl."
                checked
                disabled
              />
              <PreferenceToggle
                label="Analytics"
                description="Hilft uns, die Nutzung der Website zu verstehen und Inhalte zu verbessern."
                checked={analytics}
                onToggle={() => setAnalytics((value) => !value)}
              />
              <PreferenceToggle
                label="Marketing / Externe Medien"
                description="Ermöglicht das Laden externer Inhalte wie Google Maps."
                checked={marketing}
                onToggle={() => setMarketing((value) => !value)}
              />
            </div>

            <div className="grid gap-3 pt-1 md:grid-cols-3">
              <button
                type="button"
                onClick={handleAcceptNecessary}
                className="w-full rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 active:scale-[0.99]"
              >
                Nur notwendige
              </button>
              <button
                type="button"
                onClick={handleSaveSelection}
                className="w-full rounded-full border border-primary-300/40 bg-primary-500/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-500/30 active:scale-[0.99]"
              >
                Auswahl speichern
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="w-full rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-primary-700 active:scale-[0.99]"
              >
                Alle akzeptieren
              </button>
            </div>

            <div className="text-xs text-white/40 leading-relaxed">
              Sie können Ihre Auswahl jederzeit über „Cookie-Einstellungen“ im Footer ändern.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
