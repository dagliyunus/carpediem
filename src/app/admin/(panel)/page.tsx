import { db } from '@/lib/db';
import { AdminCard } from '@/components/admin/AdminCard';
import { InboxManager } from '@/components/admin/InboxManager';

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-5">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-300">{label}</p>
      <p className="mt-2 font-serif text-4xl text-primary-300">{value}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [articles, pages, media, contacts, reservations, seo, social, aiAgents] =
    await Promise.all([
      db.article.count(),
      db.page.count(),
      db.mediaAsset.count(),
      db.contactMessage.count(),
      db.reservationRequest.count(),
      db.seoMeta.count(),
      db.socialAccount.count(),
      db.aiAgentConfig.count(),
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

      <AdminCard title="Nachrichten" subtitle="Kontaktanfragen und Reservierungen direkt im Dashboard">
        <InboxManager />
      </AdminCard>
    </>
  );
}
