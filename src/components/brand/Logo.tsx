import React from 'react';

type LogoProps = {
  className?: string;
  showText?: boolean;
};

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <span className={['inline-flex items-center gap-3', className ?? ''].join(' ')}>
      <svg
        width="42"
        height="42"
        viewBox="0 0 42 42"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-[0_10px_18px_rgba(0,0,0,0.16)] transition-transform duration-300 group-hover:scale-[1.02]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="gold" x1="6" y1="6" x2="38" y2="38" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F3D6A2" />
            <stop offset="0.45" stopColor="#C9853A" />
            <stop offset="1" stopColor="#8A5A2B" />
          </linearGradient>
          <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(14 12) rotate(45) scale(30)">
            <stop stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="21" cy="21" r="19" stroke="url(#gold)" strokeWidth="1.25" opacity="0.9" />
        <circle cx="21" cy="21" r="20" stroke="#FFFFFF" strokeOpacity="0.12" strokeWidth="1" />
        <path
          d="M10 21C12.6 14.6 16.4 11.4 21 11.4C25.6 11.4 29.4 14.6 32 21C29.4 27.4 25.6 30.6 21 30.6C16.4 30.6 12.6 27.4 10 21Z"
          fill="#0B0F12"
          fillOpacity="0.55"
        />
        <path
          d="M10 21C12.6 14.6 16.4 11.4 21 11.4C25.6 11.4 29.4 14.6 32 21C29.4 27.4 25.6 30.6 21 30.6C16.4 30.6 12.6 27.4 10 21Z"
          stroke="url(#gold)"
          strokeOpacity="0.55"
          strokeWidth="0.75"
        />

        <path
          d="M16.2 25.7V16.3H21.1C22.4 16.3 23.5 16.6 24.3 17.3C25.1 18 25.5 18.9 25.5 20C25.5 21 25.1 21.9 24.3 22.6C23.5 23.3 22.4 23.7 21.1 23.7H18.3V25.7H16.2ZM18.3 22H21.0C21.7 22 22.3 21.8 22.7 21.5C23.1 21.2 23.3 20.7 23.3 20.1C23.3 19.5 23.1 19.1 22.7 18.7C22.3 18.4 21.7 18.2 21.0 18.2H18.3V22Z"
          fill="url(#gold)"
          opacity="0.95"
        />
        <path
          d="M26 25.7V16.3H27.7V25.7H26Z"
          fill="url(#gold)"
          opacity="0.9"
        />
        <circle cx="21" cy="21" r="20" fill="url(#glow)" />
      </svg>

      {showText && (
        <span className="leading-none">
          <span className="block font-serif text-[18px] md:text-[20px] font-bold tracking-tight">
            Carpe Diem
          </span>
          <span className="block text-[12px] md:text-[13px] tracking-[0.22em] uppercase opacity-85">
            bei Ben
          </span>
        </span>
      )}
    </span>
  );
}

