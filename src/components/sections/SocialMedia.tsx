import React from 'react';
import { Instagram, Music2, Pin, Facebook, Youtube, Linkedin, Share2 } from 'lucide-react';
import { getPublicSiteRuntime } from '@/lib/cms/runtime';
import { Logo } from '@/components/brand/Logo';
import { siteConfig } from '@/config/siteConfig';

type IconProps = {
  className?: string;
};

const OfficialInstagramLogo = ({ id }: { id: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke={`url(#${id})`}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-full w-full filter drop-shadow-[0_0_15px_rgba(225,48,108,0.5)]"
  >
    <defs>
      <linearGradient id={id} x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
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
);

const OfficialTikTokLogo = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-full w-full filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
    <path
      d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47V18.5c0 1.51-.35 3.05-1.14 4.33-1.01 1.61-2.73 2.74-4.57 3.02-1.84.28-3.79-.11-5.32-1.19-1.53-1.08-2.58-2.83-2.78-4.71-.2-1.88.29-3.83 1.37-5.36 1.08-1.53 2.83-2.58 4.71-2.78 1.88-.2 3.83.29 5.36 1.37.03-.01.06-.02.09-.03V9.07c-1.31-.02-2.61-.01-3.91-.02V0z"
      fill="white"
      className="drop-shadow-[3px_0_0_#EE1D52] drop-shadow-[-3px_0_0_#69C9D0]"
    />
  </svg>
);

const OfficialPinterestLogo = () => (
  <svg viewBox="0 0 24 24" fill="#BD081C" className="h-full w-full filter drop-shadow-[0_0_15px_rgba(189,8,28,0.6)]">
    <path d="M12.289 2C6.617 2 2 6.617 2 12.289c0 4.305 2.605 7.988 6.313 9.53-.088-.803-.166-2.035.035-2.91.181-.784 1.166-4.945 1.166-4.945s-.297-.595-.297-1.474c0-1.383.802-2.416 1.8-2.416.849 0 1.259.637 1.259 1.401 0 .854-.543 2.131-.823 3.314-.234.988.496 1.792 1.47 1.792 1.763 0 3.117-1.861 3.117-4.547 0-2.378-1.708-4.04-4.147-4.04-2.827 0-4.485 2.121-4.485 4.31 0 .854.329 1.77.74 2.27.081.099.093.187.069.288-.076.315-.245.996-.278 1.132-.044.18-.145.218-.335.13-1.254-.584-2.037-2.42-2.037-3.89 0-3.17 2.304-6.08 6.644-6.08 3.488 0 6.198 2.485 6.198 5.807 0 3.465-2.185 6.255-5.216 6.255-1.019 0-1.977-.529-2.304-1.152l-.627 2.392c-.227.873-.839 1.968-1.25 2.628 1.05.324 2.16.498 3.31.498 5.672 0 10.289-4.617 10.289-10.289C22.578 6.617 17.961 2 12.289 2z" />
  </svg>
);

const OfficialFallbackLogo = ({ icon: Icon }: { icon: React.ComponentType<IconProps> }) => (
  <div className="flex h-full w-full items-center justify-center rounded-full border border-white/20 bg-black/40">
    <Icon className="h-14 w-14 text-white/90" />
  </div>
);

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
  tiktok: 'from-[#000000] via-[#EE1D52] to-[#69C9D0]',
  pinterest: 'from-[#BD081C] to-[#820000]',
  facebook: 'from-[#1877F2] to-[#0A3C90]',
  youtube: 'from-[#FF0000] to-[#7F0000]',
  linkedin: 'from-[#0A66C2] to-[#003B78]',
  x: 'from-[#222222] to-[#555555]',
};

export const SocialMedia = async () => {
  const runtime = await getPublicSiteRuntime();
  const contactEmail = runtime.site?.businessEmail || siteConfig.contact.email;

  const cards = runtime.social.map((item) => {
    const key = String(item.platform).toLowerCase();
    const icon = iconMap[key] || Share2;
    return {
      id: item.id,
      key,
      title: item.displayName || item.platform,
      handle: item.handle || item.url.replace(/^https?:\/\//, ''),
      link: item.url,
      description:
        key === 'instagram'
          ? 'Tägliche Impressionen & Stories aus unserer Küche.'
          : key === 'tiktok'
            ? 'Behind the Scenes & kulinarische Kurzvideos.'
            : key === 'pinterest'
              ? 'Inspirationen für Ihre nächste Feier & Tischdeko.'
              : 'Aktuelle Inhalte und Neuigkeiten aus unserem Haus.',
      icon,
      gradient: gradientMap[key] || 'from-primary-600 to-primary-800',
      color:
        key === 'instagram'
          ? 'text-[#E4405F] md:text-white md:group-hover:text-[#E4405F]'
          : key === 'tiktok'
            ? 'text-[#00F2EA] md:text-white md:group-hover:text-[#00F2EA]'
            : key === 'pinterest'
              ? 'text-[#BD081C] md:text-white md:group-hover:text-[#BD081C]'
              : 'text-primary-300 md:text-white md:group-hover:text-primary-300',
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
            const officialLogo =
              card.key === 'instagram' ? (
                <OfficialInstagramLogo id={`ig-grad-${card.id}`} />
              ) : card.key === 'tiktok' ? (
                <OfficialTikTokLogo />
              ) : card.key === 'pinterest' ? (
                <OfficialPinterestLogo />
              ) : (
                <OfficialFallbackLogo icon={Icon} />
              );

            return (
              <a
                key={card.id}
                href={card.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-[4/5] overflow-hidden rounded-[3rem] border border-primary-500/30 bg-[#0B0F12] shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-700 md:border-white/5 md:hover:-translate-y-2 md:hover:border-primary-500/30"
              >
                <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay" />
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-[0.12] transition-opacity duration-700 md:opacity-[0.05] md:group-hover:opacity-[0.12]`}
                  />
                  <div className="relative flex h-1/2 w-1/2 scale-110 items-center justify-center opacity-90 saturate-150 transition-all duration-1000 md:scale-100 md:opacity-40 md:saturate-100 md:group-hover:scale-110 md:group-hover:opacity-90 md:group-hover:saturate-150">
                    {officialLogo}
                  </div>
                  <div className="absolute inset-0 bg-radial-gradient from-white/20 to-transparent opacity-100 transition-opacity duration-1000 md:opacity-0 md:group-hover:opacity-100" />
                </div>
                <div className="absolute right-8 top-8 origin-top-right scale-75 opacity-90 transition-opacity duration-700 md:opacity-30 md:group-hover:opacity-90">
                  <Logo showText={false} />
                </div>

                <div className="absolute inset-0 z-20 flex flex-col justify-between p-10">
                  <div className="flex items-start justify-between">
                    <div
                      className={`rounded-2xl bg-black/40 p-4 backdrop-blur-xl ring-1 ring-white/10 transition-colors duration-500 ${card.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Official Feed</span>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-serif text-3xl font-bold tracking-tight text-white">{card.title}</h3>
                      <p className="text-sm font-medium tracking-wide text-primary-400">{card.handle}</p>
                    </div>
                    <p className="translate-y-0 text-sm font-light leading-relaxed text-accent-300 opacity-100 transition-all duration-500 md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
                      {card.description}
                    </p>

                    <div className="pt-4">
                      <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-400 transition-colors md:text-white md:group-hover:text-primary-400">
                        <span>Kanal entdecken</span>
                        <span className="text-lg transition-transform md:group-hover:translate-x-1">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        <div className="mt-20 text-center">
          <p className="text-base font-light italic tracking-wide text-accent-300 md:text-lg">
            Sie sind Content Creator oder möchten mit uns kooperieren?
            <a
              href={`mailto:${contactEmail}`}
              className="ml-2 text-base font-bold text-primary-400 not-italic hover:underline md:text-lg"
            >
              Lassen Sie uns sprechen.
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};
