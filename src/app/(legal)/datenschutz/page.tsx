import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/siteConfig';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Datenschutzerklärung',
  description: `Datenschutzhinweise von ${siteConfig.name} gemäß DSGVO.`,
  path: '/datenschutz',
  index: false,
  follow: true,
});

export default function DatenschutzPage() {
  return (
    <div className="relative z-10 pt-44 md:pt-52 pb-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto rounded-[2rem] border border-white/10 bg-black/45 backdrop-blur-xl p-8 md:p-12 shadow-[0_26px_80px_rgba(0,0,0,0.45)]">
          <div className="space-y-3 mb-10">
            <p className="text-sm md:text-base font-bold uppercase tracking-[0.38em] text-primary-300">Datenschutz</p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white">Datenschutzerklaerung</h1>
            <p className="text-white/75 text-sm">Stand: 23. Februar 2026</p>
          </div>

          <div className="space-y-9 text-white/85 text-[15px] leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">1. Verantwortlicher</h2>
              <p>
                Verantwortlich fuer die Datenverarbeitung auf dieser Website ist:
                <br />
                <strong>{siteConfig.name}</strong>
                <br />
                {siteConfig.location.address}
                <br />
                E-Mail:{' '}
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="text-primary-300 hover:text-primary-200 underline underline-offset-4"
                >
                  {siteConfig.contact.email}
                </a>
                <br />
                Telefon:{' '}
                <a
                  href={`tel:${siteConfig.contact.phone.replace(/\s/g, '')}`}
                  className="text-primary-300 hover:text-primary-200 underline underline-offset-4"
                >
                  {siteConfig.contact.phone}
                </a>
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">2. Hosting und Server-Logfiles</h2>
              <p>
                Diese Website wird ueber Vercel gehostet. Beim Aufruf der Website werden technisch erforderliche
                Verbindungsdaten verarbeitet (z. B. IP-Adresse, Datum/Uhrzeit, angeforderte Ressource, Browser- und
                Systeminformationen, Referrer, Statuscodes), um den sicheren und stabilen Betrieb zu gewaehrleisten.
              </p>
              <p>
                Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Sicherheit und
                Betriebsstabilitaet). Sofern ein Vertrag betroffen ist, ist zusaetzlich Art. 6 Abs. 1 lit. b DSGVO
                einschlaegig.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">3. Kontaktformular</h2>
              <p>
                Bei Kontaktanfragen verarbeiten wir Name, E-Mail-Adresse, Betreff und Nachricht sowie
                sicherheitsrelevante Metadaten (z. B. IP-Adresse/Rate-Limit-Informationen), um Ihre Anfrage zu
                beantworten und Missbrauch zu verhindern.
              </p>
              <p>
                Rechtsgrundlagen: Art. 6 Abs. 1 lit. b DSGVO (Anbahnung/Erfuellung eines Vertrags), Art. 6 Abs. 1 lit.
                f DSGVO (Missbrauchs- und Sicherheitsabwehr). Wenn ein CONTACT_WEBHOOK_URL konfiguriert ist, wird die
                Anfrage an den dort hinterlegten Empfaenger weitergeleitet.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">4. Tischreservierungen</h2>
              <p>
                Bei Reservierungen verarbeiten wir Datum, Uhrzeit, Personenzahl, Name, E-Mail-Adresse, Telefonnummer und
                optionale Anmerkungen. Diese Daten sind erforderlich, um Reservierungen anzunehmen und zu bestaetigen.
              </p>
              <p>
                Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Zur Absicherung vor automatisierten Anfragen werden
                zusaetzlich technische Schutzmechanismen (z. B. Honeypot-Feld, Rate-Limit, Herkunftspruefung) auf Basis
                von Art. 6 Abs. 1 lit. f DSGVO eingesetzt.
              </p>
              <p>
                Die Reservierungsdaten werden per E-Mail ueber unseren konfigurierten SMTP-Dienst an das Restaurant
                uebermittelt.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">5. Einwilligungsverwaltung, Cookies und Local Storage</h2>
              <p>
                Fuer die Steuerung Ihrer Datenschutz-Auswahl speichern wir Ihre Entscheidung lokal im Browser (Local
                Storage, Schluessel: <code className="rounded bg-white/10 px-1.5 py-0.5 text-white">cookie-consent</code>).
                Diese Speicherung ist technisch erforderlich, um Ihre Auswahl zu dokumentieren.
              </p>
              <p>
                Rechtsgrundlagen: Art. 6 Abs. 1 lit. c DSGVO (Nachweis von Einwilligungen), Art. 6 Abs. 1 lit. f DSGVO
                (funktionsfaehige Consent-Steuerung) sowie § 25 Abs. 2 Nr. 2 TDDDG fuer technisch notwendige
                Speicherzugriffe.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">6. Analyse (Google Analytics)</h2>
              <p>
                Google Analytics wird nur geladen, wenn Sie im Consent-Banner der Kategorie „Analytics“ zugestimmt
                haben und eine GA4-ID im System hinterlegt ist. Ohne Einwilligung findet kein Analytics-Tracking statt.
              </p>
              <p>
                Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO i. V. m. § 25 Abs. 1 TDDDG. Ihre Einwilligung koennen Sie
                jederzeit mit Wirkung fuer die Zukunft widerrufen (Cookie-Einstellungen).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">7. Eingebettete Dienste und externe Inhalte</h2>
              <p>
                Auf der Kontaktseite wird eine eingebettete Google-Maps-Karte verwendet. Beim Laden der Karte werden
                Daten (insbesondere Ihre IP-Adresse) an Google uebermittelt. Rechtsgrundlage ist Ihre Interaktion mit
                der Seite und unser berechtigtes Interesse an einer nutzerfreundlichen Anfahrtsdarstellung (Art. 6 Abs. 1
                lit. f DSGVO).
              </p>
              <p>
                Unsere Social-Media-Verlinkungen sind reine externe Links. Beim Aufruf der Website selbst findet dadurch
                keine automatische Datenuebertragung an diese Netzwerke statt.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">8. Empfaenger und Drittlandtransfer</h2>
              <p>
                Eine Datenweitergabe erfolgt nur, soweit sie fuer den Betrieb erforderlich ist (z. B. Hosting, E-Mail-/
                SMTP-Dienst, ggf. Google bei Maps/Analytics nach Einwilligung). Bei moeglichen Uebermittlungen in
                Drittstaaten achten wir auf geeignete Garantien nach Art. 44 ff. DSGVO (z. B. EU-Standardvertragsklauseln).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">9. Speicherdauer</h2>
              <p>
                Wir speichern personenbezogene Daten nur so lange, wie es fuer den jeweiligen Zweck erforderlich ist oder
                gesetzliche Aufbewahrungspflichten bestehen. Anschliessend werden die Daten geloescht oder datenschutzkonform
                gesperrt.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">10. Ihre Rechte</h2>
              <p>
                Sie haben nach der DSGVO insbesondere das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16),
                Loeschung (Art. 17), Einschraenkung der Verarbeitung (Art. 18), Datenuertragbarkeit (Art. 20),
                Widerspruch (Art. 21) sowie das Recht, erteilte Einwilligungen jederzeit mit Wirkung fuer die Zukunft zu
                widerrufen (Art. 7 Abs. 3).
              </p>
              <p>
                Zur Wahrnehmung Ihrer Rechte schreiben Sie bitte an{' '}
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="text-primary-300 hover:text-primary-200 underline underline-offset-4"
                >
                  {siteConfig.contact.email}
                </a>
                .
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">11. Aufsichtsbehoerde</h2>
              <p>
                Sie haben das Recht auf Beschwerde bei einer Datenschutzaufsichtsbehoerde. Zustaendig am Sitz des
                Verantwortlichen (Brandenburg) ist:
              </p>
              <p>
                Landesbeauftragte fuer den Datenschutz und fuer das Recht auf Akteneinsicht Brandenburg (LDA Brandenburg)
                <br />
                Stahnsdorfer Damm 77
                <br />
                14532 Kleinmachnow
                <br />
                <a
                  href="https://www.lda.brandenburg.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-300 hover:text-primary-200 underline underline-offset-4"
                >
                  www.lda.brandenburg.de
                </a>
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">12. Hinweis zu Bundes- und Landesrecht (Berlin/Brandenburg)</h2>
              <p>
                Fuer diese privatwirtschaftliche Website gelten vorrangig die DSGVO, das BDSG, das DDG und das TDDDG.
                Landesdatenschutzgesetze (einschliesslich Berliner und Brandenburgischer Landesregelungen) betreffen in
                erster Linie oeffentliche Stellen der jeweiligen Laender. Fuer die Aufsicht ueber diesen Webauftritt ist
                aufgrund des Unternehmenssitzes die Brandenburgische Aufsichtsbehoerde federfuehrend.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
