import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin/auth';
import { LoginForm } from '@/components/admin/LoginForm';

export default async function AdminLoginPage() {
  const session = await getAdminSession();

  if (session) {
    redirect('/admin');
  }

  return (
    <div className="pt-36 pb-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-lg rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
          <div className="mb-8 space-y-3 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary-400">Carpe Diem CMS</p>
            <h1 className="font-serif text-5xl font-bold text-white">Admin Login</h1>
            <p className="text-sm text-accent-300">
              Verwalten Sie Inhalte, Medien, SEO, Social Accounts und AI Agenten zentral.
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
