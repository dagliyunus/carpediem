import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung',
  robots: { index: false, follow: true },
};

export default function DatenschutzPage() {
  return (
    <div className="pt-16 pb-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto prose prose-primary">
          <h1 className="font-serif text-4xl font-bold text-accent-950 mb-8">Datenschutzerklärung</h1>
          
          <div className="space-y-8 text-accent-800 text-sm leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-accent-950 mb-4">1. Datenschutz auf einen Blick</h2>
              <h3 className="font-bold mb-2">Allgemeine Hinweise</h3>
              <p>
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, 
                wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert 
                werden können. Ausführliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter diesem Text aufgeführten 
                Datenschutzerklärung.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-accent-950 mb-4">2. Datenerfassung auf dieser Website</h2>
              <h3 className="font-bold mb-2">Wer ist verantwortlich für die Datenerfassung auf dieser Website?</h3>
              <p>
                Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten 
                können Sie dem Abschnitt „Hinweis zur Verantwortlichen Stelle“ in dieser Datenschutzerklärung entnehmen.
              </p>
              <h3 className="font-bold mt-4 mb-2">Wie erfassen wir Ihre Daten?</h3>
              <p>
                Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z. B. 
                um Daten handeln, die Sie in ein Kontaktformular oder bei einer Reservierung eingeben.
              </p>
              <p>
                Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme 
                erfasst. Das sind vor allem technische Daten (z. B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs). 
                Die Erfassung dieser Daten erfolgt automatisch, sobald Sie diese Website betreten.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-accent-950 mb-4">3. Reservierungssystem</h2>
              <p>
                Wenn Sie unser Reservierungssystem nutzen, werden die von Ihnen eingegebenen Daten (Name, E-Mail, Telefonnummer, 
                Personenanzahl, Datum, Uhrzeit) zum Zweck der Reservierungsabwicklung verarbeitet. 
                Rechtsgrundlage hierfür ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung oder vorvertragliche Maßnahmen).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-accent-950 mb-4">4. Analyse-Tools und Tools von Drittanbietern</h2>
              <p>
                Beim Besuch dieser Website kann Ihr Surf-Verhalten statistisch ausgewertet werden. Das geschieht vor allem 
                mit sogenannten Analyseprogrammen. Detaillierte Informationen zu diesen Analyseprogrammen finden Sie in 
                der folgenden Datenschutzerklärung.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
