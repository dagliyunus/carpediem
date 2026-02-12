'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Menü', href: '/menu' },
  { name: 'Getränke', href: '/drinks' },
  { name: 'Galerie', href: '/galerie' },
  { name: 'Kontakt', href: '/kontakt' },
];

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState<{ open: boolean; path: string }>({
    open: false,
    path: '',
  });
  const pathname = usePathname();
  const isMobileMenuOpen = mobileMenu.open && mobileMenu.path === pathname;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    if (typeof window === 'undefined') return;

    const scrollY = window.scrollY;
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyPosition = document.body.style.position;
    const prevBodyTop = document.body.style.top;
    const prevBodyWidth = document.body.style.width;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.position = prevBodyPosition;
      document.body.style.top = prevBodyTop;
      document.body.style.width = prevBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [isMobileMenuOpen]);

  const headerClassName = (() => {
    if (isMobileMenuOpen) return 'bg-[#050505] py-3 shadow-2xl';
    if (isScrolled) return 'bg-black/80 py-3 backdrop-blur-lg shadow-2xl';
    return 'bg-gradient-to-b from-black/60 to-transparent py-6';
  })();

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${headerClassName}`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="group flex items-center space-x-2">
            <Logo />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center space-x-10 lg:flex">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-[13px] font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:text-primary-400 ${
                  pathname === item.href
                    ? 'text-primary-400'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/reservieren"
              className="inline-flex h-11 items-center justify-center rounded-full bg-primary-600 px-8 text-[13px] font-bold uppercase tracking-[0.15em] text-white shadow-xl transition-all hover:bg-primary-700 hover:scale-105 active:scale-95 ring-1 ring-white/10"
            >
              Tisch reservieren
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-md lg:hidden text-white"
            onClick={() =>
              setMobileMenu((prev) => {
                const isOpenForCurrentPath = prev.open && prev.path === pathname;
                return isOpenForCurrentPath
                  ? { open: false, path: pathname }
                  : { open: true, path: pathname };
              })
            }
            aria-label="Menü öffnen"
          >
            <div className="relative h-6 w-6">
              <span
                className={`absolute left-0 top-1/2 block h-0.5 w-full bg-current transition-all duration-300 ${
                  isMobileMenuOpen ? 'rotate-45' : '-translate-y-1'
                }`}
              />
              <span
                className={`absolute left-0 top-1/2 block h-0.5 w-full bg-current transition-all duration-300 ${
                  isMobileMenuOpen ? '-rotate-45' : 'translate-y-1'
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[60] overscroll-contain bg-[#050505] transition-all duration-500 lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
      >
        {/* Background Layer (Color + Blur) */}
        <div className="absolute inset-0 bg-[#050505]" />

        {/* Background Monogram */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
          <div className="relative w-full h-full max-w-[80vw] max-h-[80vh] opacity-100 -translate-y-[35%]">
            <Image
              src="/images/hero-bg-premium.svg"
              alt="Background Monogram"
              fill
              className="object-contain scale-150 filter brightness-[300%] contrast-[200%]"
            />
          </div>
        </div>

        {/* Menu Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Close Button Header Area */}
          <div className="sticky top-0 z-20 flex items-center justify-between p-6 bg-[#050505] border-b border-white/10">
            <Logo />
            <button
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 border border-white/20 text-white shadow-lg active:scale-95 transition-all"
              onClick={() => setMobileMenu({ open: false, path: pathname })}
              aria-label="Menü schließen"
            >
              <div className="relative h-6 w-6">
                <span className="absolute left-0 top-1/2 block h-0.5 w-full bg-current transition-all duration-300 rotate-45" />
                <span className="absolute left-0 top-1/2 block h-0.5 w-full bg-current transition-all duration-300 -rotate-45" />
              </div>
            </button>
          </div>

          <div className="flex-grow flex flex-col items-center justify-center space-y-10 p-6 text-center">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenu({ open: false, path: pathname })}
                className="text-2xl sm:text-3xl font-sans font-semibold text-white/85 tracking-[0.14em] uppercase hover:text-primary-400 transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/reservieren"
              onClick={() => setMobileMenu({ open: false, path: pathname })}
              className="inline-flex h-16 items-center justify-center rounded-full bg-primary-600 px-12 text-lg font-bold text-white shadow-2xl ring-1 ring-white/10"
            >
              Tisch reservieren
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
