import { AdminCard } from '@/components/admin/AdminCard';
import { SocialManager } from '@/components/admin/SocialManager';

export default function AdminSocialPage() {
  return (
    <AdminCard
      title="Social Media Accounts"
      subtitle="Instagram, Pinterest, TikTok und weitere Kanaele dynamisch im CMS steuern"
    >
      <SocialManager />
    </AdminCard>
  );
}
