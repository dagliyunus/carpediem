'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/content', label: 'Seiteninhalte' },
  { href: '/admin/magazin', label: 'Magazin-Beitraege' },
  { href: '/admin/seo', label: 'SEO' },
  { href: '/admin/social', label: 'Social Accounts' },
  { href: '/admin/ai-agent', label: 'AI Agenten' },
  { href: '/admin/inbox', label: 'Nachrichten' },
  { href: '/admin/settings', label: 'Systemeinstellungen' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
      <ul className="space-y-2">
        {navItems.map((item) => {
          const active = pathname === item.href;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? 'bg-primary-500/20 text-primary-200 ring-1 ring-primary-500/50'
                    : 'text-white/80 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
