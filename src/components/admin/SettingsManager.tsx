'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from 'react';

type Settings = {
  siteName: string;
  siteUrl: string;
  brandTagline: string | null;
  defaultLocale: string;
  businessEmail: string | null;
  businessPhone: string | null;
  address: string | null;
  timezone: string;
  defaultSeoTitle: string | null;
  defaultSeoDescription: string | null;
  trackingGa4Id: string | null;
  trackingGtmId: string | null;
  trackingMetaPixelId: string | null;
  trackingGoogleAdsId: string | null;
};

type FormState = {
  siteName: string;
  siteUrl: string;
  brandTagline: string;
  defaultLocale: string;
  businessEmail: string;
  businessPhone: string;
  address: string;
  timezone: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  trackingGa4Id: string;
  trackingGtmId: string;
  trackingMetaPixelId: string;
  trackingGoogleAdsId: string;
};

const emptyForm: FormState = {
  siteName: '',
  siteUrl: '',
  brandTagline: '',
  defaultLocale: 'de-DE',
  businessEmail: '',
  businessPhone: '',
  address: '',
  timezone: 'Europe/Berlin',
  defaultSeoTitle: '',
  defaultSeoDescription: '',
  trackingGa4Id: '',
  trackingGtmId: '',
  trackingMetaPixelId: '',
  trackingGoogleAdsId: '',
};

export function SettingsManager() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    const response = await fetch('/api/admin/site-settings', { cache: 'no-store' });
    const data = (await response.json()) as { item: Settings };

    setForm({
      siteName: data.item.siteName,
      siteUrl: data.item.siteUrl,
      brandTagline: data.item.brandTagline || '',
      defaultLocale: data.item.defaultLocale,
      businessEmail: data.item.businessEmail || '',
      businessPhone: data.item.businessPhone || '',
      address: data.item.address || '',
      timezone: data.item.timezone,
      defaultSeoTitle: data.item.defaultSeoTitle || '',
      defaultSeoDescription: data.item.defaultSeoDescription || '',
      trackingGa4Id: data.item.trackingGa4Id || '',
      trackingGtmId: data.item.trackingGtmId || '',
      trackingMetaPixelId: data.item.trackingMetaPixelId || '',
      trackingGoogleAdsId: data.item.trackingGoogleAdsId || '',
    });
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function save() {
    setSaving(true);
    setMessage(null);

    const response = await fetch('/api/admin/site-settings', {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    const result = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setMessage(result?.error || 'Speichern fehlgeschlagen.');
      setSaving(false);
      return;
    }

    setMessage('Systemeinstellungen gespeichert.');
    setSaving(false);
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 block">
          <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Site Name</span>
          <input
            value={form.siteName}
            onChange={(event) => setForm((prev) => ({ ...prev, siteName: event.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="space-y-1 block">
          <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Site URL</span>
          <input
            value={form.siteUrl}
            onChange={(event) => setForm((prev) => ({ ...prev, siteUrl: event.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
        </label>
      </div>

      <label className="space-y-1 block">
        <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Marken-Tagline</span>
        <input
          value={form.brandTagline}
          onChange={(event) => setForm((prev) => ({ ...prev, brandTagline: event.target.value }))}
          className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="space-y-1 block">
          <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Locale</span>
          <input
            value={form.defaultLocale}
            onChange={(event) => setForm((prev) => ({ ...prev, defaultLocale: event.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="space-y-1 block">
          <span className="text-xs uppercase tracking-[0.16em] text-accent-300">E-Mail</span>
          <input
            value={form.businessEmail}
            onChange={(event) => setForm((prev) => ({ ...prev, businessEmail: event.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="space-y-1 block">
          <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Telefon</span>
          <input
            value={form.businessPhone}
            onChange={(event) => setForm((prev) => ({ ...prev, businessPhone: event.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
        </label>
      </div>

      <label className="space-y-1 block">
        <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Adresse</span>
        <input
          value={form.address}
          onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
          className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 block">
          <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Default SEO Titel</span>
          <input
            value={form.defaultSeoTitle}
            onChange={(event) => setForm((prev) => ({ ...prev, defaultSeoTitle: event.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="space-y-1 block">
          <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Zeitzone</span>
          <input
            value={form.timezone}
            onChange={(event) => setForm((prev) => ({ ...prev, timezone: event.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
        </label>
      </div>

      <label className="space-y-1 block">
        <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Default SEO Beschreibung</span>
        <textarea
          value={form.defaultSeoDescription}
          onChange={(event) => setForm((prev) => ({ ...prev, defaultSeoDescription: event.target.value }))}
          className="h-24 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 block">
          <span className="text-xs uppercase tracking-[0.16em] text-accent-300">GA4 ID</span>
          <input
            value={form.trackingGa4Id}
            onChange={(event) => setForm((prev) => ({ ...prev, trackingGa4Id: event.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="space-y-1 block">
          <span className="text-xs uppercase tracking-[0.16em] text-accent-300">GTM ID</span>
          <input
            value={form.trackingGtmId}
            onChange={(event) => setForm((prev) => ({ ...prev, trackingGtmId: event.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 block">
          <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Meta Pixel ID</span>
          <input
            value={form.trackingMetaPixelId}
            onChange={(event) => setForm((prev) => ({ ...prev, trackingMetaPixelId: event.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="space-y-1 block">
          <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Google Ads ID</span>
          <input
            value={form.trackingGoogleAdsId}
            onChange={(event) => setForm((prev) => ({ ...prev, trackingGoogleAdsId: event.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
        </label>
      </div>

      {message ? (
        <p className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-accent-100">{message}</p>
      ) : null}

      <button
        type="button"
        onClick={() => void save()}
        disabled={saving}
        className="rounded-full bg-primary-600 px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white"
      >
        {saving ? 'Speichere ...' : 'Einstellungen speichern'}
      </button>
    </div>
  );
}
