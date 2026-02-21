import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/siteConfig';
import {
  DrinkRow,
  drinkAdditiveInfo,
  drinkAllergenInfo,
  leftDrinkSections,
  rightDrinkSections,
} from '@/data/drinks';

export const metadata: Metadata = {
  title: 'Getränke',
  description:
    'Unsere Getränkekarte im Carpe Diem Bad Saarow mit Aperitivo, alkoholfreien Getränken, Weinen, Bieren und Spirituosen.',
};

function renderDrinkRow(row: DrinkRow) {
  if (row.type === 'subheading') {
    return (
      <p key={row.text} className="pt-2 text-xl md:text-2xl font-serif text-primary-300 italic">
        {row.text}
      </p>
    );
  }

  return (
    <div key={`${row.name}-${row.price ?? ''}`} className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-4">
        <p
          className={[
            'text-white leading-tight',
            row.style === 'emphasis' ? 'italic font-semibold text-primary-100' : 'font-semibold',
          ].join(' ')}
        >
          {row.name}
        </p>
        {row.price ? <p className="shrink-0 font-bold text-primary-400">{row.price}</p> : null}
      </div>

      {row.variants ? (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm md:text-base">
          {row.variants.map((variant) => (
            <div key={`${row.name}-${variant.size}`} className="inline-flex items-baseline gap-2">
              <span className="text-accent-300">{variant.size}</span>
              <span className="font-bold text-primary-400">{variant.price}</span>
            </div>
          ))}
        </div>
      ) : null}

      {row.details?.map((detail) => (
        <p key={detail} className="text-sm text-accent-300/90 italic leading-relaxed">
          {detail}
        </p>
      ))}
    </div>
  );
}

export default function DrinksPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-6">
            <h1 className="font-serif text-6xl md:text-8xl font-bold text-white tracking-tight">Getränke</h1>
            <p className="text-accent-200 text-xl max-w-2xl mx-auto font-light">
              Aperitivo, alkoholfreie Getränke, warme Getränke, Biere, Weine und Spirituosen
              aus unserer aktuellen Karte.
            </p>
            <div className="pt-8">
              <a
                href={siteConfig.menu.drinksPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-sm font-bold text-primary-400 hover:text-primary-300 transition-colors uppercase tracking-widest group"
              >
                <span>Getränkekarte als PDF laden</span>
                <span className="text-lg transition-transform group-hover:translate-y-1">↓</span>
              </a>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-8">
              {leftDrinkSections.map((section) => (
                <section
                  key={section.title}
                  className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8 space-y-6"
                >
                  <div className="text-center space-y-3">
                    <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-300">
                      {section.title}
                    </h2>
                    <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent mx-auto" />
                  </div>
                  <div className="space-y-4">{section.rows.map((row) => renderDrinkRow(row))}</div>
                </section>
              ))}
            </div>

            <div className="space-y-8">
              {rightDrinkSections.map((section) => (
                <section
                  key={section.title}
                  className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8 space-y-6"
                >
                  <div className="text-center space-y-3">
                    <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-300">
                      {section.title}
                    </h2>
                    <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent mx-auto" />
                  </div>
                  <div className="space-y-4">{section.rows.map((row) => renderDrinkRow(row))}</div>
                </section>
              ))}
            </div>
          </div>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8 space-y-8">
            <div className="text-center space-y-3">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-300">
                Allergene & Zusatzstoffe
              </h2>
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent mx-auto" />
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="font-semibold text-white text-xl">Allergene</h3>
                <ul className="space-y-2">
                  {drinkAllergenInfo.map((item) => (
                    <li key={item} className="text-accent-200 leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-white text-xl">Zusatzstoffe</h3>
                <ul className="space-y-2">
                  {drinkAdditiveInfo.map((item) => (
                    <li key={item} className="text-accent-200 leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
