'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
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
import { usePathname } from 'next/navigation';
import { SidebarNavLink } from './sidebar-nav-link';

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
                      <SidebarNavLink
                        href={item.href}
                        icon={item.icon}
                        label={item.name}
                        isActive={active}
                        tooltip={item.name}
                      />
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-surface" />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarNavLink
                  href="/"
                  icon={ArrowLeft}
                  label="Back to Taboo"
                  tooltip="Back to Taboo"
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 py-1 text-[9px] text-sidebar-foreground/50">
          &copy; {new Date().getFullYear()} TabooTV
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
