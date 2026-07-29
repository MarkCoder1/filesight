'use client';

import { LogoIcon } from '@/components/brand/Logo';
import { Copy, History, Home, LayoutDashboard, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/duplicates', label: 'Duplicates', icon: Copy },
  { href: '/history', label: 'History', icon: History },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 flex-col border-r bg-sidebar">
      <div className="flex h-14 items-center gap-2.5 border-b px-5">
        <LogoIcon size={28} className="text-primary" />
        <span className="text-sm font-semibold">{APP_NAME}</span>
      </div>

      <nav className="flex-1 space-y-1 p-3" role="navigation" aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <div className="rounded-lg bg-sidebar-accent/50 px-3 py-2">
          <p className="text-xs font-medium text-sidebar-foreground">v1.0.0</p>
          <p className="text-xs text-sidebar-foreground/60">Privacy-first</p>
        </div>
      </div>
    </aside>
  );
}
