import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';
import {
  aegeisCuisineItems,
  burgerColumns,
  fishDisplayHeadline,
  grillItems,
  menuServiceNote,
  saladNote,
  sideDishColumns,
} from '@/data/menu';
import { PageManagedContent } from '@/components/cms/PageManagedContent';
import { BreadcrumbTrail } from '@/components/seo/BreadcrumbTrail';
import { StructuredDataScript } from '@/components/seo/StructuredDataScript';
import { buildBreadcrumbSchema } from '@/lib/seo/breadcrumbs';
import { siteConfig } from '@/config/siteConfig';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Speisekarte Bad Saarow',
  description:
    'Speisekarte im Carpe Diem bei Ben in Bad Saarow mit mediterraner Küche, Fisch, Grillgerichten, Burgern und passenden Empfehlungen für Ihren Restaurantbesuch am Kurpark.',
  path: '/menu',
});

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: 'Startseite', url: siteConfig.seo.domain },
  { name: 'Speisekarte', url: `${siteConfig.seo.domain}/menu` },
]);

export default function MenuPage() {
  const renderMenuRows = (
    rows: {
      name: string;
      price: string;
      details?: string[];
      style?: 'default' | 'addon' | 'bullet';
    }[]
  ) => {
    return rows.map((item) => (
      <div key={`${item.name}-${item.price}`} className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-4">
          <p
            className={[
              'text-white leading-tight',
              item.style === 'addon' ? 'pl-3 font-semibold italic' : 'font-semibold',
              item.style === 'bullet' ? "before:mr-2 before:content-['•']" : '',
            ].join(' ')}
          >
            {item.name}
          </p>
          <p className="shrink-0 font-bold text-primary-400">{item.price}</p>
        </div>
        {item.details?.map((line) => (
          <p key={line} className="text-accent-300/90 text-sm font-light italic leading-relaxed">
            {line}
          </p>
        ))}
      </div>
    ));
  };

  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto space-y-20">
          <StructuredDataScript data={breadcrumbSchema} />

          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <BreadcrumbTrail
                items={[
                  { label: 'Startseite', href: '/' },
                  { label: 'Speisekarte' },
                ]}
              />
            </div>
            <h1 className="font-serif text-6xl md:text-8xl font-bold text-white tracking-tight">Speisekarte</h1>
            <p className="text-accent-200 text-xl max-w-2xl mx-auto font-light">
              Mediterrane Spezialitäten aus der Ägäis, Grillgerichte, Burger und Vorspeisen
              mit allen aktuellen Angaben aus unserer Karte.
            </p>
          </div>

          <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-10 space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary-400">Restaurant-Intent in Bad Saarow</p>
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">
                  Unsere Speisekarte am Kurpark Bad Saarow
                </h2>
              </div>
              <p className="text-accent-200 leading-relaxed">
                Wenn Sie in Bad Saarow essen gehen möchten, finden Sie im Carpe Diem eine Speisekarte mit
                mediterraner Ausrichtung, frischem Fisch, Grillgerichten und hausgemachten Burgern. Die Karte ist
                auf einen Restaurantbesuch rund um Lunch, Abendessen oder einen entspannten Ausklang nach einem Tag
                am Scharmützelsee ausgelegt.
              </p>
              <p className="text-accent-200 leading-relaxed">
                Viele Gäste kombinieren ihren Besuch mit einem Spaziergang durch den Kurpark oder einem Aufenthalt in
                der Umgebung der Saarow Therme. Wer vorab die passende Begleitung zum Essen sucht, findet auf unserer{' '}
                <Link href="/drinks" className="text-primary-300 underline decoration-primary-400/40 underline-offset-4">
                  Getränkekarte
                </Link>{' '}
                Aperitivo, Weine und weitere Empfehlungen. Für Stoßzeiten und Wochenenden lohnt sich eine direkte{' '}
                <Link href="/reservieren" className="text-primary-300 underline decoration-primary-400/40 underline-offset-4">
                  Tischreservierung
                </Link>.
              </p>
              <p className="text-accent-200 leading-relaxed">
                Wenn Sie Fragen zu Allergenen, Gruppenanfragen oder der Anfahrt haben, finden Sie auf unserer{' '}
                <Link href="/kontakt" className="text-primary-300 underline decoration-primary-400/40 underline-offset-4">
                  Kontaktseite
                </Link>{' '}
                alle wichtigen Details. So wird aus der Speisekarte nicht nur eine Liste von Gerichten, sondern eine
                klare Orientierung für Ihren Restaurantbesuch in Bad Saarow.
              </p>
            </article>

            <aside className="rounded-[2rem] border border-primary-500/25 bg-primary-500/10 p-8 md:p-10 space-y-6">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white">Was Gäste hier besonders suchen</h2>
              <ul className="space-y-4 text-accent-100">
                <li>Fisch- und Grillgerichte in Bad Saarow mit mediterranem Fokus</li>
                <li>Restaurant am Kurpark mit Karte für Lunch, Dinner und Wochenendbesuche</li>
                <li>Essengehen nach Therme, Spaziergang oder Ausflug an den Scharmützelsee</li>
              </ul>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/reservieren"
                  className="rounded-full bg-primary-600 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white"
                >
                  Jetzt reservieren
                </Link>
                <Link
                  href="/drinks"
                  className="rounded-full border border-white/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white/90"
                >
                  Zur Getränkekarte
                </Link>
              </div>
            </aside>
          </section>

          <section className="space-y-10">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8 space-y-6">
                <div className="text-center space-y-3">
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-white">
                    Mediterrane Küche aus der Ägäis
                  </h2>
                  <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent mx-auto" />
                </div>
                <div className="space-y-4">{renderMenuRows(aegeisCuisineItems)}</div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8 space-y-6">
                <div className="text-center space-y-3">
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-white">
                    Fisch und Fleisch vom Grill
                  </h2>
                  <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent mx-auto" />
                </div>
                <div className="space-y-4">{renderMenuRows(grillItems)}</div>
              </div>
            </div>

            <div className="text-center rounded-full border border-primary-500/50 bg-primary-500/10 px-6 py-3 w-fit mx-auto">
              <p className="text-white font-semibold">{menuServiceNote}</p>
            </div>
          </section>

          <section className="space-y-12">
            <h2 className="text-center font-serif text-5xl md:text-7xl font-bold text-white tracking-tight">
              {fishDisplayHeadline}
            </h2>

            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex rounded-full border border-primary-500/50 bg-primary-500/10 px-6 py-2">
                  <h3 className="font-serif text-3xl text-primary-300">Hausgemachte Burger</h3>
                </div>
              </div>
              <div className="grid gap-8 lg:grid-cols-2">
                {burgerColumns.map((column, idx) => (
                  <div
                    key={`burger-column-${idx + 1}`}
                    className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8 space-y-4"
                  >
                    {renderMenuRows(column)}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex rounded-full border border-primary-500/50 bg-primary-500/10 px-6 py-2">
                  <h3 className="font-serif text-3xl text-primary-300">Unsere Vorspeisen und Beilagen</h3>
                </div>
              </div>
              <div className="grid gap-8 lg:grid-cols-2">
                {sideDishColumns.map((column, idx) => (
                  <div
                    key={`side-column-${idx + 1}`}
                    className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8 space-y-4"
                  >
                    {renderMenuRows(column)}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-primary-500/35 bg-primary-500/10 px-6 py-5 text-center">
              <p className="text-primary-100 text-lg font-semibold">{saladNote}</p>
            </div>
          </section>

          <section className="grid gap-8 md:grid-cols-3">
            <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 space-y-4">
              <h2 className="font-serif text-3xl font-bold text-white">Für den Lunch</h2>
              <p className="text-accent-200 leading-relaxed">
                Wer mittags in Bad Saarow ein Restaurant sucht, findet auf unserer Karte schnelle, aber dennoch
                vollwertige Optionen mit mediterranem Charakter.
              </p>
              <Link href="/kontakt" className="text-sm font-semibold text-primary-300">
                Öffnungszeiten & Anfahrt
              </Link>
            </article>
            <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 space-y-4">
              <h2 className="font-serif text-3xl font-bold text-white">Für den Abend</h2>
              <p className="text-accent-200 leading-relaxed">
                Für ein Abendessen am Kurpark passen Fisch, Fleisch vom Grill und eine abgestimmte Getränkebegleitung
                aus unserer Barkarte.
              </p>
              <Link href="/drinks" className="text-sm font-semibold text-primary-300">
                Getränke passend zum Essen
              </Link>
            </article>
            <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 space-y-4">
              <h2 className="font-serif text-3xl font-bold text-white">Für den Wochenendbesuch</h2>
              <p className="text-accent-200 leading-relaxed">
                Gerade an Wochenenden und bei schönem Wetter ist eine Reservierung sinnvoll, wenn Sie Ihren Besuch in
                Bad Saarow ohne Wartezeit planen möchten.
              </p>
              <Link href="/reservieren" className="text-sm font-semibold text-primary-300">
                Tisch anfragen
              </Link>
            </article>
          </section>
        </div>
      </div>
      <PageManagedContent slug="menu" />
    </div>
  );
}
