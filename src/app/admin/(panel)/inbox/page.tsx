import { AdminCard } from '@/components/admin/AdminCard';
import { InboxManager } from '@/components/admin/InboxManager';

export default function AdminInboxPage() {
  return (
    <AdminCard
      title="Nachrichten"
      subtitle="Kontaktanfragen und Reservierungen aus den Website-Formularen"
    >
      <InboxManager />
    </AdminCard>
  );
}
