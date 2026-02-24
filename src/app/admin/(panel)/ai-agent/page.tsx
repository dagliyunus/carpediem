import { AdminCard } from '@/components/admin/AdminCard';
import { AiAgentManager } from '@/components/admin/AiAgentManager';

export default function AdminAiAgentPage() {
  return (
    <AdminCard
      title="AI Agent Integration"
      subtitle="Zeitfenster und Prompt-Templates fuer taegliche Inhalte auf Magazin, Instagram, Pinterest und TikTok"
    >
      <AiAgentManager />
    </AdminCard>
  );
}
