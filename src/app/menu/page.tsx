import React from 'react';
import { Metadata } from 'next';
import { menuCategories, menuItems } from '@/data/menu';
import { siteConfig } from '@/config/siteConfig';

export const metadata: Metadata = {
  title: 'Speisekarte',
  description: 'Entdecken Sie unsere mediterrane Speisekarte im Carpe Diem Bad Saarow. Von gegrilltem Oktopus bis hin zu hausgemachtem Baklava.',
};

export default function MenuPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-5xl mx-auto space-y-24">
          <div className="text-center space-y-6">
            <h1 className="font-serif text-6xl md:text-8xl font-bold text-white tracking-tight">Speisekarte</h1>
            <p className="text-accent-200 text-xl max-w-2xl mx-auto font-light">
              Unsere Küche vereint traditionelle mediterrane Rezepte mit modernen Akzenten. 
              Wir verwenden ausschließlich frische, saisonale Zutaten.
            </p>
            <div className="pt-8">
              <a 
                href={siteConfig.menu.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-sm font-bold text-primary-400 hover:text-primary-300 transition-colors uppercase tracking-widest group"
              >
                <span>Speisekarte als PDF laden</span>
                <span className="text-lg transition-transform group-hover:translate-y-1">↓</span>
              </a>
            </div>
          </div>

          {menuCategories.map((category) => (
            <div key={category.id} className="space-y-12">
              <div className="text-center space-y-3">
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">{category.name}</h2>
                {category.description && (
                  <p className="text-primary-400/80 font-light tracking-wide">{category.description}</p>
                )}
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent mx-auto mt-6" />
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                {menuItems
                  .filter((item) => item.category === category.id)
                  .map((item) => (
                    <div 
                      key={item.id} 
                      className="group p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 flex flex-col justify-between gap-6"
                    >
                      <div className="space-y-3">
                        <div className="flex items-baseline justify-between gap-4">
                          <h3 className="font-bold text-white text-xl tracking-wide group-hover:text-primary-400 transition-colors">
                            {item.name}
                          </h3>
                          <span className="font-bold text-primary-400 text-lg">{item.price.toFixed(2)} €</span>
                        </div>
                        <p className="text-sm text-accent-300 leading-relaxed font-light">
                          {item.description}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {item.allergens.map((allergen) => (
                          <span 
                            key={allergen} 
                            className="text-[10px] font-bold text-accent-500 border border-white/10 px-2 py-0.5 rounded-full uppercase tracking-tighter"
                          >
                            {allergen}
                          </span>
                        ))}
                        {item.isPopular && (
                          <span className="text-[10px] font-bold text-primary-400 bg-primary-400/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                            Beliebt
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}

          <div className="bg-white/[0.02] p-10 rounded-[2.5rem] border border-white/5 space-y-4 text-center">
            <h4 className="font-bold text-primary-400 uppercase tracking-[0.3em] text-xs">Hinweis für Allergiker</h4>
            <p className="text-xs text-accent-400 leading-relaxed max-w-2xl mx-auto font-light">
              Eine vollständige Liste der Allergene und Zusatzstoffe erhalten Sie auf Anfrage von unserem Servicepersonal. 
              Trotz größter Sorgfalt können Kreuzkontaminationen nicht vollständig ausgeschlossen werden.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
