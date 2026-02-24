import { AdminCard } from '@/components/admin/AdminCard';
import { ContentManager } from '@/components/admin/ContentManager';

export default function AdminContentPage() {
  return (
    <AdminCard
      title="Seiteninhalte"
      subtitle="Dynamische Seitenverwaltung fuer Startseite, Kontakt, Reservierung, Galerie und weitere Inhalte"
    >
      <ContentManager />
    </AdminCard>
  );
}
