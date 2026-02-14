'use client';
import { useNotifications } from '@/api/queries/notifications.queries';
import { SmartSearchDropdown } from '@/components/search';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { useSidebarSafe } from '@/components/ui/sidebar';
import { useAuthStore } from '@/shared/stores/auth-store';
import { cn } from '@/shared/utils/formatting';
import { Bell, LogOut, Menu, Settings } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

export function TopHeader({
  classNameDivContainer,
  hiddenSearch,
  hiddenGetStarted,
}: {
  classNameDivContainer?: string;
  hiddenSearch?: boolean;
  hiddenGetStarted?: boolean;
}) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const sidebar = useSidebarSafe();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { data: notificationsList = [] } = useNotifications();

  const unreadCount = useMemo(() => {
    const allNotifications = Array.isArray(notificationsList) ? notificationsList.flat() : [];
    return allNotifications.filter((n) => n && !n.read_at).length;
  }, [notificationsList]);

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isUserMenuOpen) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      // Delay to prevent immediate close
      const timer = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleClickOutside);
      };
    }
    return undefined;
  }, [isUserMenuOpen]);

  return (
    <header className="sticky top-0 left-0 right-0 h-[4rem] bg-black backdrop-blur-xs z-9999">
      <div
        className={cn(
          'flex items-center justify-between h-full page-px mx-auto max-w-[1920px]',
          classNameDivContainer
        )}
      >
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center">
          {/* Hamburger - Aligned with sidebar icons (3rem = 48px width) */}
          {sidebar && (
            <div className="w-12 h-14 flex items-center justify-center shrink-0 md:hidden">
              <button
                onClick={sidebar.toggleSidebar}
                className="p-2 rounded-full hover:bg-hover text-text-secondary hover:text-text-primary transition-colors"
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          )}

          <Logo size="md" linkTo="/" />
        </div>

        {/* Center: Search */}
        {hiddenSearch ?? (
          <div className="flex-1 max-w-md mx-4 hidden sm:block">
            <SmartSearchDropdown />
          </div>
        )}

        {/* Right: Notifications, User */}
        <div className="flex items-center gap-1">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <Link
                href="/notifications"
                className="relative p-2 rounded-full hover:bg-hover text-text-secondary hover:text-text-primary transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold text-white bg-red-primary rounded-full">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              <div className="relative ml-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsUserMenuOpen(!isUserMenuOpen);
                  }}
                  className="flex items-center p-0.5 rounded-full hover:bg-hover transition-colors"
                >
                  <Avatar
                    src={user?.dp}
                    alt={user?.display_name}
                    size="sm"
                    fallback={user?.display_name}
                  />
                </button>

                {/* Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-3 w-64 rounded-xl border border-white/10 bg-black/90 backdrop-blur-md shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
                    <div className="absolute right-6 -top-2 w-3 h-3 bg-black/90 border-l border-t border-white/10 rotate-45" />
                    {/* User Block */}
                    <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
                      <Avatar
                        src={user?.dp}
                        alt={user?.display_name}
                        size="md"
                        fallback={user?.display_name}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{user?.display_name}</p>
                        <p className="text-xs text-white/60 truncate">{user?.email}</p>
                      </div>
                    </div>

                    <div className="py-2">
                      <Link
                        href="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Profile
                      </Link>
                    </div>

                    <div className="border-t border-white/10" />

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>

              {!hiddenGetStarted && (
                <Link href="/choose-plan" className="hidden sm:block">
                  <Button size="sm">Get Started</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
