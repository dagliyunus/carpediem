import { AdminCard } from '@/components/admin/AdminCard';
import { SeoManager } from '@/components/admin/SeoManager';

export default function AdminSeoPage() {
  return (
    <AdminCard
      title="SEO Management"
      subtitle="Meta-Daten, Canonicals, Robots, OpenGraph und strukturierte Daten zentral verwalten"
    >
      <SeoManager />
    </AdminCard>
  );
}
