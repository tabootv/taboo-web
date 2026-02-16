'use client';

import type { NavigationItem } from '@/components/layout/constants/navigation-constants';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useFeature } from '@/hooks/use-feature';
import { useAuthStore } from '@/shared/stores/auth-store';
import { Clapperboard, UserPlus } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { SidebarNavLink } from './sidebar-nav-link';

interface NavUserProps {
  items: NavigationItem[];
}

export function NavUser({ items }: NavUserProps) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const bookmarksEnabled = useFeature('BOOKMARK_SYSTEM');
  const historyEnabled = useFeature('WATCH_HISTORY');
  const inviteEnabled = useFeature('INVITE_SYSTEM');
  const isCreator = user?.channel;

  if (!isAuthenticated) return null;

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-0.5 py-3">
          {items.map((item) => {
            if (item.name === 'Watchlist' && !bookmarksEnabled) return null;
            if (item.name === 'History' && !historyEnabled) return null;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href.split('?')[0] + '/');
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

          {inviteEnabled && (
            <SidebarMenuItem className="flex">
              <SidebarNavLink
                href="/account/invite"
                icon={UserPlus}
                label="Invite a Friend"
                isActive={pathname === '/account/invite'}
                tooltip="Invite a Friend"
              />
            </SidebarMenuItem>
          )}

          {isCreator && (
            <SidebarMenuItem className="flex">
              <SidebarNavLink
                href="/studio"
                icon={Clapperboard}
                label="Creator Studio"
                isActive={pathname.startsWith('/studio')}
                tooltip="Creator Studio"
              />
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
