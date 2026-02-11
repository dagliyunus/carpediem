import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/siteConfig';

export const metadata: Metadata = {
  title: 'Getränke',
  description: 'Unsere Weinkarte und Getränkeauswahl im Carpe Diem Bad Saarow. Mediterrane Weine, Aperitifs und erfrischende Säfte.',
};

const drinkCategories = [
  {
    name: 'Aperitifs',
    items: [
      { name: 'Ouzo on Ice', price: '4.50', desc: '4cl original griechischer Ouzo' },
      { name: 'Aperol Spritz', price: '8.50', desc: 'Aperol, Prosecco, Soda, Orange' },
      { name: 'Hugo', price: '8.50', desc: 'Holunderblütensirup, Prosecco, Minze, Limette' },
    ]
  },
  {
    name: 'Weine (Offen)',
    items: [
      { name: 'Hauswein Weiß', price: '6.50', desc: 'Trocken, fruchtig (0.2l)' },
      { name: 'Hauswein Rot', price: '6.80', desc: 'Kräftig, samtig (0.2l)' },
      { name: 'Retsina', price: '5.90', desc: 'Griechischer Harzwein (0.2l)' },
    ]
  }
];

export default function DrinksPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-5xl mx-auto space-y-24">
          <div className="text-center space-y-6">
            <h1 className="font-serif text-6xl md:text-8xl font-bold text-white tracking-tight">Getränke</h1>
            <p className="text-accent-200 text-xl max-w-2xl mx-auto font-light">
              Erlesene Weine aus dem Mittelmeerraum und regionale Erfrischungen.
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

          {drinkCategories.map((category) => (
            <div key={category.name} className="space-y-12">
              <div className="text-center space-y-3">
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">{category.name}</h2>
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent mx-auto mt-6" />
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                {category.items.map((item) => (
                  <div 
                    key={item.name} 
                    className="group p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 flex flex-col justify-center gap-4"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-bold text-white text-xl tracking-wide group-hover:text-primary-400 transition-colors">
                        {item.name}
                      </h3>
                      <span className="font-bold text-primary-400 text-lg">{item.price} €</span>
                    </div>
                    <p className="text-sm text-accent-300 leading-relaxed font-light">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
