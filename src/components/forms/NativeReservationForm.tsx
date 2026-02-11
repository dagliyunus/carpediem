'use client';

import React, { useState } from 'react';
import { Check, Calendar, Users, Clock, Info } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';

type Step = 1 | 2 | 3;

export const NativeReservationForm = () => {
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    guests: '2',
    name: '',
    email: '',
    phone: '',
    note: '',
    consent: false,
  });

  const timeSlots = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'];

  const handleNext = () => setStep((s) => (s + 1) as Step);
  const handleBack = () => setStep((s) => (s - 1) as Step);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate server action
    console.log('Submitting reservation:', formData);
    setStep(3);
  };

  if (step === 3) {
    return (
      <div className="text-center space-y-8 py-16 animate-in fade-in zoom-in duration-700 bg-white/[0.03] backdrop-blur-3xl rounded-[3rem] border border-white/10 p-12 shadow-2xl">
        <div className="w-24 h-24 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto ring-1 ring-primary-500/20">
          <Check className="w-12 h-12 text-primary-400" />
        </div>
        <div className="space-y-4">
          <h2 className="font-serif text-4xl font-bold text-white tracking-tight">Vielen Dank für Ihre Reservierung!</h2>
          <p className="text-accent-200 text-lg font-light leading-relaxed max-w-md mx-auto">
            Wir haben Ihre Anfrage erhalten und senden Ihnen in Kürze eine Bestätigung per E-Mail.
          </p>
        </div>
        <div className="pt-8">
          <button 
            onClick={() => window.location.href = '/'}
            className="group inline-flex items-center gap-2 text-primary-400 font-bold uppercase tracking-widest text-sm hover:text-primary-300 transition-colors"
          >
            <span>Zurück zur Startseite</span>
            <span className="text-xl transition-transform group-hover:-translate-x-1">←</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white/[0.03] backdrop-blur-3xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/10">
      {/* Progress Bar */}
      <div className="h-1 w-full bg-white/5">
        <div 
          className="h-full bg-primary-500 transition-all duration-700 ease-out" 
          style={{ width: step === 1 ? '50%' : '100%' }}
        />
      </div>

      <form onSubmit={handleSubmit} className="p-8 md:p-16 space-y-12">
        {step === 1 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="space-y-4">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">Wann möchten Sie uns besuchen?</h2>
              <p className="text-accent-300 font-light">Wählen Sie Datum, Uhrzeit und Personenanzahl.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-400 flex items-center gap-2 ml-1">
                  <Calendar className="w-3.5 h-3.5" /> Datum
                </label>
                <div className="relative group">
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-6 py-4 rounded-2xl border border-white/5 bg-white/[0.02] text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all outline-none group-hover:bg-white/[0.04] [color-scheme:dark]"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-400 flex items-center gap-2 ml-1">
                  <Users className="w-3.5 h-3.5" /> Personen
                </label>
                <div className="relative group">
                  <select
                    className="w-full px-6 py-4 rounded-2xl border border-white/5 bg-white/[0.02] text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all outline-none group-hover:bg-white/[0.04] appearance-none cursor-pointer"
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n} className="bg-[#1A1A1A]">{n} Personen</option>
                    ))}
                    <option value="9+" className="bg-[#1A1A1A]">Mehr als 8 Personen</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 group-hover:text-white/40 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-400 flex items-center gap-2 ml-1">
                <Clock className="w-3.5 h-3.5" /> Verfügbare Uhrzeiten
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setFormData({ ...formData, time })}
                    className={`py-4 text-sm font-bold rounded-2xl border transition-all duration-300 ${
                      formData.time === time 
                        ? 'bg-primary-600 border-primary-500 text-white shadow-[0_10px_30px_rgba(201,133,58,0.3)] scale-105' 
                        : 'border-white/5 bg-white/[0.02] text-accent-200 hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                disabled={!formData.date || !formData.time}
                onClick={handleNext}
                className="group relative w-full h-18 bg-primary-600 text-white rounded-full font-bold text-lg shadow-2xl shadow-primary-900/20 hover:bg-primary-500 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed transition-all duration-500 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span>Weiter</span>
                  <span className="text-xl transition-transform group-hover:translate-x-1">→</span>
                </span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="space-y-4">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">Ihre Kontaktdaten</h2>
              <p className="text-accent-300 font-light">Fast geschafft! Bitte vervollständigen Sie Ihre Reservierung.</p>
            </div>

            <div className="space-y-6">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Vollständiger Name"
                  required
                  className="w-full px-6 py-4 rounded-2xl border border-white/5 bg-white/[0.02] text-white focus:ring-2 focus:ring-primary-500/50 outline-none group-hover:bg-white/[0.04] transition-all placeholder:text-white/20"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="relative group">
                  <input
                    type="email"
                    placeholder="E-Mail Adresse"
                    required
                    className="w-full px-6 py-4 rounded-2xl border border-white/5 bg-white/[0.02] text-white focus:ring-2 focus:ring-primary-500/50 outline-none group-hover:bg-white/[0.04] transition-all placeholder:text-white/20"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="relative group">
                  <input
                    type="tel"
                    placeholder="Telefonnummer"
                    required
                    className="w-full px-6 py-4 rounded-2xl border border-white/5 bg-white/[0.02] text-white focus:ring-2 focus:ring-primary-500/50 outline-none group-hover:bg-white/[0.04] transition-all placeholder:text-white/20"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="relative group">
                <textarea
                  placeholder="Besondere Wünsche oder Anmerkungen (optional)"
                  className="w-full px-6 py-4 rounded-2xl border border-white/5 bg-white/[0.02] text-white focus:ring-2 focus:ring-primary-500/50 outline-none min-h-[120px] group-hover:bg-white/[0.04] transition-all placeholder:text-white/20 resize-none"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-start gap-4 px-2">
              <div className="relative flex items-center h-6">
                <input
                  type="checkbox"
                  id="consent"
                  required
                  className="w-5 h-5 rounded border-white/10 bg-white/5 text-primary-600 focus:ring-primary-500/50 cursor-pointer"
                  checked={formData.consent}
                  onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                />
              </div>
              <label htmlFor="consent" className="text-xs text-accent-400 leading-relaxed cursor-pointer select-none">
                Ich stimme zu, dass meine Daten zur Bearbeitung der Reservierung gespeichert werden. 
                Weitere Infos in der <a href="/datenschutz" target="_blank" className="text-primary-400 hover:text-primary-300 underline underline-offset-4">Datenschutzerklärung</a>.
              </label>
            </div>

            <div className="bg-primary-950/40 p-6 rounded-[2rem] border border-primary-500/10 flex gap-4 ring-1 ring-primary-500/5">
              <Info className="w-5 h-5 text-primary-400 shrink-0" />
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-primary-400 uppercase tracking-widest">Stornierungsbedingungen</p>
                <p className="text-[11px] text-accent-300 leading-relaxed font-light">
                  {siteConfig.reservations.policies.cancellation} {siteConfig.reservations.policies.noShow}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 h-16 border border-white/10 text-white rounded-full font-bold hover:bg-white/5 transition-all duration-300"
              >
                Zurück
              </button>
              <button
                type="submit"
                className="group relative flex-[2] h-16 bg-primary-600 text-white rounded-full font-bold text-lg shadow-2xl shadow-primary-900/20 hover:bg-primary-500 transition-all duration-500 overflow-hidden"
              >
                <span className="relative z-10">Reservierung absenden</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
