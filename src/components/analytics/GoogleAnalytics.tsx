'use client';

import Script from 'next/script';
import { useCookieConsent } from '@/lib/cookieConsent';

export const GoogleAnalytics = ({ ga4Id }: { ga4Id?: string | null }) => {
  const consent = useCookieConsent();

  if (!consent?.analytics || !ga4Id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${ga4Id}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
};
