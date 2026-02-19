'use client';

import React, { useEffect, useRef, useState } from 'react';

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
};

export function Reveal({ children, className, delayMs = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return typeof IntersectionObserver === 'undefined';
  });

  useEffect(() => {
    const el = ref.current;
    if (!el || isVisible) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry) return;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -5% 0px', threshold: 0.05 }
    );

    observer.observe(el);

    // Fallback: if the observer never fires on some mobile browsers,
    // keep content accessible instead of leaving it invisible.
    const failSafeTimer = window.setTimeout(() => {
      setIsVisible((current) => (current ? current : true));
    }, 1200);

    return () => {
      window.clearTimeout(failSafeTimer);
      observer.disconnect();
    };
  }, [isVisible]);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={[
        'motion-reduce:transition-none',
        'transition duration-700 ease-out',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
        className ?? '',
      ].join(' ')}
    >
      {children}
    </div>
  );
}
