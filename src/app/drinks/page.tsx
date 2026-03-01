import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';
import {
  DrinkRow,
  drinkAdditiveInfo,
  drinkAllergenInfo,
  leftDrinkSections,
  rightDrinkSections,
} from '@/data/drinks';
import { PageManagedContent } from '@/components/cms/PageManagedContent';
import { BreadcrumbTrail } from '@/components/seo/BreadcrumbTrail';
import { StructuredDataScript } from '@/components/seo/StructuredDataScript';
import { buildBreadcrumbSchema } from '@/lib/seo/breadcrumbs';
import { siteConfig } from '@/config/siteConfig';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Getränkekarte Bad Saarow',
  description:
    'Getränkekarte im Carpe Diem bei Ben in Bad Saarow mit Aperitivo, alkoholfreien Getränken, Bieren, Weinen und Spirituosen für Lunch, Dinner und Abende am Kurpark.',
  path: '/drinks',
});

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: 'Startseite', url: siteConfig.seo.domain },
  { name: 'Getränke', url: `${siteConfig.seo.domain}/drinks` },
]);

function renderDrinkRow(row: DrinkRow) {
  if (row.type === 'subheading') {
    return (
      <p key={row.text} className="pt-2 text-xl md:text-2xl font-serif text-primary-300 italic">
        {row.text}
      </p>
    );
  }

  return (
    <div key={`${row.name}-${row.price ?? ''}`} className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-4">
        <p
          className={[
            'text-white leading-tight',
            row.style === 'emphasis' ? 'italic font-semibold text-primary-100' : 'font-semibold',
          ].join(' ')}
        >
          {row.name}
        </p>
        {row.price ? <p className="shrink-0 font-bold text-primary-400">{row.price}</p> : null}
      </div>

      {row.variants ? (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm md:text-base">
          {row.variants.map((variant) => (
            <div key={`${row.name}-${variant.size}`} className="inline-flex items-baseline gap-2">
              <span className="text-accent-300">{variant.size}</span>
              <span className="font-bold text-primary-400">{variant.price}</span>
            </div>
          ))}
        </div>
      ) : null}

      {row.details?.map((detail) => (
        <p key={detail} className="text-sm text-accent-300/90 italic leading-relaxed">
          {detail}
        </p>
      ))}
    </div>
  );
}

export default function DrinksPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          <StructuredDataScript data={breadcrumbSchema} />

          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <BreadcrumbTrail
                items={[
                  { label: 'Startseite', href: '/' },
                  { label: 'Getränke' },
                ]}
              />
            </div>
            <h1 className="font-serif text-6xl md:text-8xl font-bold text-white tracking-tight">Getränke</h1>
            <p className="text-accent-200 text-xl max-w-2xl mx-auto font-light">
              Aperitivo, alkoholfreie Getränke, warme Getränke, Biere, Weine und Spirituosen
              aus unserer aktuellen Karte.
            </p>
          </div>

          <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-10 space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary-400">Aperitivo, Wein und Dinner-Begleitung</p>
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">
                  Unsere Getränkekarte für Bad Saarow
                </h2>
              </div>
              <p className="text-accent-200 leading-relaxed">
                Die Getränkekarte im Carpe Diem ist auf einen kompletten Restaurantbesuch in Bad Saarow ausgelegt:
                vom ersten Aperitivo über alkoholfreie Begleiter für den Lunch bis zu Wein, Bier oder Digestif am
                Abend. Wer nach einem Restaurant am Kurpark sucht, möchte oft nicht nur gut essen, sondern auch eine
                stimmige Getränkebegleitung finden.
              </p>
              <p className="text-accent-200 leading-relaxed">
                Deshalb ergänzen wir unsere{' '}
                <Link href="/menu" className="text-primary-300 underline decoration-primary-400/40 underline-offset-4">
                  Speisekarte
                </Link>{' '}
                mit passenden Aperitivo-Ideen, warmen Getränken, Weinen und Spirituosen. Gerade Gäste, die ihren
                Aufenthalt in Bad Saarow mit Dinner, Spaziergang oder Live-Abend verbinden, finden hier einen klaren
                Überblick über das Angebot.
              </p>
              <p className="text-accent-200 leading-relaxed">
                Wenn Sie Ihren Besuch planen, können Sie direkt einen{' '}
                <Link href="/reservieren" className="text-primary-300 underline decoration-primary-400/40 underline-offset-4">
                  Tisch reservieren
                </Link>{' '}
                oder über unsere{' '}
                <Link href="/galerie" className="text-primary-300 underline decoration-primary-400/40 underline-offset-4">
                  Galerie
                </Link>{' '}
                einen Eindruck von Atmosphäre, Gerichten und Event-Abenden gewinnen.
              </p>
            </article>

            <aside className="rounded-[2rem] border border-primary-500/25 bg-primary-500/10 p-8 md:p-10 space-y-6">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white">Wofür Gäste die Karte nutzen</h2>
              <ul className="space-y-4 text-accent-100">
                <li>Getränkebegleitung zu Fisch, Grill und mediterranen Tellern</li>
                <li>Aperitivo oder Wein für einen Abend am Kurpark Bad Saarow</li>
                <li>Alkoholfreie Optionen für Lunch, Familie und Ausflugstage</li>
              </ul>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/menu"
                  className="rounded-full bg-primary-600 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white"
                >
                  Speisekarte ansehen
                </Link>
                <Link
                  href="/reservieren"
                  className="rounded-full border border-white/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white/90"
                >
                  Reservieren
                </Link>
              </div>
            </aside>
          </section>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-8">
              {leftDrinkSections.map((section) => (
                <section
                  key={section.title}
                  className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8 space-y-6"
                >
                  <div className="text-center space-y-3">
                    <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-300">
                      {section.title}
                    </h2>
                    <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent mx-auto" />
                  </div>
                  <div className="space-y-4">{section.rows.map((row) => renderDrinkRow(row))}</div>
                </section>
              ))}
            </div>

            <div className="space-y-8">
              {rightDrinkSections.map((section) => (
                <section
                  key={section.title}
                  className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8 space-y-6"
                >
                  <div className="text-center space-y-3">
                    <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-300">
                      {section.title}
                    </h2>
                    <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent mx-auto" />
                  </div>
                  <div className="space-y-4">{section.rows.map((row) => renderDrinkRow(row))}</div>
                </section>
              ))}
            </div>
          </div>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8 space-y-8">
            <div className="text-center space-y-3">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-300">
                Allergene & Zusatzstoffe
              </h2>
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent mx-auto" />
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="font-semibold text-white text-xl">Allergene</h3>
                <ul className="space-y-2">
                  {drinkAllergenInfo.map((item) => (
                    <li key={item} className="text-accent-200 leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-white text-xl">Zusatzstoffe</h3>
                <ul className="space-y-2">
                  {drinkAdditiveInfo.map((item) => (
                    <li key={item} className="text-accent-200 leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="grid gap-8 md:grid-cols-3">
            <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 space-y-4">
              <h2 className="font-serif text-3xl font-bold text-white">Zum Lunch</h2>
              <p className="text-accent-200 leading-relaxed">
                Alkoholfreie Getränke, Kaffee und leichte Aperitivo-Optionen passen ideal zu einem Besuch am Mittag.
              </p>
              <Link href="/kontakt" className="text-sm font-semibold text-primary-300">
                Öffnungszeiten prüfen
              </Link>
            </article>
            <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 space-y-4">
              <h2 className="font-serif text-3xl font-bold text-white">Zum Dinner</h2>
              <p className="text-accent-200 leading-relaxed">
                Für den Abend in Bad Saarow sind Wein, Bier oder Digestif oft der letzte Baustein eines entspannten
                Restaurantbesuchs.
              </p>
              <Link href="/menu" className="text-sm font-semibold text-primary-300">
                Passende Gerichte ansehen
              </Link>
            </article>
            <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 space-y-4">
              <h2 className="font-serif text-3xl font-bold text-white">Für Gruppen</h2>
              <p className="text-accent-200 leading-relaxed">
                Wenn Sie mit mehreren Personen kommen, lohnt sich eine frühzeitige Reservierung mit kurzer Abstimmung.
              </p>
              <Link href="/reservieren" className="text-sm font-semibold text-primary-300">
                Besuch planen
              </Link>
            </article>
          </section>
        </div>
      </div>
      <PageManagedContent slug="drinks" />
    </div>
  );
}
