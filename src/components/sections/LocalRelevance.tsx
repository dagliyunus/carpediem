import React from 'react';
import { Train, Car } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';
import { GoogleMapEmbed } from '@/components/maps/GoogleMapEmbed';

export const LocalRelevance = () => {
  return (
    <section className="py-24 bg-transparent relative z-10 border-y border-white/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary-400">Lage & Anfahrt</h2>
              <p className="font-serif text-4xl md:text-5xl font-bold leading-tight tracking-tighter">
                <span className="bg-gradient-to-b from-white via-white/90 to-white/40 bg-clip-text text-transparent inline-block pb-1">
                  Ihr Ausflugsziel
                </span>
                <br />
                <span className="text-primary-400">nahe Berlin</span>
              </p>
            </div>
            
            <p className="text-accent-200 leading-relaxed text-lg font-light">
              Das Carpe Diem liegt idyllisch am Kurpark von Bad Saarow, nur wenige Schritte von der Saarow Therme entfernt. 
              Perfekt für einen Tagesausflug aus Berlin oder einen entspannten Abend nach dem Wellness.
            </p>

            <div className="grid sm:grid-cols-2 gap-8">
              <div className="flex gap-4 rounded-2xl bg-black/10 border border-white/10 p-4">
                <div className="w-12 h-12 rounded-full bg-black/15 flex items-center justify-center shadow-sm shrink-0 ring-1 ring-white/10">
                  <Train className="w-6 h-6 text-primary-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-xl md:text-2xl">Aus Berlin</h3>
                  <p className="text-sm md:text-base text-accent-200/95">Direkt mit dem RE1 in nur 60 Min. vom Hbf.</p>
                </div>
              </div>
              <div className="flex gap-4 rounded-2xl bg-black/10 border border-white/10 p-4">
                <div className="w-12 h-12 rounded-full bg-black/15 flex items-center justify-center shadow-sm shrink-0 ring-1 ring-white/10">
                  <Car className="w-6 h-6 text-primary-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-xl md:text-2xl">Mit dem Auto</h3>
                  <p className="text-sm md:text-base text-accent-200/95">Über die A12 in ca. 45 Min. aus Berlin-City.</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(siteConfig.location.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary-400 font-bold hover:text-primary-300 transition-colors group"
              >
                <span>Route planen</span>
                <span className="text-xl transition-transform group-hover:translate-x-1">→</span>
              </a>
            </div>
          </div>

          <GoogleMapEmbed
            address={siteConfig.location.address}
            title="Karte: Carpe Diem bei Ben"
            heightClassName="h-[520px] lg:h-[620px]"
          />
        </div>
      </div>
    </section>
  );
};
