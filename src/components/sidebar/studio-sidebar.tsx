'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import type { FeatureName } from '@/shared/lib/config/feature-flags';
import { isFeatureEnabled } from '@/shared/lib/config/feature-flags';
import {
  ArrowLeft,
  BarChart3,
  DollarSign,
  Film,
  LayoutDashboard,
  Settings,
  Ticket,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const studioNavigation = [
  { name: 'Dashboard', href: '/studio', icon: LayoutDashboard },
  { name: 'Content', href: '/studio/content', icon: Film },
  { name: 'Analytics', href: '/studio/analytics', icon: BarChart3 },
  { name: 'Earnings', href: '/studio/earnings', icon: DollarSign },
  { name: 'Payouts', href: '/studio/payouts', icon: Wallet },
  { name: 'Settings', href: '/studio/settings', icon: Settings },
  { name: 'Codes', href: '/studio/codes', icon: Ticket },
];

const featureFlagMap: Partial<Record<string, FeatureName>> = {
  '/studio/analytics': 'STUDIO_ANALYTICS',
  '/studio/earnings': 'STUDIO_EARNINGS',
  '/studio/payouts': 'STUDIO_PAYOUTS',
  '/studio/settings': 'STUDIO_SETTINGS',
  '/studio/codes': 'STUDIO_CODES',
};

export function StudioSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/studio') {
      return pathname === '/studio';
    }
    // For Content, match content path
    if (href === '/studio/content') {
      return pathname.startsWith('/studio/content');
    }
    return pathname.startsWith(href);
  };

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
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {studioNavigation
                .filter((item) => {
                  const flag = featureFlagMap[item.href];
                  return !flag || isFeatureEnabled(flag);
                })
                .map((item) => {
                  const active = isActive(item.href);
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.name}>
                        <Link href={item.href}>
                          <item.icon className={active ? 'text-red-primary' : ''} />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="mt-auto" />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Back to Taboo">
                  <Link href="/">
                    <ArrowLeft />
                    <span>Back to Taboo</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 py-1 text-[10px] text-sidebar-foreground/50">
          &copy; {new Date().getFullYear()} TabooTV
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
