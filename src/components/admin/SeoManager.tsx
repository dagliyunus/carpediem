'use client';

export function SeoManager() {
  function runPageSpeed(formFactor: 'mobile' | 'desktop') {
    const targetUrl = 'https://www.carpediem-badsaarow.de';
    const reportUrl = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(targetUrl)}&form_factor=${formFactor}`;

    window.open(reportUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
        <p className="text-xs uppercase tracking-[0.16em] text-accent-300">PageSpeed Test</p>
        <p className="mt-1 text-xs text-accent-400">
          Oeffnet den offiziellen Test auf pagespeed.web.dev fuer die Canonical-URL oder die Website-Startseite.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => runPageSpeed('mobile')}
            className="rounded-full border border-primary-500/40 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-primary-200"
          >
            Mobile Test starten
          </button>
          <button
            type="button"
            onClick={() => runPageSpeed('desktop')}
            className="rounded-full border border-primary-500/40 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-primary-200"
          >
            Desktop Test starten
          </button>
        </div>
      </div>
    </div>
  );
}
