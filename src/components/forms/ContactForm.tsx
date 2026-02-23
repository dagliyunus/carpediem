'use client';

import React, { useMemo, useState } from 'react';

type ContactFormStatus = 'idle' | 'sending' | 'success' | 'error';

type ContactFormProps = {
  className?: string;
};

export const ContactForm = ({ className }: ContactFormProps) => {
  const [formStartedAt] = useState<number>(() => Date.now());
  const [status, setStatus] = useState<ContactFormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    company: '',
  });

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (status !== 'idle') setStatus('idle');
    if (errorMessage) setErrorMessage('');
  };

  const isSending = status === 'sending';

  const canSubmit = useMemo(() => {
    const name = form.name.trim();
    const email = form.email.trim();
    const subject = form.subject.trim();
    const message = form.message.trim();
    if (!name || !email || !subject || !message) return false;
    if (name.length > 80) return false;
    if (email.length > 254) return false;
    if (subject.length > 120) return false;
    if (message.length < 10 || message.length > 2000) return false;
    return true;
  }, [form.email, form.message, form.name, form.subject]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSending) return;

    setErrorMessage('');
    setStatus('sending');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
          company: form.company,
          formStartedAt,
        }),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { error?: string } | null;
        const message = payload?.error || 'Senden fehlgeschlagen. Bitte versuchen Sie es erneut.';
        setErrorMessage(message);
        setStatus('error');
        return;
      }

      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '', company: '' });
    } catch {
      setErrorMessage('Senden fehlgeschlagen. Bitte versuchen Sie es erneut.');
      setStatus('error');
    }
  };

  return (
    <form onSubmit={onSubmit} className={className}>
      <div className="grid gap-5">
        <input
          value={form.company}
          onChange={(e) => updateField('company', e.target.value)}
          name="company"
          autoComplete="off"
          tabIndex={-1}
          className="hidden"
        />

        <div className="grid gap-5 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-white/70" htmlFor="contact-name">
              Name
            </label>
            <input
              id="contact-name"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
              maxLength={80}
              className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-white placeholder:text-white/30 outline-none ring-0 focus:border-white/20 focus:bg-white/[0.05] transition-colors"
              placeholder="Ihr Name"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-white/70" htmlFor="contact-email">
              E-Mail
            </label>
            <input
              id="contact-email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              required
              type="email"
              maxLength={254}
              className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-white placeholder:text-white/30 outline-none ring-0 focus:border-white/20 focus:bg-white/[0.05] transition-colors"
              placeholder="name@example.com"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-bold uppercase tracking-[0.2em] text-white/70" htmlFor="contact-subject">
            Betreff
          </label>
          <input
            id="contact-subject"
            value={form.subject}
            onChange={(e) => updateField('subject', e.target.value)}
            required
            maxLength={120}
            className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-white placeholder:text-white/30 outline-none ring-0 focus:border-white/20 focus:bg-white/[0.05] transition-colors"
            placeholder="Worum geht es?"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-bold uppercase tracking-[0.2em] text-white/70" htmlFor="contact-message">
            Nachricht
          </label>
          <textarea
            id="contact-message"
            value={form.message}
            onChange={(e) => updateField('message', e.target.value)}
            required
            minLength={10}
            maxLength={2000}
            rows={6}
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder:text-white/30 outline-none ring-0 focus:border-white/20 focus:bg-white/[0.05] transition-colors resize-none"
            placeholder="Ihre Nachricht…"
          />
          <div className="flex justify-between text-[11px] text-white/40">
            <span />
            <span>{form.message.length}/2000</span>
          </div>
        </div>

        {status === 'success' && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-2xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100"
          >
            Danke! Ihre Nachricht wurde erfolgreich gesendet. Wir melden uns zeitnah.
          </div>
        )}

        {status === 'error' && (
          <div
            role="alert"
            aria-live="assertive"
            className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit || isSending}
          className="inline-flex h-12 items-center justify-center rounded-full bg-primary-600 px-10 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-2xl ring-1 ring-white/10 transition-all hover:bg-primary-700 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isSending ? 'Senden…' : 'Nachricht senden'}
        </button>
      </div>
    </form>
  );
};
