'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Video,
  Film,
  FileText,
  BarChart3,
  DollarSign,
  Wallet,
  Settings,
  ArrowLeft,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/logo';
import { useSidebarStore } from '@/lib/stores';

const navigation = [
  { name: 'Dashboard', href: '/studio', icon: LayoutDashboard },
  { name: 'Upload Video', href: '/studio/upload/video', icon: Video },
  { name: 'Upload Short', href: '/studio/upload/short', icon: Film },
  { name: 'Posts', href: '/studio/posts', icon: FileText },
  { name: 'Analytics', href: '/studio/analytics', icon: BarChart3 },
  { name: 'Earnings', href: '/studio/earnings', icon: DollarSign },
  { name: 'Payouts and Reports', href: '/studio/payouts', icon: Wallet },
  { name: 'Settings', href: '/studio/settings', icon: Settings },
];

export function StudioSidebar() {
  const pathname = usePathname();
  const { isExpanded, isMobileOpen, setMobileOpen } = useSidebarStore();

  const isActive = (href: string) => {
    if (href === '/studio') {
      return pathname === '/studio';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed top-14 left-0 bottom-0 z-40 bg-background border-r border-black flex flex-col transition-all duration-300',
          'hidden lg:flex',
          isExpanded ? 'w-60' : 'w-[72px]'
        )}
      >
        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-red-primary/10 text-red-primary'
                    : 'text-text-secondary hover:bg-hover hover:text-text-primary',
                  !isExpanded && 'flex-col gap-1 py-3 px-1 justify-center'
                )}
                title={!isExpanded ? item.name : undefined}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', active && 'text-red-primary')} />
                {isExpanded ? (
                  <span className="truncate">{item.name}</span>
                ) : (
                  <span className="text-[10px] truncate text-center">{item.name.split(' ')[0]}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Back to Taboo */}
        <div className="p-3 border-t border-border">
          <Link
            href="/home"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-hover hover:text-text-primary transition-colors',
              !isExpanded && 'flex-col gap-1 py-3 px-1 justify-center'
            )}
            title={!isExpanded ? 'Back to Taboo' : undefined}
          >
            <ArrowLeft className="w-5 h-5" />
            {isExpanded ? (
              <span>Back to Taboo</span>
            ) : (
              <span className="text-[10px]">Back</span>
            )}
          </Link>
        </div>

        {/* Footer - Only when expanded */}
        {isExpanded && (
          <div className="px-4 py-3 border-t border-border">
            <p className="text-[10px] text-text-secondary leading-relaxed">
              &copy; {new Date().getFullYear()} TabooTV
            </p>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 bottom-0 z-50 bg-background border-r border-black flex flex-col w-60 transition-transform duration-300 lg:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-black bg-black">
          <div className="flex items-center gap-2">
            <Logo size="sm" linkTo="/home" />
            <span className="text-xs font-medium text-red-primary px-2 py-0.5 bg-red-primary/10 rounded">
              Studio
            </span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-full hover:bg-hover text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-red-primary/10 text-red-primary'
                    : 'text-text-secondary hover:bg-hover hover:text-text-primary'
                )}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', active && 'text-red-primary')} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Back to Taboo */}
        <div className="p-3 border-t border-border">
          <Link
            href="/home"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-hover hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Taboo
          </Link>
        </div>

        {/* Mobile Footer */}
        <div className="px-4 py-3 border-t border-border">
          <p className="text-[10px] text-text-secondary">
            &copy; {new Date().getFullYear()} TabooTV
          </p>
        </div>
      </aside>
    </>
  );
}
