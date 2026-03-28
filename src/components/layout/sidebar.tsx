'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FlaskConical,
  Users,
  Store,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/etudes', label: 'Mes études', icon: FlaskConical },
  { href: '/communaute', label: 'Communauté', icon: Store },
  { href: '/equipe', label: 'Équipe', icon: Users },
  { href: '/parametres', label: 'Paramètres', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-card transition-all duration-200 h-screen sticky top-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-base shadow-sm">
              A
            </div>
            <span className="text-xl font-bold tracking-tight">Apertum</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="mx-auto">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-base shadow-sm">
              A
            </div>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span className="ml-2">Réduire</span>}
        </button>
      </div>
    </aside>
  );
}
