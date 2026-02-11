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
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 bg-background border-t border-primary-200 md:bg-background/95 md:backdrop-blur-lg md:shadow-2xl">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1 space-y-2">
            <h3 className="font-serif text-lg font-bold text-primary-900">Datenschutz-Einstellungen</h3>
            <p className="hidden md:block text-sm text-primary-800 leading-relaxed">
              Wir verwenden Cookies, um Ihre Erfahrung zu verbessern und den Traffic zu analysieren. 
              Weitere Informationen finden Sie in unserer{' '}
              <a href="/datenschutz" className="underline hover:text-primary-600 transition-colors">
                Datenschutzerklärung
              </a>.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button
              onClick={handleAcceptNecessary}
              className="flex-1 md:flex-none px-6 py-2.5 text-sm font-medium border border-primary-300 rounded-full hover:bg-primary-50 transition-colors"
            >
              Nur Notwendige
            </button>
            <button
              onClick={handleAcceptAll}
              className="flex-1 md:flex-none px-6 py-2.5 text-sm font-medium bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-all shadow-md active:scale-95"
            >
              Alle akzeptieren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
