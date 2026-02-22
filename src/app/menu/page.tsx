import React from 'react';
import { Metadata } from 'next';
import {
  aegeisCuisineItems,
  burgerColumns,
  fishDisplayHeadline,
  grillItems,
  menuServiceNote,
  saladNote,
  sideDishColumns,
} from '@/data/menu';

export const metadata: Metadata = {
  title: 'Speisekarte',
  description: 'Entdecken Sie unsere mediterrane Speisekarte im Carpe Diem Bad Saarow. Von gegrilltem Oktopus bis hin zu hausgemachtem Baklava.',
};

export default function MenuPage() {
  const renderMenuRows = (
    rows: {
      name: string;
      price: string;
      details?: string[];
      style?: 'default' | 'addon' | 'bullet';
    }[]
  ) => {
    return rows.map((item) => (
      <div key={`${item.name}-${item.price}`} className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-4">
          <p
            className={[
              'text-white leading-tight',
              item.style === 'addon' ? 'pl-3 font-semibold italic' : 'font-semibold',
              item.style === 'bullet' ? "before:mr-2 before:content-['•']" : '',
            ].join(' ')}
          >
            {item.name}
          </p>
          <p className="shrink-0 font-bold text-primary-400">{item.price}</p>
        </div>
        {item.details?.map((line) => (
          <p key={line} className="text-accent-300/90 text-sm font-light italic leading-relaxed">
            {line}
          </p>
        ))}
      </div>
    ));
  };

  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto space-y-20">
          <div className="text-center space-y-6">
            <h1 className="font-serif text-6xl md:text-8xl font-bold text-white tracking-tight">Speisekarte</h1>
            <p className="text-accent-200 text-xl max-w-2xl mx-auto font-light">
              Mediterrane Spezialitäten aus der Ägäis, Grillgerichte, Burger und Vorspeisen
              mit allen aktuellen Angaben aus unserer Karte.
            </p>
          </div>

          <section className="space-y-10">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8 space-y-6">
                <div className="text-center space-y-3">
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-white">
                    Mediterrane Küche aus der Ägäis
                  </h2>
                  <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent mx-auto" />
                </div>
                <div className="space-y-4">{renderMenuRows(aegeisCuisineItems)}</div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8 space-y-6">
                <div className="text-center space-y-3">
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-white">
                    Fisch und Fleisch vom Grill
                  </h2>
                  <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent mx-auto" />
                </div>
                <div className="space-y-4">{renderMenuRows(grillItems)}</div>
              </div>
            </div>

            <div className="text-center rounded-full border border-primary-500/50 bg-primary-500/10 px-6 py-3 w-fit mx-auto">
              <p className="text-white font-semibold">{menuServiceNote}</p>
            </div>
          </section>

          <section className="space-y-12">
            <h2 className="text-center font-serif text-5xl md:text-7xl font-bold text-white tracking-tight">
              {fishDisplayHeadline}
            </h2>

            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex rounded-full border border-primary-500/50 bg-primary-500/10 px-6 py-2">
                  <h3 className="font-serif text-3xl text-primary-300">Hausgemachte Burger</h3>
                </div>
              </div>
              <div className="grid gap-8 lg:grid-cols-2">
                {burgerColumns.map((column, idx) => (
                  <div
                    key={`burger-column-${idx + 1}`}
                    className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8 space-y-4"
                  >
                    {renderMenuRows(column)}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex rounded-full border border-primary-500/50 bg-primary-500/10 px-6 py-2">
                  <h3 className="font-serif text-3xl text-primary-300">Unsere Vorspeisen und Beilagen</h3>
                </div>
              </div>
              <div className="grid gap-8 lg:grid-cols-2">
                {sideDishColumns.map((column, idx) => (
                  <div
                    key={`side-column-${idx + 1}`}
                    className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8 space-y-4"
                  >
                    {renderMenuRows(column)}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-primary-500/35 bg-primary-500/10 px-6 py-5 text-center">
              <p className="text-primary-100 text-lg font-semibold">{saladNote}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
