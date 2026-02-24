import React from 'react';
import Link from 'next/link';
import { SignatureDishesCarousel } from '@/components/sections/SignatureDishesCarousel';

const dishes = [
  {
    name: 'Mediterrane Bowl',
    description: 'Frische Zutaten der Saison, kunstvoll angerichtet mit feinstem Dressing.',
    image:
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=85&w=1600',
    category: 'Dessert',
  },
];

const weeklySpecials = [
  {
    day: 'Jeden Donnerstag',
    title: 'Argentinisches Entrecôte',
    description: 'ca. 250 g mit Rosmarinkartoffeln und Salat',
    price: '22,- €',
  },
  {
    day: 'Jeden Freitag',
    title: 'Spaghetti',
    price: 'je 14,- €',
    options: [
      'mit Lachs und Parmesan',
      'mit Hähnchenbrustfilet',
      'mit Meererfruechten',
    ],
  },
  {
    day: 'Jeden Sonntag',
    title: 'Manti',
    price: '12,50 €',
    description:
      'mit Hackfleisch gefullte Teigtaschen, dazu Joghurt-Knoblauch-Soße',
  },
];

export const SignatureDishes = () => {
  return (
    <section className="py-24 bg-transparent relative z-10 overflow-hidden">
      <div className="w-full">
        <div className="container mx-auto px-4 md:px-6 mb-16">
          <div className="text-center space-y-4">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.5em] text-primary-400">Kulinarische Highlights</h2>
            <p className="font-serif text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-b from-white via-white/90 to-white/40 bg-clip-text text-transparent inline-block pb-2">
                Unsere Empfehlungen
              </span>
            </p>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent mx-auto mt-8" />
          </div>
        </div>

        <div className="w-full relative px-0">
          <SignatureDishesCarousel dishes={dishes} />
        </div>

        <div className="container mx-auto px-4 md:px-6 mt-14 md:mt-18">
          <div className="rounded-[2.25rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 md:p-8 lg:p-10 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.65)]">
            <div className="mb-8 text-center space-y-3">
              <p className="text-sm md:text-base font-bold uppercase tracking-[0.45em] text-primary-400">
                Wochen-Spezialitaeten
              </p>
              <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-primary-500/60 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
              {weeklySpecials.map((special) => (
                <article
                  key={special.day}
                  className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/30 p-6 md:p-7 shadow-2xl backdrop-blur-sm"
                >
                  <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(219,165,93,0.2),transparent_55%)]" />
                  <div className="relative z-10 space-y-4">
                    <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.35em] text-primary-300">
                      {special.day}
                    </p>
                    <h3 className="font-serif text-3xl md:text-4xl leading-[0.9] font-bold tracking-tight text-white">
                      {special.title}
                    </h3>
                    {special.description ? (
                      <p className="text-accent-200/90 text-base leading-relaxed font-light">
                        {special.description}
                      </p>
                    ) : null}
                    {special.options ? (
                      <ul className="space-y-2 text-accent-200/90 text-base leading-relaxed font-light">
                        {special.options.map((option) => (
                          <li key={option} className="flex items-start gap-2">
                            <span className="mt-2 block h-1.5 w-1.5 rounded-full bg-primary-400 shrink-0" />
                            <span>{option}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <div className="pt-3">
                      <p className="font-serif text-4xl md:text-5xl font-bold text-primary-300 tracking-tight">
                        {special.price}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/menu"
            className="inline-flex h-12 items-center justify-center rounded-full border-2 border-primary-600 px-8 text-sm font-bold text-primary-600 hover:bg-primary-600 hover:text-white transition-all"
          >
            Vollständige Speisekarte
          </Link>
        </div>
      </div>
    </section>
  );
};
