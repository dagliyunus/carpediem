import { AdminCard } from '@/components/admin/AdminCard';
import { MagazinManager } from '@/components/admin/MagazinManager';

export default function AdminMagazinPage() {
  return (
    <AdminCard
      title="Magazin-Beitraege"
      subtitle="Vollstaendige Verwaltung aller Magazin-Inhalte (statt /blog unter /magazin)"
    >
      <MagazinManager />
    </AdminCard>
  );
}
