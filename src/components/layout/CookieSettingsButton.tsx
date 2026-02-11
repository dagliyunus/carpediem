'use client';

import React from 'react';
import { clearCookieConsent } from '@/lib/cookieConsent';

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => {
        clearCookieConsent();
      }}
      className="hover:text-primary-400 transition-colors text-left"
    >
      Cookie-Einstellungen
    </button>
  );
}
