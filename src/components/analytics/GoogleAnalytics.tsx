'use client';

import Script from 'next/script';
import { siteConfig } from '@/config/siteConfig';
import { useCookieConsent } from '@/lib/cookieConsent';

export const GoogleAnalytics = () => {
  const consent = useCookieConsent();

  if (!consent?.analytics || !siteConfig.tracking.ga4Id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${siteConfig.tracking.ga4Id}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${siteConfig.tracking.ga4Id}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
};
