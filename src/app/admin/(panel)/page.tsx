import Link from 'next/link';
import { db } from '@/lib/db';
import { AdminCard } from '@/components/admin/AdminCard';

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-5">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-300">{label}</p>
      <p className="mt-2 font-serif text-4xl text-primary-300">{value}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [articles, pages, media, contacts, reservations, seo, social, aiAgents, recentLogs] =
    await Promise.all([
      db.article.count(),
      db.page.count(),
      db.mediaAsset.count(),
      db.contactMessage.count(),
      db.reservationRequest.count(),
      db.seoMeta.count(),
      db.socialAccount.count(),
      db.aiAgentConfig.count(),
      db.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 12,
      }),
    ]);

  return (
    <>
      <AdminCard
        title="Dashboard"
        subtitle="Zentrale Steuerung fuer Inhalte, Medien, SEO, Social und AI-Agenten"
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Magazin-Beitraege" value={articles} />
          <StatCard label="Seiten" value={pages} />
          <StatCard label="Medien" value={media} />
          <StatCard label="SEO-Eintraege" value={seo} />
          <StatCard label="Social Accounts" value={social} />
          <StatCard label="AI Agenten" value={aiAgents} />
          <StatCard label="Kontaktnachrichten" value={contacts} />
          <StatCard label="Reservierungen" value={reservations} />
        </div>
      </AdminCard>

      <AdminCard title="Schnellzugriff" subtitle="Haeufige Aufgaben mit einem Klick">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: '/admin/magazin', label: 'Neuen Magazin-Beitrag erstellen' },
            { href: '/admin/media', label: 'Bild oder Video hochladen' },
            { href: '/admin/seo', label: 'SEO-Metadaten bearbeiten' },
            { href: '/admin/ai-agent', label: 'AI Agent-Zeitfenster setzen' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-primary-500/30 bg-primary-500/10 px-4 py-4 text-sm font-semibold text-primary-200 transition hover:border-primary-400 hover:bg-primary-500/20"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </AdminCard>

      <AdminCard title="Aktivitaetsprotokoll" subtitle="Zuletzt ausgefuehrte Admin-Aktionen">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-[0.15em] text-accent-300">
                <th className="px-3 py-2">Zeit</th>
                <th className="px-3 py-2">Aktion</th>
                <th className="px-3 py-2">Entity</th>
                <th className="px-3 py-2">ID</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log) => (
                <tr key={log.id} className="border-b border-white/5 text-white/80">
                  <td className="px-3 py-2">{new Date(log.createdAt).toLocaleString('de-DE')}</td>
                  <td className="px-3 py-2">{log.action}</td>
                  <td className="px-3 py-2">{log.entityType}</td>
                  <td className="px-3 py-2 text-xs text-accent-300">{log.entityId || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </>
  );
}
