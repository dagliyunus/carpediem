import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/siteConfig';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Impressum',
  description: `Impressum von ${siteConfig.name} in Bad Saarow.`,
  path: '/impressum',
  index: false,
  follow: true,
});

export default function ImpressumPage() {
  return (
    <div className="relative z-10 pt-44 md:pt-52 pb-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto rounded-[2rem] border border-white/10 bg-black/45 backdrop-blur-xl p-8 md:p-12 shadow-[0_26px_80px_rgba(0,0,0,0.45)]">
          <div className="space-y-3 mb-10">
            <p className="text-sm md:text-base font-bold uppercase tracking-[0.38em] text-primary-300">Rechtliche Angaben</p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white">Impressum</h1>
            <p className="text-white/75 text-sm">Stand: 23. Februar 2026</p>
          </div>

          <section className="space-y-8 text-white/85 leading-relaxed">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-white">1. Angaben gemaess § 5 DDG</h2>
              <p>
                <strong>{siteConfig.name}</strong><br />
                {siteConfig.location.address}
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-white">2. Kontakt</h2>
              <p>
                Telefon:{' '}
                <a
                  href={`tel:${siteConfig.contact.phone.replace(/\s/g, '')}`}
                  className="text-primary-300 hover:text-primary-200 underline underline-offset-4"
                >
                  {siteConfig.contact.phone}
                </a>
                <br />
                E-Mail:{' '}
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="text-primary-300 hover:text-primary-200 underline underline-offset-4"
                >
                  {siteConfig.contact.email}
                </a>
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-white">3. Inhaltlich verantwortlich</h2>
              <p>
                {siteConfig.legal.proprietor}, Anschrift wie oben.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-white">4. Steuerliche Angaben</h2>
              <p>
                Steuernummer: {siteConfig.legal.steuerNr}
                <br />
                Steuer-Identifikationsnummer: {siteConfig.legal.steuerId}
                <br />
                Umsatzsteuer-Identifikationsnummer: {siteConfig.legal.ustId}
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-white">5. Verbraucherstreitbeilegung (VSBG)</h2>
              <p>
                Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer
                Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-white">6. Hinweis zur EU-Online-Streitbeilegung</h2>
              <p>
                Die fruehere EU-Online-Streitbeilegungsplattform (ODR/OS-Plattform) wurde unionsrechtlich
                eingestellt (Aufhebung der Verordnung (EU) Nr. 524/2013 mit Wirkung zum 20. Juli 2025).
                Eine Beschwerdeeinreichung ueber diese Plattform ist daher nicht mehr moeglich.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-white">7. Haftung fuer Inhalte und Links</h2>
              <p>
                Wir sind fuer eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
                Fuer Inhalte externer Links uebernehmen wir keine Gewaehr; fuer diese Inhalte sind ausschliesslich
                deren Betreiber verantwortlich. Bei Bekanntwerden von Rechtsverletzungen entfernen wir entsprechende
                Inhalte oder Links unverzueglich.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-white">8. Urheberrecht</h2>
              <p>
                Die durch den Seitenbetreiber erstellten Inhalte und Werke auf dieser Website unterliegen dem
                deutschen Urheberrecht. Vervielfaeltigung, Bearbeitung, Verbreitung und jede Art der Verwertung
                ausserhalb der Grenzen des Urheberrechts beduerfen der vorherigen schriftlichen Zustimmung des
                jeweiligen Rechteinhabers.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
