import React from 'react';
import { requireAdminSession } from '@/lib/admin/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { LogoutButton } from '@/components/admin/LogoutButton';

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession();

  return (
    <div className="pt-32 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-400">Pivado Admin</p>
              <p className="mt-2 text-sm font-semibold text-white">{session.name}</p>
              <p className="text-xs text-accent-300">{session.email}</p>
              <div className="mt-4">
                <LogoutButton />
              </div>
            </div>
            <AdminSidebar />
          </aside>
          <div className="space-y-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
