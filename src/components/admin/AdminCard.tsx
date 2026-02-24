import React from 'react';

export function AdminCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.25)] backdrop-blur">
      <header className="mb-5 space-y-1">
        <h2 className="font-serif text-3xl text-white">{title}</h2>
        {subtitle ? <p className="text-sm text-accent-300">{subtitle}</p> : null}
      </header>
      {children}
    </section>
  );
}
