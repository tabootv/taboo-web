'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, Bell, User, LogOut, Clapperboard, Edit2, Settings } from 'lucide-react';
import { Avatar, Button } from '@/components/ui';
import { Logo } from '@/components/ui/logo';
import { SearchInput } from '@/components/search';
import { useAuthStore, useSidebarStore } from '@/lib/stores';

export function TopHeader() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { toggleExpanded, toggleMobileOpen } = useSidebarStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
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
  }, [isUserMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-background border-b border-border">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-2">
          {/* Hamburger - Desktop: toggle sidebar, Mobile: open drawer */}
          <button
            onClick={() => {
              if (window.innerWidth >= 1024) {
                toggleExpanded();
              } else {
                toggleMobileOpen();
              }
            }}
            className="p-2 rounded-full hover:bg-hover text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Logo size="md" linkTo="/home" />
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-md mx-4 hidden sm:block">
          <SearchInput />
        </div>

        {/* Right: Notifications, User */}
        <div className="flex items-center gap-1">

          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <Link
                href="/notifications"
                className="p-2 rounded-full hover:bg-hover text-text-secondary hover:text-text-primary transition-colors"
              >
                <Bell className="w-5 h-5" />
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
                        <p className="font-semibold text-white truncate">
                          {user?.display_name}
                        </p>
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
              <Link href="/register" className="hidden sm:block">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
