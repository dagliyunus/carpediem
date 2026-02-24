import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import { buildMetadata } from '@/lib/seo';
import { PageManagedContent } from '@/components/cms/PageManagedContent';

export const metadata: Metadata = buildMetadata({
  title: 'Galerie',
  description:
    'Galerie vom Carpe Diem bei Ben in Bad Saarow mit Einblicken in mediterrane Gerichte, Ambiente und Live-Events.',
  path: '/galerie',
});

const images = [
  { url: '/images/Galerie_page/inside1.webp', alt: 'Innenbereich des Restaurants' },
  { url: '/images/Galerie_page/outside1.webp', alt: 'Außenansicht des Restaurants' },
  { url: '/images/Galerie_page/outside2.webp', alt: 'Außenbereich bei Abendstimmung' },
  { url: '/images/Galerie_page/DJ.webp', alt: 'DJ bei einem Event im Carpe Diem' },
  { url: '/images/Galerie_page/OutsideProsecco.webp', alt: 'Prosecco im Außenbereich serviert' },
  { url: '/images/Galerie_page/BlacckChampagne.webp', alt: 'Champagner-Moment im Ambiente' },
  { url: '/images/Galerie_page/fish2.webp', alt: 'Fischgericht als Spezialitaet des Hauses' },
  { url: '/images/Galerie_page/fish10.webp', alt: 'Frisch zubereitetes Fischgericht' },
  { url: '/images/Galerie_page/meal1.webp', alt: 'Kreativ angerichtetes Hauptgericht' },
  { url: '/images/Galerie_page/meal2.webp', alt: 'Kulinarische Kreation aus der Kueche' },
  { url: '/images/Galerie_page/meatball.webp', alt: 'Hausgemachte Fleischspezialitaet aus der Kueche' },
  { url: '/images/Galerie_page/suppe.webp', alt: 'Frisch servierte Suppe als Vorspeise' },
  { url: '/images/Galerie_page/table_meal.webp', alt: 'Serviertes Gericht auf dem Tisch' },
  { url: '/images/Galerie_page/veggie.webp', alt: 'Frisches vegetarisches Gericht' },
  { url: '/images/Galerie_page/Visitors1.webp', alt: 'Gaeste geniessen die Atmosphaere im Carpe Diem' },
];

export default function GalleryPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center space-y-6 mb-16">
          <h1 className="font-serif text-6xl md:text-8xl font-bold text-white tracking-tight">Galerie</h1>
          <p className="text-accent-200 text-xl max-w-2xl mx-auto font-light">
            Ein Blick hinter die Kulissen und Eindrücke unserer kulinarischen Kreationen.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, index) => (
            <div 
              key={index} 
              className="group relative aspect-square overflow-hidden rounded-[2rem]"
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />
            </div>
          ))}
        </div>
      </div>
      <PageManagedContent slug="galerie" />
    </div>
  );
}
