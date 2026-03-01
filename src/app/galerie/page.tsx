import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';
import { PageManagedContent } from '@/components/cms/PageManagedContent';
import { BreadcrumbTrail } from '@/components/seo/BreadcrumbTrail';
import { StructuredDataScript } from '@/components/seo/StructuredDataScript';
import { buildBreadcrumbSchema } from '@/lib/seo/breadcrumbs';
import { siteConfig } from '@/config/siteConfig';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Restaurant Galerie Bad Saarow',
  description:
    'Galerie vom Carpe Diem bei Ben in Bad Saarow mit Eindrücken zu Ambiente, mediterranen Gerichten und Event-Abenden am Kurpark.',
  path: '/galerie',
});

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: 'Startseite', url: siteConfig.seo.domain },
  { name: 'Galerie', url: `${siteConfig.seo.domain}/galerie` },
]);

const gallerySections = [
  {
    title: 'Ambiente am Kurpark',
    description:
      'Diese Eindrücke zeigen, wie sich ein Besuch im Carpe Diem Bad Saarow anfühlt: außen am Kurpark, im Restaurant selbst und in den Abendstunden. Für viele Gäste ist genau diese Kombination aus Lage, Licht und Atmosphäre ein Grund, ihren Restaurantbesuch in Bad Saarow frühzeitig zu planen.',
    ctaLabel: 'Kontakt & Anfahrt',
    ctaHref: '/kontakt',
    images: [
      { url: '/images/Galerie_page/inside1.webp', alt: 'Innenbereich des Restaurants', caption: 'Innenraum mit Blick auf das Restaurantambiente.' },
      { url: '/images/Galerie_page/outside1.webp', alt: 'Außenansicht des Restaurants', caption: 'Außenansicht des Carpe Diem in Bad Saarow.' },
      { url: '/images/Galerie_page/outside2.webp', alt: 'Außenbereich bei Abendstimmung', caption: 'Außenbereich am Abend rund um den Kurpark.' },
      { url: '/images/Galerie_page/OutsideProsecco.webp', alt: 'Prosecco im Außenbereich serviert', caption: 'Außenbereich mit Getränkeservice und entspannter Stimmung.' },
      { url: '/images/Galerie_page/Visitors1.webp', alt: 'Gäste geniessen die Atmosphäre im Carpe Diem', caption: 'Gäste genießen ihren Aufenthalt im Restaurant.' },
    ],
  },
  {
    title: 'Gerichte und mediterrane Küche',
    description:
      'Die Galerie macht sichtbar, wofür Gäste unsere Speisekarte nutzen: Fisch, kreative Hauptgerichte, vegetarische Optionen und klassische Teller mit mediterraner Handschrift. Wer vor der Reservierung sehen möchte, welche Richtung die Küche einschlägt, bekommt hier einen konkreten Eindruck und kann danach direkt in die Speisekarte wechseln.',
    ctaLabel: 'Zur Speisekarte',
    ctaHref: '/menu',
    images: [
      { url: '/images/Galerie_page/fish2.webp', alt: 'Fischgericht als Spezialitaet des Hauses', caption: 'Fischgericht mit mediterraner Präsentation.' },
      { url: '/images/Galerie_page/fish10.webp', alt: 'Frisch zubereitetes Fischgericht', caption: 'Frisch zubereiteter Teller aus der Fischküche.' },
      { url: '/images/Galerie_page/meal1.webp', alt: 'Kreativ angerichtetes Hauptgericht', caption: 'Hauptgericht mit Fokus auf Präsentation und Produktqualität.' },
      { url: '/images/Galerie_page/meal2.webp', alt: 'Kulinarische Kreation aus der Kueche', caption: 'Weitere kulinarische Kreation aus unserer Küche.' },
      { url: '/images/Galerie_page/veggie.webp', alt: 'Frisches vegetarisches Gericht', caption: 'Vegetarische Option für leichte und frische Restaurantbesuche.' },
    ],
  },
  {
    title: 'Events, Drinks und besondere Momente',
    description:
      'Bad Saarow ist nicht nur ein Ort für Essen, sondern auch für gemeinsame Abende. In diesem Teil der Galerie stehen Event-Momente, Drinks und Details, die häufig rund um Reservierungen, Gruppenbesuche und Wochenendabende gefragt sind. Wenn Sie dazu passende Beiträge lesen möchten, finden Sie mehr im Magazin oder buchen direkt Ihren Tisch.',
    ctaLabel: 'Magazin ansehen',
    ctaHref: '/magazin',
    images: [
      { url: '/images/Galerie_page/DJ.webp', alt: 'DJ bei einem Event im Carpe Diem', caption: 'Event-Abend mit DJ im Carpe Diem.' },
      { url: '/images/Galerie_page/BlacckChampagne.webp', alt: 'Champagner-Moment im Ambiente', caption: 'Drink- und Champagner-Moment für besondere Anlässe.' },
      { url: '/images/Galerie_page/meatball.webp', alt: 'Hausgemachte Fleischspezialitaet aus der Kueche', caption: 'Herzhafte Spezialität für den Abend.' },
      { url: '/images/Galerie_page/suppe.webp', alt: 'Frisch servierte Suppe als Vorspeise', caption: 'Vorspeise als Einstieg in den Restaurantbesuch.' },
      { url: '/images/Galerie_page/table_meal.webp', alt: 'Serviertes Gericht auf dem Tisch', caption: 'Servierter Tischmoment mit Blick auf das Gesamterlebnis.' },
    ],
  },
] as const;

export default function GalleryPage() {
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
                  { label: 'Galerie' },
                ]}
              />
            </div>
            <h1 className="font-serif text-6xl md:text-8xl font-bold text-white tracking-tight">Galerie</h1>
            <p className="text-accent-200 text-xl max-w-3xl mx-auto font-light">
              Bilder aus dem Carpe Diem Bad Saarow: Restaurantambiente, mediterrane Gerichte und Eindrücke von
              Abenden am Kurpark.
            </p>
          </div>

          <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-10 space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary-400">Lokale Orientierung vor dem Besuch</p>
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">
                  So sieht ein Restaurantbesuch in Bad Saarow bei uns aus
                </h2>
              </div>
              <p className="text-accent-200 leading-relaxed">
                Die Galerie hilft vor allem Gästen, die das Carpe Diem zum ersten Mal entdecken und sich ein Bild von
                Atmosphäre, Küche und Rahmen machen möchten. Statt nur eine Bildsammlung zu zeigen, möchten wir einen
                realistischen Eindruck davon vermitteln, wie sich ein Restaurantbesuch am Kurpark in Bad Saarow bei
                uns anfühlt.
              </p>
              <p className="text-accent-200 leading-relaxed">
                Wer nach einem Abendessen, einem Besuch nach der Therme oder einer Location für einen entspannten
                Abend sucht, sieht hier sowohl das Ambiente als auch die Küche. Über unsere{' '}
                <Link href="/menu" className="text-primary-300 underline decoration-primary-400/40 underline-offset-4">
                  Speisekarte
                </Link>{' '}
                und{' '}
                <Link href="/drinks" className="text-primary-300 underline decoration-primary-400/40 underline-offset-4">
                  Getränkekarte
                </Link>{' '}
                können Sie danach direkt den nächsten Schritt machen.
              </p>
              <p className="text-accent-200 leading-relaxed">
                Wenn Sie Ihren Besuch konkret planen möchten, finden Sie über{' '}
                <Link href="/reservieren" className="text-primary-300 underline decoration-primary-400/40 underline-offset-4">
                  Reservierung
                </Link>{' '}
                oder{' '}
                <Link href="/kontakt" className="text-primary-300 underline decoration-primary-400/40 underline-offset-4">
                  Kontakt & Anfahrt
                </Link>{' '}
                die passenden Informationen zu Tischanfrage, Lage und Erreichbarkeit.
              </p>
            </article>

            <aside className="rounded-[2rem] border border-primary-500/25 bg-primary-500/10 p-8 md:p-10 space-y-6">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white">Die Galerie ist besonders hilfreich für</h2>
              <ul className="space-y-4 text-accent-100">
                <li>Gäste, die vorab das Restaurantambiente in Bad Saarow sehen möchten</li>
                <li>Besucher, die Gerichte und Event-Stimmung vergleichen wollen</li>
                <li>Gruppen und Wochenendgäste mit klarem Reservierungsinteresse</li>
              </ul>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/reservieren"
                  className="rounded-full bg-primary-600 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white"
                >
                  Jetzt reservieren
                </Link>
                <Link
                  href="/menu"
                  className="rounded-full border border-white/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white/90"
                >
                  Speisekarte
                </Link>
              </div>
            </aside>
          </section>

          <div className="space-y-14">
            {gallerySections.map((section) => (
              <section key={section.title} className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div className="space-y-3">
                    <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">{section.title}</h2>
                    <p className="max-w-4xl text-accent-200 leading-relaxed">{section.description}</p>
                  </div>
                  <Link href={section.ctaHref} className="text-sm font-semibold text-primary-300">
                    {section.ctaLabel}
                  </Link>
                </div>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {section.images.map((img) => (
                    <figure
                      key={img.url}
                      className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03]"
                    >
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={img.url}
                          alt={img.alt}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                      </div>
                      <figcaption className="p-4 text-sm leading-relaxed text-accent-200">{img.caption}</figcaption>
                    </figure>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
      <PageManagedContent slug="galerie" />
    </div>
  );
}
