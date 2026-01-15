'use client';

import type { NavigationItem } from '@/components/layout/constants/navigation-constants';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useFeature } from '@/lib/hooks/use-feature';
import { useAuthStore } from '@/lib/stores';
import { ChevronRight, Clapperboard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavUserProps {
  items: NavigationItem[];
}

export function NavUser({ items }: NavUserProps) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const bookmarksEnabled = useFeature('BOOKMARK_SYSTEM');
  const historyEnabled = useFeature('WATCH_HISTORY');
  const isCreator = user?.channel;

  if (!isAuthenticated) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        <span>You</span>
        <ChevronRight className="ml-1 w-4 h-4" />
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            if (item.name === 'Watchlist' && !bookmarksEnabled) return null;
            if (item.name === 'History' && !historyEnabled) return null;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href.split('?')[0] + '/');
            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}

          {isCreator && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/studio')}
                tooltip="Creator Studio"
              >
                <Link href="/studio">
                  <Clapperboard />
                  <span>Creator Studio</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
