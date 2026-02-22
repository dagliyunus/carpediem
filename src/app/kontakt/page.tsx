import React from 'react';
import { Metadata } from 'next';
import { Phone, Mail, MapPin, Train, Car, Info } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';
import { GoogleMapEmbed } from '@/components/maps/GoogleMapEmbed';
import { ContactForm } from '@/components/forms/ContactForm';

export const metadata: Metadata = {
  title: 'Kontakt & Anfahrt',
  description: 'Besuchen Sie uns in Bad Saarow. Hier finden Sie unsere Adresse, Kontaktdaten und eine detaillierte Anfahrtsbeschreibung aus Berlin.',
};

export default function ContactPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto space-y-24">
          <div className="text-center space-y-6">
            <h1 className="font-serif text-6xl md:text-8xl font-bold text-white tracking-tight">Kontakt</h1>
            <p className="text-accent-200 text-xl max-w-2xl mx-auto font-light">
              Wir freuen uns auf Ihren Besuch. Haben Sie Fragen oder spezielle Wünsche? Kontaktieren Sie uns gerne.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div className="space-y-12">
              <div className="grid sm:grid-cols-2 gap-10">
                <div className="space-y-4 group">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center ring-1 ring-white/10 group-hover:bg-primary-600/20 transition-colors duration-500">
                    <MapPin className="w-6 h-6 text-primary-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-white text-lg tracking-wide">Adresse</h3>
                    <p className="text-accent-300 text-sm leading-relaxed font-light">
                      {siteConfig.location.address}
                    </p>
                  </div>
                </div>
                <div className="space-y-4 group">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center ring-1 ring-white/10 group-hover:bg-primary-600/20 transition-colors duration-500">
                    <Phone className="w-6 h-6 text-primary-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-white text-lg tracking-wide">Telefon</h3>
                    <p className="text-accent-300 text-sm leading-relaxed font-light">
                      <a href={`tel:${siteConfig.contact.phone.replace(/\s/g, '')}`} className="hover:text-primary-400 transition-colors">
                        {siteConfig.contact.phone}
                      </a>
                    </p>
                  </div>
                </div>
                <div className="space-y-4 group">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center ring-1 ring-white/10 group-hover:bg-primary-600/20 transition-colors duration-500">
                    <Mail className="w-6 h-6 text-primary-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-white text-lg tracking-wide">E-Mail</h3>
                    <p className="text-accent-300 text-sm leading-relaxed font-light">
                      <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-primary-400 transition-colors">
                        {siteConfig.contact.email}
                      </a>
                    </p>
                  </div>
                </div>
                <div className="space-y-4 group">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center ring-1 ring-white/10 group-hover:bg-primary-600/20 transition-colors duration-500">
                    <Info className="w-6 h-6 text-primary-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-white text-lg tracking-wide">Öffnungszeiten</h3>
                    <p className="text-accent-300 text-sm leading-relaxed font-light">
                      Mo-So: 12:00 - 20:00 Uhr<br />
                      Di & Mi: Ruhetag
                    </p>
                  </div>
                </div>
              </div>

              {/* Arrival from Berlin */}
              <div className="bg-white/[0.03] p-10 rounded-[2rem] space-y-10 ring-1 ring-white/5">
                <h2 className="font-serif text-4xl font-bold text-white">Anfahrt aus Berlin</h2>
                <div className="space-y-8">
                  <div className="flex gap-8">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0 ring-1 ring-white/10">
                      <Train className="w-5 h-5 text-primary-400" />
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-bold text-white text-lg tracking-wide">Mit der Bahn</h4>
                      <p className="text-sm text-accent-300 leading-relaxed font-light">
                        Nehmen Sie den RE1 aus Berlin (z.B. Alexanderplatz oder Hauptbahnhof) bis Fürstenwalde (Spree). 
                        Von dort fährt die Regionalbahn RB35 direkt nach Bad Saarow. 
                        Vom Bahnhof Bad Saarow sind es nur 5 Gehminuten durch den Kurpark zu uns.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0 ring-1 ring-white/10">
                      <Car className="w-5 h-5 text-primary-400" />
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-bold text-white text-lg tracking-wide">Mit dem Auto</h4>
                      <p className="text-sm text-accent-300 leading-relaxed font-light">
                        Folgen Sie der A12 Richtung Frankfurt (Oder) bis zur Ausfahrt 4-Storkow. 
                        Folgen Sie der Beschilderung Richtung Bad Saarow. 
                        Parkmöglichkeiten finden Sie direkt am Kurpark oder in der Nähe der Therme.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Preview */}
            <div className="space-y-8">
              <GoogleMapEmbed
                address={siteConfig.location.address}
                title="Karte: Kontakt"
                heightClassName="h-[600px]"
              />
              <div className="flex justify-center">
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(siteConfig.location.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary-600 text-white px-10 py-4 rounded-full font-bold text-sm hover:bg-primary-700 transition-all hover:scale-105 shadow-2xl ring-1 ring-white/10"
                >
                  Route öffnen
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-8 md:p-12 backdrop-blur-xl shadow-2xl">
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="text-center space-y-4">
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">Kontaktformular</h2>
                <p className="text-accent-200 text-lg font-light">
                  Senden Sie uns eine Nachricht – wir melden uns so schnell wie möglich.
                </p>
              </div>
              <ContactForm />
              <p className="text-xs text-white/40 leading-relaxed text-center">
                Bitte keine sensiblen Daten senden. Die Übermittlung erfolgt über eine gesicherte Verbindung.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
