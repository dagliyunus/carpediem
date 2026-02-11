import React from 'react';
import Link from 'next/link';
import { SignatureDishesCarousel } from '@/components/sections/SignatureDishesCarousel';

const dishes = [
  {
    name: 'Gourmet Taco Variation',
    description: 'Vier verschiedene Tacos mit hausgemachten Toppings und frischen Kräutern.',
    image:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=85&w=1600',
    category: 'Vorspeise',
  },
  {
    name: 'Lammrippen Kebab',
    description: 'Zarte Lammrippen vom Grill, serviert mit Joghurt-Salat und Grillgemüse.',
    image:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=85&w=1600',
    category: 'Hauptgang',
  },
  {
    name: 'Mediterrane Bowl',
    description: 'Frische Zutaten der Saison, kunstvoll angerichtet mit feinstem Dressing.',
    image:
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=85&w=1600',
    category: 'Dessert',
  },
];

export const SignatureDishes = () => {
  return (
    <section className="py-24 bg-transparent relative z-10 overflow-hidden">
      <div className="w-full">
        <div className="container mx-auto px-4 md:px-6 mb-16">
          <div className="text-center space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.5em] text-primary-400">Kulinarische Highlights</h2>
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
