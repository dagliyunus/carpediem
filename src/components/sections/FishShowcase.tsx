'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

const showcaseItems = [
  // Pair 1
  {
    id: 6,
    src: '/images/fish/Fish9.webp',
    alt: 'Gourmet Präsentation',
    title: 'Genussmomente',
    description: 'Ein Fest für die Sinne',
    className: 'md:col-span-8 md:row-span-2', // Horizontal Hero
  },
  {
    id: 2,
    src: '/images/fish/Fish4.webp',
    alt: 'Frische Zubereitung',
    title: 'Handwerk & Präzision',
    description: 'Meisterhafte Verarbeitung',
    className: 'md:col-span-4 md:row-span-2', // Vertical Sidekick
  },
  // Pair 2
  {
    id: 3,
    src: '/images/fish/Fish5.webp',
    alt: 'Meeresfrüchte Vielfalt',
    title: 'Vielfalt des Meeres',
    description: 'Für jeden Geschmack das Richtige',
    className: 'md:col-span-8 md:row-span-2', // Horizontal
  },
  {
    id: 5,
    src: '/images/fish/fish7.webp',
    alt: 'Perfekte Lagerung',
    title: 'Frische-Garantie',
    description: 'Optimale Temperaturen',
    className: 'md:col-span-4 md:row-span-2', // Vertical
  },
  // Pair 3
  {
    id: 4,
    src: '/images/fish/Fish6.webp',
    alt: 'Saisonale Spezialitäten',
    title: 'Saisonale Highlights',
    description: 'Das Beste der Jahreszeit',
    className: 'md:col-span-8 md:row-span-2', // Horizontal
  },
  {
    id: 7,
    src: '/images/fish/Fish8.webp',
    alt: 'Kulinarische Kunst',
    title: 'Haute Cuisine',
    description: 'Leidenschaft auf dem Teller',
    className: 'md:col-span-4 md:row-span-2', // Vertical
  },
  // Final Feature
  {
    id: 1,
    src: '/images/fish/Fish3.webp',
    alt: 'Premium Fisch Auswahl',
    title: 'Exzellente Qualität',
    description: 'Frisch gefangen und perfekt gekühlt',
    className: 'md:col-span-8 md:col-start-3 md:row-span-2', // Horizontal Centered
  },
];

export function FishShowcase() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const isMounted = typeof window !== 'undefined';

  const openLightbox = (index: number) => setSelectedImage(index);
  const closeLightbox = () => setSelectedImage(null);
  
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImage === null) return;
    setSelectedImage((selectedImage + 1) % showcaseItems.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImage === null) return;
    setSelectedImage((selectedImage - 1 + showcaseItems.length) % showcaseItems.length);
  };

  useEffect(() => {
    if (selectedImage === null) return;
    if (typeof window === 'undefined') return;

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [selectedImage]);

  return (
    <section className="relative z-10 py-16 sm:py-20 md:py-32 overflow-hidden border-y border-white/5 bg-black">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(219,165,93,0.05),transparent_70%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header - Minimal & Centered */}
        <div className="relative text-center mb-12 sm:mb-16 md:mb-24 space-y-4 sm:space-y-5 md:space-y-6">
          {/* Decorative Swordfish - Positioned above the title */}
          <div className="relative w-full max-w-3xl mx-auto h-[96px] sm:h-[112px] md:h-[128px] lg:h-[144px] pointer-events-none select-none opacity-100 mix-blend-normal -mt-3 -mb-1 sm:-mt-8 sm:-mb-3 md:-mt-12 md:-mb-4 lg:-mt-14 lg:-mb-5">
            <Image
              src="/images/fish/swordfish.webp"
              alt=""
              fill
              sizes="(min-width: 1024px) 768px, 100vw"
              className="object-cover object-center drop-shadow-2xl"
              priority
            />
          </div>
          <div className="inline-flex items-center gap-4 justify-center opacity-80 relative z-10">
            <div className="h-px w-8 md:w-12 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-primary-400">
              Unsere Fischtheke
            </span>
            <div className="h-px w-8 md:w-12 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
          </div>
          
          <h2 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white drop-shadow-lg">
            <span className="text-white md:bg-gradient-to-b md:from-white md:via-white/90 md:to-white/40 md:bg-clip-text md:text-transparent">
              Fish Showcase
            </span>
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto font-light text-base sm:text-lg drop-shadow-md">
            Entdecken Sie unsere exklusive Auswahl an frischem Fisch und Meeresfrüchten.
            Täglich frisch, meisterhaft präsentiert.
          </p>
        </div>

        {/* Main Content - Bento Grid / Mosaic Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 lg:gap-8 auto-rows-[auto] md:auto-rows-[200px]">
          {showcaseItems.map((item, index) => (
            <div 
              key={item.id} 
              onClick={() => openLightbox(index)}
              className={`group relative flex flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02] shadow-2xl transition-all duration-700 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)] cursor-pointer aspect-[3/5] min-h-[260px] md:min-h-0 md:aspect-auto ${item.className}`}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-40" />
              
              {/* Zoom Icon */}
              <div className="absolute top-6 right-6 opacity-0 transform -translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                <div className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white">
                  <ZoomIn size={20} />
                </div>
              </div>

              {/* Overlay Text - Minimal */}
              <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-2 transition-transform duration-500 group-hover:translate-y-0">
                <h3 className="font-serif text-2xl text-white mb-2 opacity-90 group-hover:opacity-100 transition-opacity drop-shadow-lg">
                  {item.title}
                </h3>
                <p className="text-sm text-white/80 font-light tracking-wide opacity-0 transform translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 drop-shadow-md">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Action - Subtle */}
        <div className="mt-16 md:mt-24 text-center">
          <Link
            href="/reservieren"
            className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors duration-300"
          >
            <span>Erleben Sie den Geschmack</span>
            <span className="transform transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage !== null && (
        isMounted
          ? createPortal(
              <div
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300 overflow-hidden"
                onClick={closeLightbox}
                role="dialog"
                aria-modal="true"
              >
                <button
                  onClick={closeLightbox}
                  aria-label="Close"
                  className="fixed top-4 right-4 md:top-6 md:right-6 z-[10000] h-12 w-12 md:h-14 md:w-14 flex items-center justify-center rounded-full bg-white/90 text-black hover:bg-white transition-colors shadow-2xl"
                >
                  <X className="h-6 w-6 md:h-7 md:w-7" />
                </button>

                <button
                  onClick={prevImage}
                  aria-label="Previous image"
                  className="absolute left-4 md:left-8 z-[10000] p-4 text-white/70 hover:text-white hover:bg-white/5 rounded-full transition-all hidden md:block"
                >
                  <ChevronLeft size={48} />
                </button>

                <button
                  onClick={nextImage}
                  aria-label="Next image"
                  className="absolute right-4 md:right-8 z-[10000] p-4 text-white/70 hover:text-white hover:bg-white/5 rounded-full transition-all hidden md:block"
                >
                  <ChevronRight size={48} />
                </button>

                <div
                  className="relative w-full h-full max-w-7xl max-h-[90vh] p-4 md:p-12 flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={showcaseItems[selectedImage].src}
                      alt={showcaseItems[selectedImage].alt}
                      fill
                      className="object-contain"
                      sizes="100vw"
                      priority
                    />
                  </div>

                  <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
                    <h3 className="text-2xl font-serif text-white mb-2 drop-shadow-xl">
                      {showcaseItems[selectedImage].title}
                    </h3>
                    <p className="text-white/70 font-light tracking-wide drop-shadow-lg">
                      {showcaseItems[selectedImage].description}
                    </p>
                  </div>
                </div>
              </div>,
              document.body
            )
          : null
      )}
    </section>
  );
}
