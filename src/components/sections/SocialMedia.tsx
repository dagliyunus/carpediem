import React from 'react';
import { Instagram, Music2, Pin, Facebook, Youtube, Linkedin, Share2 } from 'lucide-react';
import { getPublicSiteRuntime } from '@/lib/cms/runtime';

type IconProps = {
  className?: string;
};

const iconMap: Record<string, React.ComponentType<IconProps>> = {
  instagram: Instagram,
  tiktok: Music2,
  pinterest: Pin,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  x: Share2,
};

const gradientMap: Record<string, string> = {
  instagram: 'from-[#833AB4] via-[#FD1D1D] to-[#FCB045]',
  tiktok: 'from-[#111111] via-[#EE1D52] to-[#69C9D0]',
  pinterest: 'from-[#BD081C] to-[#820000]',
  facebook: 'from-[#1877F2] to-[#0A3C90]',
  youtube: 'from-[#FF0000] to-[#7F0000]',
  linkedin: 'from-[#0A66C2] to-[#003B78]',
  x: 'from-[#222222] to-[#555555]',
};

export const SocialMedia = async () => {
  const runtime = await getPublicSiteRuntime();

  const cards = runtime.social.map((item) => {
    const key = String(item.platform).toLowerCase();
    return {
      id: item.id,
      title: item.displayName || item.platform,
      handle: item.handle || item.url.replace(/^https?:\/\//, ''),
      link: item.url,
      description:
        key === 'instagram'
          ? 'Tägliche Impressionen und Stories aus der Küche.'
          : key === 'tiktok'
            ? 'Kurzvideos, Eindrücke und Behind-the-Scenes Inhalte.'
            : key === 'pinterest'
              ? 'Inspirationen für Events, Dekoration und Kulinarik.'
              : 'Aktuelle Inhalte und Neuigkeiten aus unserem Haus.',
      icon: iconMap[key] || Share2,
      gradient: gradientMap[key] || 'from-primary-600 to-primary-800',
    };
  });

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
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <a
                key={card.id}
                href={card.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0B0F12] p-8 transition-all duration-500 hover:-translate-y-1 hover:border-primary-500/40"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-10 transition-opacity duration-500 group-hover:opacity-20`} />
                <div className="relative z-10 space-y-5">
                  <div className="inline-flex rounded-2xl bg-black/40 p-4 ring-1 ring-white/10 text-primary-300">
                    <Icon className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-white">{card.title}</h3>
                    <p className="text-sm text-primary-300">{card.handle}</p>
                  </div>
                  <p className="text-sm leading-relaxed text-accent-200">{card.description}</p>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-300">Kanal entdecken →</p>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
