/**
 * Desktop navigation links component
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/utils/formatting';
import { mainNavigation } from '../constants/navigation-constants';

interface NavbarDesktopNavigationProps {
  isSearchExpanded: boolean;
}

export function NavbarDesktopNavigation({ isSearchExpanded }: NavbarDesktopNavigationProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        'hidden lg:flex items-center transition-all duration-300',
        isSearchExpanded ? 'gap-0' : 'gap-1'
      )}
    >
      {mainNavigation.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.name}
            href={item.href}
            title={item.name}
            className={cn(
              'flex items-center justify-center rounded-sm font-medium transition-all duration-300',
              isActive
                ? 'bg-red-primary/10 text-red-primary'
                : 'text-text-secondary hover:bg-hover hover:text-text-primary',
              isSearchExpanded ? 'px-2 py-2 text-sm gap-0' : 'px-3 py-2 text-sm gap-2'
            )}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {!isSearchExpanded && <span>{item.name}</span>}
          </Link>
        );
      })}
    </div>
  );
}
