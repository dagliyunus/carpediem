'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export function HeroParallax() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [bgReady, setBgReady] = useState(false);

  useEffect(() => {
    const requestIdle =
      typeof window !== 'undefined' &&
      typeof (window as unknown as { requestIdleCallback?: (cb: () => void) => number })
        .requestIdleCallback === 'function'
        ? (window as unknown as { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback
        : null;

    if (requestIdle) {
      const id = requestIdle(() => setBgReady(true));
      return () => {
        const cancelIdle = (window as unknown as { cancelIdleCallback?: (id: number) => void })
          .cancelIdleCallback;
        cancelIdle?.(id);
      };
    }

    const id = window.setTimeout(() => setBgReady(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const update = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight || 1;
      // How much of the hero has been scrolled past
      const scrolled = Math.max(0, -rect.top);
      const raw = scrolled / viewportH;
      setProgress(clamp(raw, 0, 1));
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  const bgScale = 1 + progress * 0.05;
  const bgY = progress * 30; // Subtle parallax for the hero background image
  const contentOpacity = 1 - progress * 1.5;
  const contentY = progress * -50;

  return (
    <section ref={sectionRef} className="relative h-screen bg-transparent">
      {/* The background that stays behind */}
      <div className="fixed inset-0 -z-10 h-screen w-full overflow-hidden bg-[#050505]">
        <div
          className="absolute inset-0 transition-transform duration-500 ease-out"
          style={{
            transform: `scale(${bgScale}) translate3d(0, ${bgY}px, 0)`,
          }}
        >
          {bgReady ? (
            <Image
              src="/images/outside_night.webp"
              alt="Carpe Diem Außenansicht bei Nacht"
              fill
              sizes="100vw"
              fetchPriority="low"
              className="object-cover opacity-80"
            />
          ) : null}
        </div>

        {/* Extra Premium Depth Layer */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 0% 0%, rgba(0,0,0,0.62) 0%, transparent 36%), radial-gradient(circle at 100% 0%, rgba(0,0,0,0.62) 0%, transparent 36%), radial-gradient(circle at 0% 100%, rgba(0,0,0,0.72) 0%, transparent 40%), radial-gradient(circle at 100% 100%, rgba(0,0,0,0.72) 0%, transparent 40%), linear-gradient(to bottom, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.24) 38%, rgba(0,0,0,0.68) 100%)',
          }}
        />
      </div>

      {/* Hero Content */}
      <div 
        className="relative z-10 h-full flex items-center justify-center text-center"
        style={{ 
          opacity: Math.max(0, contentOpacity),
          transform: `translate3d(0, ${contentY}px, 0)`
        }}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="space-y-8">
              <div className="flex flex-col items-center gap-4 animate-fade-in">
                <span className="text-[11px] font-bold uppercase tracking-[0.6em] text-primary-400">Exzellenz & Leidenschaft</span>
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
              </div>
              <h1 className="font-sans md:font-serif text-5xl md:text-9xl lg:text-[11rem] font-bold leading-[0.84] tracking-tighter">
                <span className="text-white md:bg-gradient-to-b md:from-white md:via-white/90 md:to-white/40 md:bg-clip-text md:text-transparent inline-block pb-2">
                  Carpe Diem
                </span>
                <br />
                <span className="text-primary-400 font-semibold uppercase tracking-[0.1em] text-3xl md:text-6xl lg:text-7xl block mt-4">
                  bei Ben
                </span>
              </h1>
              <p className="text-xl md:text-3xl text-white/70 font-light max-w-3xl mx-auto leading-relaxed tracking-wide">
                Ihr Refugium für mediterrane Lebensfreude <br className="hidden md:block" />
                im Herzen von Bad Saarow.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-8 pt-6 justify-center items-center">
              <Link
                href="/reservieren"
                className="group relative inline-flex h-18 items-center justify-center overflow-hidden rounded-full bg-primary-600 px-16 text-lg font-bold text-white transition-all hover:bg-primary-700 shadow-[0_20px_60px_rgba(201,133,58,0.4)] ring-1 ring-white/10"
              >
                <span className="relative z-10">Tisch reservieren</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
              </Link>
              <Link
                href="/menu"
                className="inline-flex h-18 items-center justify-center rounded-full bg-white/[0.03] backdrop-blur-2xl border border-white/10 px-16 text-lg font-bold text-white hover:bg-white/[0.08] transition-all shadow-2xl"
              >
                Speisekarte
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Elegant Scroll Indicator - Positioned relative to section, not content */}
      <div className="absolute inset-x-0 bottom-12 z-20 flex justify-center pointer-events-none">
        <div className="flex flex-col items-center gap-6">
          <div className="w-px h-24 bg-gradient-to-b from-primary-400/80 to-transparent" />
          <span className="text-[9px] tracking-[0.6em] uppercase text-white/30 font-bold rotate-180 [writing-mode:vertical-lr]">
            Entdecken
          </span>
        </div>
      </div>
    </section>
  );
}
