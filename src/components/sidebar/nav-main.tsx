'use client';

import type { NavigationItem } from '@/components/layout/constants/navigation-constants';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn } from '@/shared/utils/formatting';
import { usePathname } from 'next/navigation';
import { useSidebar } from '../ui/sidebar';
import { SidebarNavLink } from './sidebar-nav-link';

interface NavMainProps {
  items: NavigationItem[];
}

export function NavMain({ items }: NavMainProps) {
  const pathname = usePathname();
  const { open } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className={cn(!open ? 'space-y-6' : 'space-y-0.5')}>
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <SidebarMenuItem key={item.name} className="flex items-center justify-center">
                <SidebarNavLink
                  href={item.href}
                  icon={item.icon}
                  label={item.name}
                  isActive={isActive}
                />
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
