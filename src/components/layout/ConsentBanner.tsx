'use client';

import React from 'react';
import { setCookieConsent, useCookieConsent } from '@/lib/cookieConsent';

export const ConsentBanner = () => {
  const consent = useCookieConsent();

  const handleAcceptNecessary = () => {
    setCookieConsent({ necessary: true, analytics: false, marketing: false });
  };

  const handleAcceptAll = () => {
    setCookieConsent({ necessary: true, analytics: true, marketing: true });
  };

  if (consent) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative flex min-h-full items-end justify-center p-4 md:items-center md:p-8">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Datenschutz-Einstellungen"
          className="w-full max-w-xl rounded-3xl border border-white/10 bg-background/95 backdrop-blur-2xl shadow-2xl ring-1 ring-white/5"
        >
          <div className="p-6 md:p-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-white tracking-tight">
                  Datenschutz-Einstellungen
                </h2>
                <p className="text-sm md:text-base text-white/70 leading-relaxed">
                  Wir verwenden Cookies, um Ihre Erfahrung zu verbessern und den Traffic zu analysieren.
                </p>
                <p className="text-sm text-white/60 leading-relaxed">
                  Mehr Informationen in unserer{' '}
                  <a href="/datenschutz" className="underline hover:text-primary-400 transition-colors">
                    Datenschutzerklärung
                  </a>
                  .
                </p>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <button
                  onClick={handleAcceptNecessary}
                  className="w-full md:flex-1 px-6 py-3 text-sm font-semibold text-white rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition-colors active:scale-[0.99]"
                >
                  Nur Notwendige
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="w-full md:flex-1 px-6 py-3 text-sm font-semibold bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-all shadow-md active:scale-[0.99]"
                >
                  Alle akzeptieren
                </button>
              </div>

              <div className="text-xs text-white/40 leading-relaxed">
                Sie können Ihre Auswahl jederzeit über „Cookie-Einstellungen“ ändern.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
