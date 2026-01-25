/**
 * User menu dropdown component
 */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, User, LogOut, Settings, Bookmark, Clapperboard } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/shared/utils/formatting';
import { useAuthStore } from '@/shared/stores/auth-store';
import { useUserMenu } from '../hooks/use-user-menu';

interface NavbarUserMenuProps {
  isSearchExpanded: boolean;
}

export function NavbarUserMenu({ isSearchExpanded }: NavbarUserMenuProps) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { isUserMenuOpen, toggleMenu: toggleUserMenu, closeMenu: closeUserMenu } = useUserMenu();

  const handleLogout = async () => {
    await logout();
    closeUserMenu();
    router.push('/sign-in');
  };

  if (!isAuthenticated) {
    return (
      <div className="hidden sm:flex items-center gap-2">
        <Link href="/sign-in">
          <Button variant="ghost">Sign In</Button>
        </Link>
        <Link href="/register">
          <Button>Sign Up</Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 transition-all duration-300',
        isSearchExpanded ? 'w-0 opacity-0 overflow-hidden lg:opacity-100 lg:w-auto lg:overflow-visible' : 'opacity-100 w-auto'
      )}
    >
      {/* Notifications */}
      <Link
        href="/notifications"
        className="relative p-2 rounded-sm text-text-secondary hover:bg-hover hover:text-text-primary transition-colors"
      >
        <Bell className="w-5 h-5" />
      </Link>

      {/* User Menu */}
      <div className="relative">
        <button
          onClick={toggleUserMenu}
          className="flex items-center gap-2 p-1 rounded-sm hover:bg-hover transition-colors"
        >
          <Avatar src={user?.dp ?? null} alt={user?.display_name} size="sm" fallback={user?.display_name} />
        </button>

        {/* Dropdown */}
        {isUserMenuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={closeUserMenu} />
            <div className="absolute right-0 mt-2 w-56 bg-surface rounded-md elevation-medium border border-border py-1 z-20">
              <div className="px-4 py-2 border-b border-border">
                <p className="font-medium text-text-primary truncate">{user?.display_name}</p>
                <p className="text-sm text-text-secondary truncate">{user?.email}</p>
              </div>
              <Link
                href="/studio"
                onClick={closeUserMenu}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-primary hover:bg-red-primary/10 transition-colors"
              >
                <Clapperboard className="w-4 h-4" />
                Creator Studio
              </Link>
              <div className="border-b border-border" />
              <Link
                href="/profile"
                onClick={closeUserMenu}
                className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-hover hover:text-text-primary transition-colors"
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
              <Link
                href="/watchlist"
                onClick={closeUserMenu}
                className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-hover hover:text-text-primary transition-colors"
              >
                <Bookmark className="w-4 h-4" />
                Watchlist
              </Link>
              <Link
                href="/profile/settings"
                onClick={closeUserMenu}
                className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-hover hover:text-text-primary transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-primary hover:bg-hover transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

