'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Play, X, ChevronLeft, ChevronRight } from 'lucide-react';

type VideoOrientation = 'portrait' | 'landscape';

type VideoItem = {
  id: number;
  src: string;
  poster?: string;
  title: string;
  description: string;
  orientation: VideoOrientation;
};

type VideoShowcaseInputItem = {
  id: string;
  src: string;
  poster?: string | null;
  title?: string | null;
  description?: string | null;
  width?: number | null;
  height?: number | null;
};

const defaultVideoItems: VideoItem[] = [
  {
    id: 1,
    src: '/images/videos/1.mp4',
    poster: '/images/videos/1-poster.webp',
    title: 'Live Atmosphaere',
    description: 'Echte Stimmung aus unseren Abenden',
    orientation: 'portrait',
  },
  {
    id: 2,
    src: '/images/videos/2.mp4',
    poster: '/images/videos/2-poster.webp',
    title: 'Buehnenmomente',
    description: 'Musik, die den Raum fuellt',
    orientation: 'portrait',
  },
  {
    id: 3,
    src: '/images/videos/3.mp4',
    poster: '/images/videos/3-poster.webp',
    title: 'Premium Nights',
    description: 'Highlights im Carpe Diem',
    orientation: 'portrait',
  },
  {
    id: 4,
    src: '/images/videos/4.mp4',
    poster: '/images/videos/4-poster.webp',
    title: 'Crowd Energy',
    description: 'Publikum und Performance in Sync',
    orientation: 'portrait',
  },
  {
    id: 5,
    src: '/images/videos/5.mp4',
    poster: '/images/videos/5-poster.webp',
    title: 'After Dark',
    description: 'Unvergessliche Momente bei Nacht',
    orientation: 'landscape',
  },
  {
    id: 6,
    src: '/images/videos/6.mp4',
    poster: '/images/videos/6-poster.webp',
    title: 'Vibe Sessions',
    description: 'Rhythmus, Genuss und Emotion',
    orientation: 'landscape',
  },
  {
    id: 7,
    src: '/images/videos/7.mp4',
    poster: '/images/videos/7-poster.webp',
    title: 'Finale Impression',
    description: 'Der perfekte Abschluss des Abends',
    orientation: 'landscape',
  },
];

function buildDynamicVideoItems(items?: VideoShowcaseInputItem[]): VideoItem[] {
  if (!items || items.length === 0) return defaultVideoItems;

  return items.map((item, index) => {
    const orientation: VideoOrientation =
      item.width && item.height ? (item.width >= item.height ? 'landscape' : 'portrait') : 'landscape';

    return {
      id: index + 1,
      src: item.src,
      poster: item.poster || undefined,
      title: item.title || `Video Highlight ${index + 1}`,
      description: item.description || 'Live-Einblick aus dem Carpe Diem.',
      orientation,
    };
  });
}

function getCardAspectClass(orientation: VideoOrientation) {
  return orientation === 'portrait' ? 'aspect-[9/16]' : 'aspect-video';
}

function getModalFrameClass(orientation: VideoOrientation) {
  if (orientation === 'portrait') {
    return 'w-[min(92vw,440px)] aspect-[9/16] max-h-[86vh]';
  }
  return 'w-[min(95vw,1240px)] aspect-video max-h-[86vh]';
}

export function VideoShowcase({ items }: { items?: VideoShowcaseInputItem[] }) {
  const videoItems = useMemo(() => buildDynamicVideoItems(items), [items]);
  const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);
  const isMounted = typeof window !== 'undefined';
  const portraitVideos = useMemo(
    () => videoItems.filter((video) => video.orientation === 'portrait'),
    [videoItems]
  );
  const landscapeVideos = useMemo(
    () => videoItems.filter((video) => video.orientation === 'landscape'),
    [videoItems]
  );

  const activeVideo = useMemo(() => {
    if (activeVideoIndex === null) return null;
    return videoItems[activeVideoIndex] ?? null;
  }, [activeVideoIndex, videoItems]);

  const closeLightbox = () => setActiveVideoIndex(null);

  const nextVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveVideoIndex((prev) => {
      if (prev === null) return prev;
      return (prev + 1) % videoItems.length;
    });
  };

  const prevVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveVideoIndex((prev) => {
      if (prev === null) return prev;
      return (prev - 1 + videoItems.length) % videoItems.length;
    });
  };

  useEffect(() => {
    if (activeVideoIndex === null) return;
    if (typeof window === 'undefined') return;

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
        return;
      }

      if (e.key === 'ArrowRight') {
        setActiveVideoIndex((prev) => {
          if (prev === null) return prev;
          return (prev + 1) % videoItems.length;
        });
      }

      if (e.key === 'ArrowLeft') {
        setActiveVideoIndex((prev) => {
          if (prev === null) return prev;
          return (prev - 1 + videoItems.length) % videoItems.length;
        });
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [activeVideoIndex, videoItems]);

  return (
    <section className="relative z-10 py-16 sm:py-20 md:py-32 overflow-hidden border-y border-white/5 bg-black">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(219,165,93,0.05),transparent_70%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="relative text-center mb-12 sm:mb-16 md:mb-24 space-y-4 sm:space-y-5 md:space-y-6">
          <div className="inline-flex items-center gap-4 justify-center opacity-80 relative z-10">
            <div className="h-px w-8 md:w-12 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
            <span className="text-sm md:text-base font-bold uppercase tracking-[0.4em] text-primary-400">
              Live Videos
            </span>
            <div className="h-px w-8 md:w-12 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
          </div>

          <h2 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white drop-shadow-lg">
            <span className="text-white md:bg-gradient-to-b md:from-white md:via-white/90 md:to-white/40 md:bg-clip-text md:text-transparent">
              Video Showcase
            </span>
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto font-light text-base sm:text-lg drop-shadow-md">
            Vorschau aus der ersten Sekunde. Das eigentliche Video wird nur beim Klick geladen.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {portraitVideos.map((item) => {
            const index = videoItems.findIndex((video) => video.id === item.id);
            return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveVideoIndex(index)}
              className={`group relative flex w-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-black/50 shadow-2xl transition-all duration-700 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)] cursor-pointer text-left ${getCardAspectClass(item.orientation)}`}
            >
              {item.poster ? (
                <Image
                  src={item.poster}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              ) : (
                <video
                  src={item.src}
                  muted
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-55" />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-black/45 backdrop-blur-xl border border-white/25 text-white flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-105">
                  <Play className="h-7 w-7 md:h-9 md:w-9 fill-current ml-1" />
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 transform translate-y-1 transition-transform duration-500 group-hover:translate-y-0">
                <h3 className="font-serif text-xl md:text-2xl text-white mb-2 opacity-90 group-hover:opacity-100 transition-opacity drop-shadow-lg">
                  {item.title}
                </h3>
                <p className="text-sm text-white/80 font-light tracking-wide opacity-0 transform translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 drop-shadow-md">
                  {item.description}
                </p>
              </div>
            </button>
            );
          })}
        </div>

        <div className="mt-4 md:mt-6 lg:mt-8 grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {landscapeVideos.map((item) => {
            const index = videoItems.findIndex((video) => video.id === item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveVideoIndex(index)}
                className={`group relative flex w-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-black/50 shadow-2xl transition-all duration-700 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)] cursor-pointer text-left ${getCardAspectClass(item.orientation)}`}
              >
                {item.poster ? (
                  <Image
                    src={item.poster}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1536px) 33vw, (min-width: 1024px) 50vw, 100vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                ) : (
                  <video
                    src={item.src}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-55" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-black/45 backdrop-blur-xl border border-white/25 text-white flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-105">
                    <Play className="h-7 w-7 md:h-9 md:w-9 fill-current ml-1" />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 transform translate-y-1 transition-transform duration-500 group-hover:translate-y-0">
                  <h3 className="font-serif text-xl md:text-2xl text-white mb-2 opacity-90 group-hover:opacity-100 transition-opacity drop-shadow-lg">
                    {item.title}
                  </h3>
                  <p className="text-sm text-white/80 font-light tracking-wide opacity-0 transform translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 drop-shadow-md">
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {activeVideo && isMounted
        ? createPortal(
            <div
              className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl animate-in fade-in duration-300"
              onClick={closeLightbox}
              role="dialog"
              aria-modal="true"
              aria-label={`${activeVideo.title} Video`}
            >
              <button
                onClick={closeLightbox}
                aria-label="Close"
                className="fixed right-3 top-3 md:right-6 md:top-6 z-[10020] h-12 w-12 md:h-14 md:w-14 flex items-center justify-center rounded-full bg-white/90 text-black hover:bg-white transition-colors shadow-2xl ring-1 ring-black/20"
              >
                <X className="h-6 w-6 md:h-7 md:w-7" />
              </button>

              <button
                onClick={prevVideo}
                aria-label="Previous video"
                className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-[10010] p-4 text-white/70 hover:text-white hover:bg-white/5 rounded-full transition-all hidden md:block"
              >
                <ChevronLeft size={48} />
              </button>

              <button
                onClick={nextVideo}
                aria-label="Next video"
                className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-[10010] p-4 text-white/70 hover:text-white hover:bg-white/5 rounded-full transition-all hidden md:block"
              >
                <ChevronRight size={48} />
              </button>

              <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-10">
                <div
                  className={`relative rounded-2xl overflow-hidden bg-black shadow-[0_30px_120px_rgba(0,0,0,0.75)] border border-white/10 ${getModalFrameClass(activeVideo.orientation)}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <video
                    key={activeVideo.src}
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-contain bg-black"
                    poster={activeVideo.poster}
                  >
                    <source src={activeVideo.src} type="video/mp4" />
                  </video>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </section>
  );
}
