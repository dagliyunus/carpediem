import React from 'react';

type GoogleMapEmbedProps = {
  address: string;
  className?: string;
  heightClassName?: string;
  title?: string;
};

export function GoogleMapEmbed({
  address,
  className,
  heightClassName = 'h-[420px]',
  title = 'Karte',
}: GoogleMapEmbedProps) {
  const src = `https://www.google.com/maps?q=${encodeURIComponent(address)}&t=k&output=embed`;

  return (
    <div className={['relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl', className ?? ''].join(' ')}>
      <div className={['relative w-full', heightClassName].join(' ')}>
        <iframe
          title={title}
          src={src}
          className="absolute inset-0 h-full w-full opacity-90 saturate-[0.8] contrast-[1.1]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
    </div>
  );
}

