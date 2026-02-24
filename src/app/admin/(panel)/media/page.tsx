import { AdminCard } from '@/components/admin/AdminCard';
import { MediaManager } from '@/components/admin/MediaManager';

export default function AdminMediaPage() {
  return (
    <AdminCard
      title="Medienbibliothek"
      subtitle="Blob-gestuetzte Medienverwaltung mit sicherer Speicherbereinigung bei Loeschvorgaengen"
    >
      <MediaManager />
    </AdminCard>
  );
}
