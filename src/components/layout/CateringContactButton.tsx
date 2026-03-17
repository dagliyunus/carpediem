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
        className="group block transition-transform duration-300 hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        <div className="relative h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-32 lg:w-32">
          <Image
            src="/images/catering_logo.webp"
            alt="Catering Kontakt"
            fill
            sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, (max-width: 1024px) 112px, 128px"
            className="object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)]"
            priority
          />
        </div>
      </Link>
    </div>
  );
}