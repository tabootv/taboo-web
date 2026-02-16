'use client';

import type { NavigationItem } from '@/components/layout/constants/navigation-constants';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { SidebarNavLink } from './sidebar-nav-link';

interface NavMainProps {
  items: NavigationItem[];
}

export function NavMain({ items }: NavMainProps) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-0.5 py-3">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <SidebarMenuItem key={item.name} className="flex">
                <SidebarNavLink
                  href={item.href}
                  icon={item.icon}
                  label={item.name}
                  isActive={isActive}
                  tooltip={item.name}
                />
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
