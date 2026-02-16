'use client';

import { mainNavigation, userNavigation } from '@/components/layout/constants/navigation-constants';
import { Sidebar, SidebarContent, SidebarRail, SidebarSeparator } from '@/components/ui/sidebar';
import { NavMain } from './nav-main';
import { NavUser } from './nav-user';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={mainNavigation} />
        <SidebarSeparator className="bg-surface" />
        <NavUser items={userNavigation} />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
