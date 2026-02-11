'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

type Dish = {
  name: string;
  description: string;
  image: string;
  category: string;
};

type SignatureDishesCarouselProps = {
  dishes: Dish[];
};

function getReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function SignatureDishesCarousel({ dishes }: SignatureDishesCarouselProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const loopItems = useMemo(() => [...dishes, ...dishes, ...dishes], [dishes]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (getReducedMotion()) return;

    const card = el.querySelector<HTMLElement>('[data-card]');
    if (!card) return;

    const styles = window.getComputedStyle(el);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '24') || 24;
    const cardWidth = card.getBoundingClientRect().width;
    const advance = cardWidth + gap;

    const middleStart = advance * dishes.length;
    el.scrollLeft = middleStart;

    let pauseTimeout: number | undefined;
    const pauseFor = (ms: number) => {
      setIsPaused(true);
      if (pauseTimeout) window.clearTimeout(pauseTimeout);
      pauseTimeout = window.setTimeout(() => setIsPaused(false), ms);
    };

    const onUserIntent = () => pauseFor(6000);
    el.addEventListener('pointerdown', onUserIntent, { passive: true });
    el.addEventListener('wheel', onUserIntent, { passive: true });
    el.addEventListener('touchstart', onUserIntent, { passive: true });

    const onScroll = () => {
      const left = el.scrollLeft;
      const min = advance * (dishes.length * 0.5);
      const max = advance * (dishes.length * 2.5);
      if (left < min) el.scrollLeft = left + advance * dishes.length;
      if (left > max) el.scrollLeft = left - advance * dishes.length;
    };
    el.addEventListener('scroll', onScroll, { passive: true });

    const interval = window.setInterval(() => {
      if (document.hidden) return;
      if (isPaused) return;
      // Use a very small step for a smooth continuous feel
      el.scrollBy({ left: 1, behavior: 'auto' });
    }, 20); // ~50fps smooth crawl

    return () => {
      window.clearInterval(interval);
      if (pauseTimeout) window.clearTimeout(pauseTimeout);
      el.removeEventListener('pointerdown', onUserIntent);
      el.removeEventListener('wheel', onUserIntent);
      el.removeEventListener('touchstart', onUserIntent);
      el.removeEventListener('scroll', onScroll);
    };
  }, [dishes.length, isPaused]);

  return (
    <div className="relative w-full overflow-hidden">
      <div
        ref={containerRef}
        className="flex gap-10 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-8 px-4 md:px-12"
        aria-label="Empfehlungen als Slider"
        role="region"
      >
        {loopItems.map((dish, idx) => (
          <article
            key={`${dish.name}-${idx}`}
            data-card
            className="group w-[320px] shrink-0 snap-center space-y-8 md:w-[480px]"
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-[2.5rem] shadow-2xl ring-1 ring-white/10">
              <Image
                src={dish.image}
                alt={dish.name}
                fill
                sizes="(min-width: 768px) 480px, 320px"
                className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                priority={idx < dishes.length}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700" />
              
              <div className="absolute bottom-8 left-8 right-8 translate-y-2 group-hover:translate-y-0 transition-transform duration-700">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary-400 mb-2">{dish.category}</p>
                <h3 className="font-serif text-3xl font-bold text-white tracking-tight">{dish.name}</h3>
              </div>
            </div>
            <div className="px-4 text-center max-w-sm mx-auto">
              <p className="text-accent-300 text-base leading-relaxed font-light">
                {dish.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

