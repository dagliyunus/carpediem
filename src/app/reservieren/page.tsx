import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/config/siteConfig';
import { NativeReservationForm } from '@/components/forms/NativeReservationForm';
import { buildMetadata } from '@/lib/seo';
import { PageManagedContent } from '@/components/cms/PageManagedContent';
import { BreadcrumbTrail } from '@/components/seo/BreadcrumbTrail';
import { StructuredDataScript } from '@/components/seo/StructuredDataScript';
import { buildBreadcrumbSchema } from '@/lib/seo/breadcrumbs';

import Image from 'next/image';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Tisch reservieren Bad Saarow',
  description:
    'Tischreservierung im Carpe Diem bei Ben in Bad Saarow mit Datum, Uhrzeit, Personenzahl, Kontaktdaten und wichtigen Hinweisen für Ihren Restaurantbesuch am Kurpark.',
  path: '/reservieren',
});

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: 'Startseite', url: siteConfig.seo.domain },
  { name: 'Reservierung', url: `${siteConfig.seo.domain}/reservieren` },
]);

export default function ReservationPage() {
  const isEmbed = siteConfig.reservations.mode === 'EMBED';

  return (
    <div className="relative min-h-screen">
      {/* Premium Background */}
      <div className="fixed inset-0 -z-10 h-screen w-full overflow-hidden bg-[#050505]">
        <Image
          src="/images/hero-bg-premium.svg"
          alt="Carpe Diem Background"
          fill
          priority
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      <div className="pt-32 pb-24 relative z-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto space-y-16">
            <StructuredDataScript data={breadcrumbSchema} />

            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <BreadcrumbTrail
                  items={[
                    { label: 'Startseite', href: '/' },
                    { label: 'Reservierung' },
                  ]}
                />
              </div>
              <div className="flex flex-col items-center gap-4 animate-fade-in">
                <span className="text-[11px] font-bold uppercase tracking-[0.6em] text-primary-400">Your Experience</span>
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
              </div>
              <h1 className="font-serif text-6xl md:text-8xl font-bold text-white tracking-tighter">Reservierung</h1>
              <p className="text-accent-200 text-xl max-w-xl mx-auto font-light leading-relaxed">
                Sichern Sie sich Ihren Platz in unserem Restaurant. Wir freuen uns darauf, Sie bald begrüßen zu dürfen.
              </p>
            </div>

            <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-10 space-y-6">
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary-400">Reservierung mit lokalem Bezug</p>
                  <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">
                    Tisch anfragen für Ihren Besuch in Bad Saarow
                  </h2>
                </div>
                <p className="text-accent-200 leading-relaxed">
                  Die Reservierungsseite richtet sich an Gäste, die ihren Restaurantbesuch in Bad Saarow konkret
                  planen möchten. Gerade an Wochenenden, an Feiertagen oder nach Aufenthalten rund um Kurpark, Therme
                  und Scharmützelsee ist eine Tischanfrage sinnvoll, damit Ihr Besuch zeitlich reibungslos passt.
                </p>
                <p className="text-accent-200 leading-relaxed">
                  Über das Formular können Sie Datum, Uhrzeit und Personenzahl bequem senden. Wer sich vorab noch
                  orientieren möchte, findet auf der{' '}
                  <Link href="/menu" className="text-primary-300 underline decoration-primary-400/40 underline-offset-4">
                    Speisekarte
                  </Link>{' '}
                  die aktuellen Gerichte und auf der{' '}
                  <Link href="/drinks" className="text-primary-300 underline decoration-primary-400/40 underline-offset-4">
                    Getränkekarte
                  </Link>{' '}
                  passende Begleiter für Lunch, Dinner oder Abendbesuch.
                </p>
                <p className="text-accent-200 leading-relaxed">
                  Für Gruppen, kurzfristige Anfragen oder Fragen zur Anfahrt können Sie zusätzlich unsere{' '}
                  <Link href="/kontakt" className="text-primary-300 underline decoration-primary-400/40 underline-offset-4">
                    Kontaktseite
                  </Link>{' '}
                  nutzen. Damit wird Reservierung nicht nur zu einem Formularschritt, sondern zum zentralen Einstieg
                  für Ihren Restaurantbesuch in Bad Saarow.
                </p>
              </article>

              <aside className="rounded-[2rem] border border-primary-500/25 bg-primary-500/10 p-8 md:p-10 space-y-6">
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-white">Wann eine Reservierung besonders sinnvoll ist</h2>
                <ul className="space-y-4 text-accent-100">
                  <li>Für Wochenenden, Feiertage und Abendzeiten am Kurpark</li>
                  <li>Für Gruppenbesuche oder besondere Wünsche vorab</li>
                  <li>Für Ausflüge nach Therme, See oder Spaziergang mit festem Zeitplan</li>
                </ul>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href="/menu"
                    className="rounded-full bg-primary-600 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white"
                  >
                    Speisekarte
                  </Link>
                  <Link
                    href="/kontakt"
                    className="rounded-full border border-white/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white/90"
                  >
                    Kontakt & Anfahrt
                  </Link>
                </div>
              </aside>
            </section>

            {isEmbed ? (
              <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] shadow-2xl overflow-hidden min-h-[600px] border border-white/10 flex items-center justify-center p-8">
                {/* Embed Mode: In a real app, use a client component to lazy-load the iframe */}
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mx-auto" />
                  <p className="text-accent-400">Buchungssystem wird geladen...</p>
                  <iframe 
                    src={siteConfig.reservations.embedUrl}
                    className="w-full h-[600px] border-none"
                    title="Reservierungs-Widget"
                  />
                </div>
              </div>
            ) : (
              <NativeReservationForm />
            )}

            <div className="grid md:grid-cols-2 gap-8 pt-8">
              <div className="bg-white/[0.03] backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/5 space-y-6 group hover:bg-white/[0.05] transition-all duration-500">
                <div className="space-y-2">
                  <h3 className="font-bold text-white text-xl tracking-wide group-hover:text-primary-400 transition-colors">Telefonische Reservierung</h3>
                  <p className="text-sm text-accent-300 font-light leading-relaxed">
                    Für kurzfristige Reservierungen oder Gruppen über 8 Personen rufen Sie uns bitte direkt an.
                  </p>
                </div>
                <a 
                  href={`tel:${siteConfig.contact.phone.replace(/\s/g, '')}`} 
                  className="inline-flex h-12 items-center justify-center rounded-full bg-primary-600/10 border border-primary-500/20 px-8 text-sm font-bold text-primary-400 hover:bg-primary-600 hover:text-white transition-all shadow-lg"
                >
                  {siteConfig.contact.phone}
                </a>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/5 space-y-6 group hover:bg-white/[0.05] transition-all duration-500">
                <div className="space-y-2">
                  <h3 className="font-bold text-white text-xl tracking-wide group-hover:text-primary-400 transition-colors">Wichtige Informationen</h3>
                  <p className="text-sm text-accent-300 font-light leading-relaxed">
                    Bitte informieren Sie uns vorab über Allergien oder Unverträglichkeiten. 
                    Hunde sind in unserem Restaurant herzlich willkommen.
                  </p>
                </div>
                <div className="h-12 flex items-center">
                  <div className="w-12 h-px bg-primary-500/30" />
                </div>
              </div>
            </div>

            <section className="grid gap-8 md:grid-cols-3">
              <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 space-y-4">
                <h2 className="font-serif text-3xl font-bold text-white">Vor dem Besuch</h2>
                <p className="text-accent-200 leading-relaxed">
                  Prüfen Sie Gerichte, Getränke und Anfahrt, damit der Abend in Bad Saarow für Ihre Gruppe gut passt.
                </p>
                <Link href="/menu" className="text-sm font-semibold text-primary-300">
                  Menü ansehen
                </Link>
              </article>
              <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 space-y-4">
                <h2 className="font-serif text-3xl font-bold text-white">Bei Rückfragen</h2>
                <p className="text-accent-200 leading-relaxed">
                  Für Allergien, größere Gruppen oder kurzfristige Änderungen ist der direkte Kontakt der beste Weg.
                </p>
                <Link href="/kontakt" className="text-sm font-semibold text-primary-300">
                  Kontakt aufnehmen
                </Link>
              </article>
              <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 space-y-4">
                <h2 className="font-serif text-3xl font-bold text-white">Für den Anlass</h2>
                <p className="text-accent-200 leading-relaxed">
                  Ob Dinner zu zweit, Wochenendbesuch oder besonderer Abend: die Tischanfrage sichert den passenden Rahmen.
                </p>
                <Link href="/galerie" className="text-sm font-semibold text-primary-300">
                  Atmosphäre ansehen
                </Link>
              </article>
            </section>
          </div>
        </div>
      </div>
      <PageManagedContent slug="reservieren" />
    </div>
  );
}
