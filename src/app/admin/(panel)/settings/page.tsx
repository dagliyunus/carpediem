import { AdminCard } from '@/components/admin/AdminCard';
import { SettingsManager } from '@/components/admin/SettingsManager';

export default function AdminSettingsPage() {
  return (
    <AdminCard
      title="Systemeinstellungen"
      subtitle="Globale Marken- und Tracking-Konfiguration fuer SEO/Analytics und externe Integrationen"
    >
      <SettingsManager />
    </AdminCard>
  );
}
