import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { siteConfig } from '@/config/siteConfig';
import { CookieSettingsButton } from '@/components/layout/CookieSettingsButton';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black/80 text-accent-50 py-24 border-t border-white/5 relative z-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-16 lg:grid-cols-4">
          {/* Brand & Description */}
          <div className="flex h-full flex-col">
            <h2 className="font-serif text-3xl font-bold tracking-tight">{siteConfig.name}</h2>
            <p className="mt-6 text-accent-300 text-sm leading-relaxed max-w-xs font-light">
              Premium Restaurant in Bad Saarow. Mediterrane Küche in entspannter Atmosphäre direkt am Kurpark.
            </p>
            <div className="mt-auto pt-8">
              <span className="inline-flex items-center justify-center rounded-[1.1rem] bg-white/95 px-2.5 py-1 ring-1 ring-white/80 shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-md">
                <Image
                  src="/images/logo_carpediem.webp"
                  alt="Carpe Diem bei Ben Logo"
                  width={260}
                  height={173}
                  className="h-16 w-auto object-contain"
                />
              </span>
            </div>
          </div>

          {/* Contact & Location */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-400">Kontakt</h3>
            <ul className="space-y-3 text-sm text-accent-200 font-light">
              <li className="flex items-start gap-3">
                <span className="text-primary-300/95 font-medium">Addr.</span>
                <span>{siteConfig.location.address}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-300/95 font-medium">Tel.</span>
                <a href={`tel:${siteConfig.contact.phone.replace(/\s/g, '')}`} className="hover:text-primary-400 transition-colors">
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-300/95 font-medium">Mail.</span>
                <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-primary-400 transition-colors">
                  {siteConfig.contact.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-400">Öffnungszeiten</h3>
            <ul className="space-y-2 text-sm text-accent-200 font-light">
              {siteConfig.openingHours.map((item) => (
                <li key={item.days} className="flex justify-between gap-8">
                  <span className="text-accent-400">{item.days}</span>
                  <span className={item.open === 'Ruhetag' ? 'text-primary-500 italic' : ''}>
                    {item.open === 'Ruhetag' ? 'Ruhetag' : `${item.open} - ${item.close}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-400">Rechtliches</h3>
            <ul className="space-y-3 text-sm text-accent-200 font-light">
              <li>
                <Link href="/impressum" className="hover:text-primary-400 transition-colors">Impressum</Link>
              </li>
              <li>
                <Link href="/datenschutz" className="hover:text-primary-400 transition-colors">Datenschutz</Link>
              </li>
              <li>
                <CookieSettingsButton />
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <p className="text-[10px] text-accent-500 uppercase tracking-widest font-bold">
            &copy; {currentYear} {siteConfig.name} &middot; Alle Rechte vorbehalten.
          </p>
          <div className="flex space-x-10">
            {Object.entries(siteConfig.contact.socials)
              .filter(([name]) => name.toLowerCase() !== 'facebook')
              .map(([name, url]) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-400 hover:text-primary-400 transition-all hover:scale-110 capitalize text-[10px] font-bold uppercase tracking-widest"
              >
                {name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
