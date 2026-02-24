import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/siteConfig';
import { NativeReservationForm } from '@/components/forms/NativeReservationForm';
import { buildMetadata } from '@/lib/seo';
import { PageManagedContent } from '@/components/cms/PageManagedContent';

import Image from 'next/image';

export const metadata: Metadata = buildMetadata({
  title: 'Tisch reservieren',
  description:
    'Tischreservierung im Carpe Diem bei Ben in Bad Saarow: Datum, Uhrzeit, Personenzahl und Kontaktdaten bequem online senden.',
  path: '/reservieren',
});

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
            <div className="text-center space-y-6">
              <div className="flex flex-col items-center gap-4 animate-fade-in">
                <span className="text-[11px] font-bold uppercase tracking-[0.6em] text-primary-400">Your Experience</span>
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
              </div>
              <h1 className="font-serif text-6xl md:text-8xl font-bold text-white tracking-tighter">Reservierung</h1>
              <p className="text-accent-200 text-xl max-w-xl mx-auto font-light leading-relaxed">
                Sichern Sie sich Ihren Platz in unserem Restaurant. Wir freuen uns darauf, Sie bald begrüßen zu dürfen.
              </p>
            </div>

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
          </div>
        </div>
      </div>
      <PageManagedContent slug="reservieren" />
    </div>
  );
}
