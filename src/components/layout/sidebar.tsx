'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  PlayCircle,
  Film,
  Layers,
  GraduationCap,
  Users,
  Globe2,
  History,
  Bookmark,
  Clapperboard,
  ChevronRight,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarStore, useAuthStore } from '@/lib/stores';
import { mainNavigation, userNavigation } from './constants/navigation-constants';

export function Sidebar() {
  const pathname = usePathname();
  const { isExpanded, isMobileOpen, setMobileOpen } = useSidebarStore();
  const { user, isAuthenticated } = useAuthStore();

  const isCreator = user?.channel;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-14 left-0 bottom-0 z-40 bg-background border-r border-border flex flex-col transition-all duration-300',
          // Desktop: always visible, width depends on expanded state
          'hidden lg:flex',
          isExpanded ? 'w-60' : 'w-[72px]',
          // Mobile: overlay drawer
          isMobileOpen && 'flex !w-60'
        )}
      >
        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden absolute top-3 right-3 p-1.5 rounded-full hover:bg-hover text-text-secondary hover:text-text-primary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 custom-scrollbar flex flex-col">
          {/* Main Navigation */}
          <nav className="px-2 space-y-1">
            {mainNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-4 px-3 py-2.5 rounded-lg font-medium transition-colors group',
                    isActive
                      ? 'bg-surface text-text-primary'
                      : 'text-text-secondary hover:bg-hover hover:text-text-primary',
                    !isExpanded && !isMobileOpen && 'flex-col gap-1 py-3 px-1'
                  )}
                  title={!isExpanded && !isMobileOpen ? item.name : undefined}
                >
                  <item.icon className={cn(
                    'w-5 h-5 flex-shrink-0',
                    isActive && 'text-red-primary'
                  )} />
                  {(isExpanded || isMobileOpen) ? (
                    <span className="text-sm truncate">{item.name}</span>
                  ) : (
                    <span className="text-[10px] truncate">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Spacer to push You section to bottom */}
          <div className="flex-1 min-h-4" />

          {/* You Section - Only when authenticated and expanded */}
          {isAuthenticated && (isExpanded || isMobileOpen) && (
            <>
              {/* Divider */}
              <div className="my-2 mx-3 border-t border-border" />

              <div className="px-2">
                <div className="flex items-center gap-2 px-3 py-2 text-text-primary">
                  <span className="text-base font-medium">You</span>
                  <ChevronRight className="w-4 h-4" />
                </div>

                <nav className="space-y-1">
                  {userNavigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href.split('?')[0] + '/');
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'flex items-center gap-4 px-3 py-2.5 rounded-lg font-medium transition-colors',
                          isActive
                            ? 'bg-surface text-text-primary'
                            : 'text-text-secondary hover:bg-hover hover:text-text-primary'
                        )}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm truncate">{item.name}</span>
                      </Link>
                    );
                  })}

                  {/* Your videos - Only for creators */}
                  {isCreator && (
                    <Link
                      href="/studio"
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-4 px-3 py-2.5 rounded-lg font-medium transition-colors',
                        pathname.startsWith('/studio')
                          ? 'bg-surface text-text-primary'
                          : 'text-text-secondary hover:bg-hover hover:text-text-primary'
                      )}
                    >
                      <Clapperboard className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm truncate">Your videos</span>
                    </Link>
                  )}
                </nav>
              </div>
            </>
          )}
        </div>

        {/* Footer - Only when expanded */}
        {(isExpanded || isMobileOpen) && (
          <div className="px-4 py-3 border-t border-border">
            <p className="text-[10px] text-text-secondary leading-relaxed">
              &copy; {new Date().getFullYear()} TabooTV
            </p>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar - Separate element for mobile overlay */}
      <aside
        className={cn(
          'fixed top-0 left-0 bottom-0 z-50 bg-background border-r border-border flex flex-col w-60 transition-transform duration-300 lg:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile Close Button */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-border">
          <span className="text-lg font-bold text-red-primary">TabooTV</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-full hover:bg-hover text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 custom-scrollbar">
          {/* Main Navigation */}
          <nav className="px-2 space-y-1">
            {mainNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-4 px-3 py-2.5 rounded-lg font-medium transition-colors',
                    isActive
                      ? 'bg-surface text-text-primary'
                      : 'text-text-secondary hover:bg-hover hover:text-text-primary'
                  )}
                >
                  <item.icon className={cn(
                    'w-5 h-5 flex-shrink-0',
                    isActive && 'text-red-primary'
                  )} />
                  <span className="text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          {isAuthenticated && (
            <div className="my-3 mx-3 border-t border-border" />
          )}

          {/* You Section */}
          {isAuthenticated && (
            <div className="px-2">
              <div className="flex items-center gap-2 px-3 py-2 text-text-primary">
                <span className="text-base font-medium">You</span>
                <ChevronRight className="w-4 h-4" />
              </div>

              <nav className="space-y-1">
                {userNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-4 px-3 py-2.5 rounded-lg font-medium transition-colors',
                        isActive
                          ? 'bg-surface text-text-primary'
                          : 'text-text-secondary hover:bg-hover hover:text-text-primary'
                      )}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm">{item.name}</span>
                    </Link>
                  );
                })}

                {isCreator && (
                  <Link
                    href="/studio"
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-4 px-3 py-2.5 rounded-lg font-medium transition-colors',
                      pathname.startsWith('/studio')
                        ? 'bg-surface text-text-primary'
                        : 'text-text-secondary hover:bg-hover hover:text-text-primary'
                    )}
                  >
                    <Clapperboard className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">Your videos</span>
                  </Link>
                )}
              </nav>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border">
          <p className="text-[10px] text-text-secondary">
            &copy; {new Date().getFullYear()} TabooTV
          </p>
        </div>
      </aside>
    </>
  );
}
