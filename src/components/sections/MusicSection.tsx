'use client';

import React from 'react';
import Image from 'next/image';
import { AudioLines, Crown, HandCoins, Handshake, Music } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';

export const MusicSection = () => {
  return (
    <section className="py-32 bg-transparent relative z-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Visual Part */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-primary-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              
              <div className="relative aspect-[4/5] md:aspect-square">
                {/* Smoke Decorative Background - Mobile: Horizontal Top-behind | Desktop: Left-behind */}
                <div className="absolute inset-0 w-full h-full -translate-y-[60%] rotate-90 md:rotate-0 md:translate-y-0 md:-translate-x-[50%] pointer-events-none z-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]">
                  <Image
                    src="/images/smoke.png"
                    alt="Smoke Decoration"
                    fill
                    className="object-cover filter brightness-150 contrast-125 opacity-100 mix-blend-screen"
                  />
                </div>

                <div className="relative z-10 w-full h-full rounded-[3.5rem] overflow-hidden shadow-2xl ring-1 ring-white/10">
                  <Image
                    src="https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=85&w=1200"
                    alt="Premium Live Music Atmosphere"
                    fill
                    className="object-cover transition-transform duration-[2s] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  
                  {/* Floating Badge */}
                  <div className="absolute bottom-10 left-10 right-10 p-8 rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/10 space-y-2">
                    <p className="text-primary-400 text-xs font-bold uppercase tracking-[0.3em]">The Stage is Yours</p>
                    <h3 className="text-white font-serif text-2xl">Voll ausgestattetes Pro-Equipment vor Ort.</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Part */}
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary-500/10 ring-1 ring-primary-500/20">
                    <Music className="w-5 h-5 text-primary-400" />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-[0.4em] text-primary-400">Artists Welcome</span>
                </div>
                <h2 className="font-serif text-6xl md:text-8xl font-bold leading-[0.9] tracking-tighter">
                  <span className="bg-gradient-to-b from-white via-white/90 to-white/40 bg-clip-text text-transparent inline-block pb-2">
                    Wir lieben
                  </span>
                  <br />
                  <span className="text-primary-400">Musiker.</span>
                </h2>
                <p className="text-accent-200 text-xl md:text-2xl font-light leading-relaxed">
                  Ob aufstrebendes Talent oder erfahrener Profi – im Carpe Diem bieten wir Ihnen die Bühne, die Ihre Kunst verdient. Schaffen Sie mit uns unvergessliche Momente.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-4 p-6 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors group">
                  <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center ring-1 ring-primary-500/20 group-hover:scale-110 transition-transform">
                    <Crown className="w-6 h-6 text-primary-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-white font-bold text-lg tracking-wide">VIP Atmosphäre</h3>
                    <p className="text-accent-400 text-sm font-light leading-relaxed">Ein exklusiver Rahmen, der Ihre Performance zum Leuchten bringt.</p>
                  </div>
                </div>

                <div className="space-y-4 p-6 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors group">
                  <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center ring-1 ring-primary-500/20 group-hover:scale-110 transition-transform">
                    <HandCoins className="w-6 h-6 text-primary-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-white font-bold text-lg tracking-wide">Faire Gagen</h3>
                    <p className="text-accent-400 text-sm font-light leading-relaxed">Wir schätzen Ihre Arbeit und bieten attraktive Verdienstmöglichkeiten.</p>
                  </div>
                </div>

                <div className="space-y-4 p-6 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors group">
                  <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center ring-1 ring-primary-500/20 group-hover:scale-110 transition-transform">
                    <AudioLines className="w-6 h-6 text-primary-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-white font-bold text-lg tracking-wide">Full Equipment</h3>
                    <p className="text-accent-400 text-sm font-light leading-relaxed">Hochwertige PA, Mikrofone und Stage-Monitoring sind startbereit.</p>
                  </div>
                </div>

                <div className="space-y-4 p-6 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors group">
                  <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center ring-1 ring-primary-500/20 group-hover:scale-110 transition-transform">
                    <Handshake className="w-6 h-6 text-primary-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-white font-bold text-lg tracking-wide">Network & Friends</h3>
                    <p className="text-accent-400 text-sm font-light leading-relaxed">Bringen Sie Ihre Community mit und feiern Sie gemeinsam bei uns.</p>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <a
                  href={`mailto:${siteConfig.contact.email}?subject=Musiker%20Anfrage%20-%20Carpe%20Diem`}
                  className="group relative inline-flex h-18 items-center justify-center overflow-hidden rounded-full bg-primary-600 px-16 text-lg font-bold text-white transition-all hover:bg-primary-700 shadow-[0_20px_60px_rgba(201,133,58,0.4)] ring-1 ring-white/10"
                >
                  <span className="relative z-10">Jetzt Kontakt aufnehmen</span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
