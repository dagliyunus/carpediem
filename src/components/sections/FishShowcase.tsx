import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChefHat, Fish, Snowflake } from 'lucide-react';

const images = [
  {
    src: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=85&w=2000',
    alt: 'Fisch auf Eis in der Vitrine',
  },
  {
    src: 'https://images.unsplash.com/photo-1542010589006-d1eacc3918f3?auto=format&fit=crop&q=85&w=2000',
    alt: 'Frische Meeresfrüchte und Filets',
  },
  {
    src: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?auto=format&fit=crop&q=85&w=2000',
    alt: 'Anrichten und Service am Teller',
  },
];

export function FishShowcase() {
  return (
    <section className="relative z-10 min-h-screen py-28 md:py-32 overflow-hidden border-y border-white/5">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_20%,rgba(219,165,93,0.14),transparent_55%),radial-gradient(circle_at_80%_60%,rgba(166,95,44,0.10),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-14 items-center">
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-4">
                <span className="text-[11px] font-bold uppercase tracking-[0.6em] text-primary-400">
                  Frische aus dem Meer
                </span>
                <div className="h-px w-20 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
              </div>
              <h2 className="font-serif text-5xl md:text-7xl font-bold leading-[0.95] tracking-tighter">
                <span className="bg-gradient-to-b from-white via-white/90 to-white/40 bg-clip-text text-transparent inline-block pb-2">
                  Fischvitrine
                </span>
              </h2>
              <p className="text-white/70 text-lg md:text-xl font-light leading-relaxed">
                Vom sorgfältigen Einkauf über die präzise Kühlung bis zum perfekten Anrichten: Unsere Fisch- und
                Meeresfrüchte-Auswahl steht für Qualität, die man sieht und schmeckt.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
                <div className="mt-0.5 rounded-xl bg-primary-500/10 ring-1 ring-primary-500/20 p-2.5">
                  <Fish className="h-5 w-5 text-primary-400" />
                </div>
                <div className="space-y-1">
                  <div className="text-white font-semibold tracking-tight">Tagesfrische Auswahl</div>
                  <div className="text-sm text-white/60 leading-relaxed">
                    Saisonale Filets und Meeresfrüchte – elegant präsentiert und mit Blick fürs Detail ausgewählt.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
                <div className="mt-0.5 rounded-xl bg-primary-500/10 ring-1 ring-primary-500/20 p-2.5">
                  <Snowflake className="h-5 w-5 text-primary-400" />
                </div>
                <div className="space-y-1">
                  <div className="text-white font-semibold tracking-tight">Kühlkette & Lagerung</div>
                  <div className="text-sm text-white/60 leading-relaxed">
                    Konsequente Temperaturführung für maximale Frische – vom Eingang bis zum Service.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
                <div className="mt-0.5 rounded-xl bg-primary-500/10 ring-1 ring-primary-500/20 p-2.5">
                  <ChefHat className="h-5 w-5 text-primary-400" />
                </div>
                <div className="space-y-1">
                  <div className="text-white font-semibold tracking-tight">Servieren mit Stil</div>
                  <div className="text-sm text-white/60 leading-relaxed">
                    Präzise Zubereitung, harmonische Beilagen und ein Finish, das dem Produkt Raum gibt.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/reservieren"
                className="inline-flex h-14 items-center justify-center rounded-full bg-primary-600 px-10 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-2xl ring-1 ring-white/10 hover:bg-primary-700 transition-all"
              >
                Tisch reservieren
              </Link>
              <Link
                href="/kontakt"
                className="inline-flex h-14 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] px-10 text-sm font-bold uppercase tracking-[0.18em] text-white/80 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                Fragen zur Auswahl
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="relative grid md:grid-cols-12 gap-6">
              <div className="md:col-span-7 relative aspect-[4/5] md:aspect-[3/4] rounded-[2.5rem] overflow-hidden ring-1 ring-white/10 shadow-2xl">
                <Image src={images[0].src} alt={images[0].alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
              <div className="md:col-span-5 grid gap-6">
                <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden ring-1 ring-white/10 shadow-2xl">
                  <Image src={images[1].src} alt={images[1].alt} fill sizes="(min-width: 1024px) 32vw, 100vw" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                </div>
                <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden ring-1 ring-white/10 shadow-2xl">
                  <Image src={images[2].src} alt={images[2].alt} fill sizes="(min-width: 1024px) 32vw, 100vw" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 backdrop-blur-xl">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="space-y-2">
                  <div className="text-white font-semibold tracking-tight">Heute etwas Besonderes?</div>
                  <div className="text-sm text-white/60 leading-relaxed">
                    Sprechen Sie uns an – wir empfehlen passende Tagesangebote und die ideale Begleitung.
                  </div>
                </div>
                <Link
                  href="/kontakt"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-primary-500/30 bg-primary-600/10 px-8 text-sm font-bold text-primary-400 hover:bg-primary-600 hover:text-white transition-all"
                >
                  Kontakt aufnehmen
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
