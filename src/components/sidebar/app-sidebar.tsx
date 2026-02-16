'use client';

import { mainNavigation, userNavigation } from '@/components/layout/constants/navigation-constants';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { NavMain } from './nav-main';
import { NavUser } from './nav-user';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 py-2">
              <SidebarTrigger className="size-8" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={mainNavigation} />
        <SidebarSeparator className="bg-surface" />
        <NavUser items={userNavigation} />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
