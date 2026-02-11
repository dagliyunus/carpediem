import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Galerie',
  description: 'Impressionen aus unserem Restaurant Carpe Diem in Bad Saarow. Einblicke in unsere Küche und das Ambiente.',
};

const images = [
  { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=85&w=1600', alt: 'Restaurant-Interieur mit gedeckten Tischen' },
  { url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=85&w=1600', alt: 'Koch in der Küche bei der Zubereitung' },
  { url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=85&w=1600', alt: 'Mediterranes Gericht auf dem Teller' },
  { url: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=85&w=1600', alt: 'Weingläser auf einem Tisch' },
  { url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=85&w=1600', alt: 'Cocktailglas in stimmungsvoller Beleuchtung' },
  { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=85&w=1600', alt: 'Gedeckter Tisch in stilvollem Ambiente' },
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
              className="group relative aspect-square overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-white/10"
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-[2px]">
                <span className="text-white font-bold tracking-[0.2em] uppercase text-xs border border-white/20 px-6 py-2 rounded-full bg-white/5">Ansehen</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
