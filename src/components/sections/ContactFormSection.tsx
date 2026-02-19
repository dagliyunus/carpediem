import React from 'react';
import { Mail, Phone } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';
import { ContactForm } from '@/components/forms/ContactForm';

export const ContactFormSection = () => {
  return (
    <section className="py-24 md:py-32 bg-transparent relative z-10 border-t border-white/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-14 items-start">
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-4">
                <span className="text-[11px] font-bold uppercase tracking-[0.6em] text-primary-400">
                  Kontakt
                </span>
                <div className="h-px w-20 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
              </div>
              <h2 className="font-serif text-5xl md:text-6xl font-bold leading-[0.95] tracking-tighter text-white">
                Schreiben Sie uns
              </h2>
              <p className="text-white/70 text-lg font-light leading-relaxed">
                Fragen, Wünsche oder besondere Anlässe – wir freuen uns auf Ihre Nachricht.
              </p>
            </div>

            <div className="grid gap-4">
              <a
                href={`tel:${siteConfig.contact.phone.replace(/\s/g, '')}`}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl hover:bg-white/[0.05] transition-colors"
              >
                <div className="rounded-xl bg-primary-500/10 ring-1 ring-primary-500/20 p-2.5">
                  <Phone className="h-5 w-5 text-primary-400" />
                </div>
                <div className="space-y-1">
                  <div className="text-white font-semibold tracking-tight">Telefon</div>
                  <div className="text-sm text-white/60 leading-relaxed">{siteConfig.contact.phone}</div>
                </div>
              </a>

              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl hover:bg-white/[0.05] transition-colors"
              >
                <div className="rounded-xl bg-primary-500/10 ring-1 ring-primary-500/20 p-2.5">
                  <Mail className="h-5 w-5 text-primary-400" />
                </div>
                <div className="space-y-1">
                  <div className="text-white font-semibold tracking-tight">E-Mail</div>
                  <div className="text-sm text-white/60 leading-relaxed">{siteConfig.contact.email}</div>
                </div>
              </a>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-10 backdrop-blur-xl shadow-2xl">
              <ContactForm />
              <p className="mt-6 text-xs text-white/40 leading-relaxed">
                Bitte keine sensiblen Daten senden. Die Übermittlung erfolgt über eine gesicherte Verbindung.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

