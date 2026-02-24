'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from 'react';

type ContactItem = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: string;
};

type ReservationItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  note: string | null;
  createdAt: string;
  status: string;
};

export function InboxManager() {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [reservations, setReservations] = useState<ReservationItem[]>([]);

  async function loadData() {
    const response = await fetch('/api/admin/inbox', { cache: 'no-store' });
    const data = (await response.json()) as {
      contacts: ContactItem[];
      reservations: ReservationItem[];
    };

    setContacts(data.contacts || []);
    setReservations(data.reservations || []);
  }

  useEffect(() => {
    void loadData();
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="mb-4 font-serif text-3xl text-white">Kontaktanfragen</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-[0.14em] text-accent-300">
                <th className="px-3 py-2">Zeit</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">E-Mail</th>
                <th className="px-3 py-2">Betreff</th>
                <th className="px-3 py-2">Nachricht</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((item) => (
                <tr key={item.id} className="border-b border-white/5 text-white/80 align-top">
                  <td className="px-3 py-2">{new Date(item.createdAt).toLocaleString('de-DE')}</td>
                  <td className="px-3 py-2">{item.name}</td>
                  <td className="px-3 py-2">{item.email}</td>
                  <td className="px-3 py-2">{item.subject}</td>
                  <td className="px-3 py-2 whitespace-pre-wrap">{item.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="mb-4 font-serif text-3xl text-white">Reservierungen</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-[0.14em] text-accent-300">
                <th className="px-3 py-2">Zeit</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Kontakt</th>
                <th className="px-3 py-2">Termin</th>
                <th className="px-3 py-2">Gaeste</th>
                <th className="px-3 py-2">Notiz</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((item) => (
                <tr key={item.id} className="border-b border-white/5 text-white/80 align-top">
                  <td className="px-3 py-2">{new Date(item.createdAt).toLocaleString('de-DE')}</td>
                  <td className="px-3 py-2">{item.name}</td>
                  <td className="px-3 py-2">
                    <div>{item.email}</div>
                    <div className="text-xs text-accent-300">{item.phone}</div>
                  </td>
                  <td className="px-3 py-2">
                    {item.date} {item.time}
                  </td>
                  <td className="px-3 py-2">{item.guests}</td>
                  <td className="px-3 py-2 whitespace-pre-wrap">{item.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
