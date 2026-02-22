'use client';

import React from 'react';
import { Instagram, Music2, Pin } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';
import { Logo } from '@/components/brand/Logo';

const OfficialLogos = {
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="url(#ig-grad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full filter drop-shadow-[0_0_15px_rgba(225,48,108,0.5)]">
      <defs>
        <linearGradient id="ig-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#405DE6" />
          <stop offset="25%" stopColor="#833AB4" />
          <stop offset="50%" stopColor="#E1306C" />
          <stop offset="75%" stopColor="#FD1D1D" />
          <stop offset="100%" stopColor="#FCAF45" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
      <path 
        d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47V18.5c0 1.51-.35 3.05-1.14 4.33-1.01 1.61-2.73 2.74-4.57 3.02-1.84.28-3.79-.11-5.32-1.19-1.53-1.08-2.58-2.83-2.78-4.71-.2-1.88.29-3.83 1.37-5.36 1.08-1.53 2.83-2.58 4.71-2.78 1.88-.2 3.83.29 5.36 1.37.03-.01.06-.02.09-.03V9.07c-1.31-.02-2.61-.01-3.91-.02V0z" 
        fill="white"
        className="drop-shadow-[3px_0_0_#EE1D52] drop-shadow-[-3px_0_0_#69C9D0]"
      />
    </svg>
  ),
  pinterest: (
    <svg viewBox="0 0 24 24" fill="#BD081C" className="w-full h-full filter drop-shadow-[0_0_15px_rgba(189,8,28,0.6)]">
      <path d="M12.289 2C6.617 2 2 6.617 2 12.289c0 4.305 2.605 7.988 6.313 9.53-.088-.803-.166-2.035.035-2.91.181-.784 1.166-4.945 1.166-4.945s-.297-.595-.297-1.474c0-1.383.802-2.416 1.8-2.416.849 0 1.259.637 1.259 1.401 0 .854-.543 2.131-.823 3.314-.234.988.496 1.792 1.47 1.792 1.763 0 3.117-1.861 3.117-4.547 0-2.378-1.708-4.04-4.147-4.04-2.827 0-4.485 2.121-4.485 4.31 0 .854.329 1.77.74 2.27.081.099.093.187.069.288-.076.315-.245.996-.278 1.132-.044.18-.145.218-.335.13-1.254-.584-2.037-2.42-2.037-3.89 0-3.17 2.304-6.08 6.644-6.08 3.488 0 6.198 2.485 6.198 5.807 0 3.465-2.185 6.255-5.216 6.255-1.019 0-1.977-.529-2.304-1.152l-.627 2.392c-.227.873-.839 1.968-1.25 2.628 1.05.324 2.16.498 3.31.498 5.672 0 10.289-4.617 10.289-10.289C22.578 6.617 17.961 2 12.289 2z" />
    </svg>
  ),
};

const socialCards = [
  {
    id: 'instagram',
    name: 'Instagram',
    handle: '@carpediembadsaarow',
    icon: <Instagram className="w-6 h-6" />,
    officialLogo: OfficialLogos.instagram,
    color: 'text-[#E4405F] md:text-white md:group-hover:text-[#E4405F]',
    bgGradient: 'from-[#833AB4] via-[#FD1D1D] to-[#FCB045]',
    description: 'Tägliche Impressionen & Stories aus unserer Küche.',
    link: siteConfig.contact.socials.instagram,
    stats: '12.4k Likes',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    handle: '@carpediem_bs',
    icon: <Music2 className="w-6 h-6" />,
    officialLogo: OfficialLogos.tiktok,
    color: 'text-[#00F2EA] md:text-white md:group-hover:text-[#00F2EA]',
    bgGradient: 'from-[#000000] via-[#EE1D52] to-[#69C9D0]',
    description: 'Behind the Scenes & kulinarische Kurzvideos.',
    link: siteConfig.contact.socials.tiktok,
    stats: '45.2k Views',
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    handle: '@carpediembadsaarow',
    icon: <Pin className="w-6 h-6" />,
    officialLogo: OfficialLogos.pinterest,
    color: 'text-[#BD081C] md:text-white md:group-hover:text-[#BD081C]',
    bgGradient: 'from-[#BD081C] to-[#820000]',
    description: 'Inspirationen für Ihre nächste Feier & Tischdeko.',
    link: siteConfig.contact.socials.pinterest,
    stats: '8.1k Merker',
  },
];

export const SocialMedia = () => {
  return (
    <section className="py-32 bg-transparent relative z-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.5em] text-primary-400">Social Connect</h2>
          <p className="font-serif text-5xl md:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-b from-white via-white/90 to-white/40 bg-clip-text text-transparent inline-block pb-2">
              Bleiben Sie inspiriert
            </span>
          </p>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent mx-auto mt-8" />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {socialCards.map((card) => (
            <a
              key={card.id}
              href={card.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-[4/5] overflow-hidden rounded-[3rem] bg-[#0B0F12] border border-primary-500/30 md:border-white/5 transition-all duration-700 md:hover:-translate-y-2 md:hover:border-primary-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              {/* Matte Texture Overlay */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
              
              {/* Official Branding Background */}
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-[0.12] md:opacity-[0.05] md:group-hover:opacity-[0.12] transition-opacity duration-700`} />
                
                {/* Large Official Platform Logo */}
                <div className="relative transform transition-all duration-1000 w-1/2 h-1/2 flex items-center justify-center opacity-90 scale-110 saturate-150 md:opacity-40 md:scale-100 md:saturate-100 md:group-hover:scale-110 md:group-hover:saturate-150 md:group-hover:opacity-90">
                  {card.officialLogo}
                </div>

                {/* Subtle Radial Glow */}
                <div className="absolute inset-0 bg-radial-gradient from-white/20 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-1000" />
              </div>
              
              {/* Branding Watermark - No Text */}
              <div className="absolute top-8 right-8 opacity-90 md:opacity-30 md:group-hover:opacity-90 transition-opacity duration-700 scale-75 origin-top-right">
                <Logo showText={false} />
              </div>

              {/* Content Overlay */}
              <div className="absolute inset-0 p-10 flex flex-col justify-between z-20">
                <div className="flex justify-between items-start">
                  <div className={`p-4 rounded-2xl bg-black/40 backdrop-blur-xl ring-1 ring-white/10 transition-colors duration-500 ${card.color}`}>
                    {card.icon}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Official Feed</span>
                    <span className="text-[10px] font-bold text-primary-400/80">{card.stats}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-serif text-3xl font-bold text-white tracking-tight">{card.name}</h3>
                    <p className="text-primary-400 text-sm font-medium tracking-wide">{card.handle}</p>
                  </div>
                  <p className="text-accent-300 text-sm leading-relaxed font-light opacity-100 translate-y-0 md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-500">
                    {card.description}
                  </p>
                  
                  <div className="pt-4">
                    <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-400 md:text-white md:group-hover:text-primary-400 transition-colors">
                      <span>Kanal entdecken</span>
                      <span className="text-lg transition-transform md:group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </div>
              </div>

            </a>
          ))}
        </div>

        {/* Collaboration Note */}
        <div className="mt-20 text-center">
          <p className="text-accent-300 text-base md:text-lg font-light tracking-wide italic">
            Sie sind Content Creator oder möchten mit uns kooperieren? 
            <a href={`mailto:${siteConfig.contact.email}`} className="text-primary-400 font-bold hover:underline ml-2 not-italic text-base md:text-lg">
              Lassen Sie uns sprechen.
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};
