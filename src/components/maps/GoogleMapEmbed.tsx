'use client';

import React from 'react';
import { setCookieConsent, useCookieConsent } from '@/lib/cookieConsent';

type GoogleMapEmbedProps = {
  address: string;
  className?: string;
  heightClassName?: string;
  title?: string;
};

export function GoogleMapEmbed({
  address,
  className,
  heightClassName = 'h-[420px]',
  title = 'Karte',
}: GoogleMapEmbedProps) {
  const consent = useCookieConsent();
  const hasMarketingConsent = consent?.marketing === true;
  const src = `https://www.google.com/maps?q=${encodeURIComponent(address)}&t=k&output=embed`;
  const mapsDirectionUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  const handleEnableExternalMedia = () => {
    setCookieConsent({
      necessary: true,
      analytics: consent?.analytics === true,
      marketing: true,
    });
  };

  return (
    <div className={['relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl', className ?? ''].join(' ')}>
      <div className={['relative w-full', heightClassName].join(' ')}>
        {hasMarketingConsent ? (
          <iframe
            title={title}
            src={src}
            className="absolute inset-0 h-full w-full opacity-90 saturate-[0.8] contrast-[1.1]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70 p-6 text-center">
            <p className="max-w-md text-sm leading-relaxed text-white/85">
              Diese Karte wird erst nach Ihrer Einwilligung in externe Medien geladen.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleEnableExternalMedia}
                className="rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
              >
                Externe Medien erlauben
              </button>
              <a
                href={mapsDirectionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Route in Google Maps öffnen
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
    </div>
  );
}
