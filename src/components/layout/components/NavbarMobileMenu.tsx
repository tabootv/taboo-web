/**
 * Mobile menu component for navbar
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { mainNavigation } from '../constants/navigation-constants';
import { useAuthStore } from '@/lib/stores';

interface NavbarMobileMenuProps {
  isOpen: boolean;
  isSearchExpanded: boolean;
  searchQuery: string;
  onQueryChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function NavbarMobileMenu({
  isOpen,
  isSearchExpanded,
  searchQuery,
  onQueryChange,
  onSubmit,
  onClose,
}: NavbarMobileMenuProps) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  if (!isOpen || isSearchExpanded) return null;

  return (
    <div className="lg:hidden bg-black">
      <div className="px-4 py-2 space-y-1">
        {/* Mobile Search */}
        <form onSubmit={onSubmit} className="py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-red-primary transition-colors"
            />
          </div>
        </form>

        {mainNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-sm text-base font-medium transition-colors',
                isActive
                  ? 'bg-red-primary/10 text-red-primary'
                  : 'text-text-secondary hover:bg-hover hover:text-text-primary'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}

        {!isAuthenticated && (
          <div className="pt-4 pb-2 space-y-2">
            <Link href="/sign-in" onClick={onClose}>
              <Button variant="outline" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link href="/register" onClick={onClose}>
              <Button className="w-full">Sign Up</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

