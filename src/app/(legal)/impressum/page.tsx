import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/siteConfig';

export const metadata: Metadata = {
  title: 'Impressum',
  robots: { index: false, follow: true },
};

export default function ImpressumPage() {
  return (
    <div className="pt-16 pb-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto prose prose-primary">
          <h1 className="font-serif text-4xl font-bold text-accent-950 mb-8">Impressum</h1>
          
          <section className="space-y-6 text-accent-800">
            <div>
              <h2 className="text-xl font-bold text-accent-950">Angaben gemäß § 5 TMG</h2>
              <p>
                Carpe Diem bei Ben<br />
                Am Kurpark 6<br />
                15526 Bad Saarow
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-accent-950">Kontakt</h2>
              <p>
                Telefon: {siteConfig.contact.phone}<br />
                E-Mail: {siteConfig.contact.email}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-accent-950">Vertreten durch</h2>
              <p>Ben [Nachname Placeholder]</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-accent-950">Umsatzsteuer-ID</h2>
              <p>
                Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
                DE [USt-ID Placeholder]
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-accent-950">EU-Streitschlichtung</h2>
              <p>
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
                <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-primary-600 underline">
                  https://ec.europa.eu/consumers/odr/
                </a>.<br />
                Unsere E-Mail-Adresse finden Sie oben im Impressum.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-accent-950">Verbraucherstreitbeilegung/Universalschlichtungsstelle</h2>
              <p>
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
