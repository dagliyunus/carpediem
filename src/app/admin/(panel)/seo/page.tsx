import { AdminCard } from '@/components/admin/AdminCard';
import { SeoManager } from '@/components/admin/SeoManager';

export default function AdminSeoPage() {
  return (
    <AdminCard
      title="SEO Management"
      subtitle="PageSpeed-Test direkt ueber die offizielle Google-Seite starten"
    >
      <SeoManager />
    </AdminCard>
  );
}
