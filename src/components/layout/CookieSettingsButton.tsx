'use client';

import React from 'react';
import { openCookieSettings } from '@/lib/cookieConsent';

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => {
        openCookieSettings();
      }}
      className="hover:text-primary-400 transition-colors text-left"
    >
      Cookie-Einstellungen
    </button>
  );
}
