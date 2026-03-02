import { AdminCard } from '@/components/admin/AdminCard';
import { SeoManager } from '@/components/admin/SeoManager';

export default function AdminSeoPage() {
  return (
    <AdminCard
      title="Google Speed Test"
      subtitle="PageSpeed-Test direkt über die offizielle Google-Seite starten"
    >
      <SeoManager />
    </AdminCard>
  );
}
