import { AdminCard } from '@/components/admin/AdminCard';
import { ContentManager } from '@/components/admin/ContentManager';

export default function AdminContentPage() {
  return (
    <AdminCard
      title="Seiteninhalte"
      subtitle="Inhalte und Medien fuer Startseite, Galerie und Magazin"
    >
      <ContentManager />
    </AdminCard>
  );
}
