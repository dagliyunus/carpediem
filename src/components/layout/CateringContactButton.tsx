'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function CateringContactButton() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="fixed right-3 top-24 z-40 sm:right-4 sm:top-28 md:right-6 md:top-32">
      <Link
        href="/kontakt#kontaktformular"
        aria-label="Direkt zum Kontaktformular für Catering"
        className="group flex rounded-[1.25rem] border border-white/15 bg-black/70 p-2 shadow-[0_20px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] hover:border-primary-400/60 hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative h-14 w-14 overflow-hidden rounded-[0.95rem] bg-white/95 ring-1 ring-white/70 sm:h-16 sm:w-16 md:h-20 md:w-20">
            <Image
              src="/images/catering_logo.webp"
              alt="Catering Kontakt"
              fill
              sizes="(max-width: 640px) 56px, (max-width: 768px) 64px, 80px"
              className="object-contain p-1.5"
              priority
            />
          </div>
          <div className="hidden max-w-[132px] pr-1 sm:block md:max-w-[148px]">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-300 md:text-[11px]">
              Catering
            </p>
            <p className="mt-1 text-xs font-semibold leading-snug text-white md:text-sm">
              Direkt zum Kontaktformular
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}