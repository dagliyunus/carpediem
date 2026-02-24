'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import { AiChannel } from '@prisma/client';
import { useEffect, useMemo, useState } from 'react';

type AgentItem = {
  id: string;
  channel: AiChannel;
  isEnabled: boolean;
  promptTemplate: string;
  contentTone: string | null;
  timezone: string;
  runWindowStart: string;
  runWindowEnd: string;
  frequencyMins: number;
  targetLanguage: string;
  nextRunAt: string | null;
  lastRunAt: string | null;
};

type FormState = {
  channel: AiChannel;
  isEnabled: boolean;
  promptTemplate: string;
  contentTone: string;
  timezone: string;
  runWindowStart: string;
  runWindowEnd: string;
  frequencyMins: number;
  targetLanguage: string;
  nextRunAt: string;
};

const emptyForm: FormState = {
  channel: AiChannel.MAGAZIN,
  isEnabled: false,
  promptTemplate: '',
  contentTone: '',
  timezone: 'Europe/Berlin',
  runWindowStart: '08:00',
  runWindowEnd: '10:00',
  frequencyMins: 1440,
  targetLanguage: 'de',
  nextRunAt: '',
};

function toDatetimeLocal(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

function fromDatetimeLocal(value: string) {
  if (!value) return null;
  return new Date(value).toISOString();
}

export function AiAgentManager() {
  const [items, setItems] = useState<AgentItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [message, setMessage] = useState<string | null>(null);

  async function loadData() {
    const response = await fetch('/api/admin/ai-agents', { cache: 'no-store' });
    const data = (await response.json()) as { items: AgentItem[] };
    setItems(data.items || []);
  }

  useEffect(() => {
    void loadData();
  }, []);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) || null,
    [items, selectedId]
  );

  useEffect(() => {
    if (!selectedItem) {
      setForm(emptyForm);
      return;
    }

    setForm({
      channel: selectedItem.channel,
      isEnabled: selectedItem.isEnabled,
      promptTemplate: selectedItem.promptTemplate,
      contentTone: selectedItem.contentTone || '',
      timezone: selectedItem.timezone,
      runWindowStart: selectedItem.runWindowStart,
      runWindowEnd: selectedItem.runWindowEnd,
      frequencyMins: selectedItem.frequencyMins,
      targetLanguage: selectedItem.targetLanguage,
      nextRunAt: toDatetimeLocal(selectedItem.nextRunAt),
    });
  }, [selectedItem]);

  async function save() {
    setMessage(null);

    const body = {
      channel: form.channel,
      isEnabled: form.isEnabled,
      promptTemplate: form.promptTemplate,
      contentTone: form.contentTone,
      timezone: form.timezone,
      runWindowStart: form.runWindowStart,
      runWindowEnd: form.runWindowEnd,
      frequencyMins: form.frequencyMins,
      targetLanguage: form.targetLanguage,
      nextRunAt: fromDatetimeLocal(form.nextRunAt),
    };

    const response = await fetch(selectedId ? `/api/admin/ai-agents/${selectedId}` : '/api/admin/ai-agents', {
      method: selectedId ? 'PATCH' : 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setMessage(result?.error || 'Speichern fehlgeschlagen.');
      return;
    }

    setMessage('AI Agent gespeichert.');
    await loadData();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-white">AI Agenten</h3>
          <button
            type="button"
            onClick={() => {
              setSelectedId(null);
              setForm(emptyForm);
            }}
            className="rounded-full border border-primary-500/40 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary-300"
          >
            Neu
          </button>
        </div>
        <div className="space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={`w-full rounded-2xl border px-3 py-2 text-left ${
                selectedId === item.id
                  ? 'border-primary-400/50 bg-primary-500/15'
                  : 'border-white/10 bg-black/20 hover:border-white/20'
              }`}
            >
              <p className="text-sm font-semibold text-white">{item.channel}</p>
              <p className="text-xs uppercase tracking-[0.14em] text-accent-300">
                {item.isEnabled ? 'aktiv' : 'pausiert'} · {item.runWindowStart}-{item.runWindowEnd}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 block">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Kanal</span>
            <select
              value={form.channel}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, channel: event.target.value as AiChannel }))
              }
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            >
              {Object.values(AiChannel).map((channel) => (
                <option key={channel} value={channel}>
                  {channel}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={form.isEnabled}
              onChange={(event) => setForm((prev) => ({ ...prev, isEnabled: event.target.checked }))}
            />
            Agent aktivieren
          </label>
        </div>

        <label className="space-y-1 block">
          <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Prompt Vorlage</span>
          <textarea
            value={form.promptTemplate}
            onChange={(event) => setForm((prev) => ({ ...prev, promptTemplate: event.target.value }))}
            className="h-40 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 block">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Tonfall</span>
            <input
              value={form.contentTone}
              onChange={(event) => setForm((prev) => ({ ...prev, contentTone: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              placeholder="premium, lokal, herzlich"
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

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="space-y-1 block">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Von</span>
            <input
              type="time"
              value={form.runWindowStart}
              onChange={(event) => setForm((prev) => ({ ...prev, runWindowStart: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Bis</span>
            <input
              type="time"
              value={form.runWindowEnd}
              onChange={(event) => setForm((prev) => ({ ...prev, runWindowEnd: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Intervall (Min.)</span>
            <input
              type="number"
              value={form.frequencyMins}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, frequencyMins: Number(event.target.value) || 1440 }))
              }
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 block">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Sprache</span>
            <input
              value={form.targetLanguage}
              onChange={(event) => setForm((prev) => ({ ...prev, targetLanguage: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Naechster Lauf</span>
            <input
              type="datetime-local"
              value={form.nextRunAt}
              onChange={(event) => setForm((prev) => ({ ...prev, nextRunAt: event.target.value }))}
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
          className="rounded-full bg-primary-600 px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white"
        >
          AI Agent speichern
        </button>
      </div>
    </div>
  );
}
