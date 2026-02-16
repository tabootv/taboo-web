'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import type { FeatureName } from '@/shared/lib/config/feature-flags';
import { isFeatureEnabled } from '@/shared/lib/config/feature-flags';
import { cn } from '@/shared/utils/formatting';
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
  const { open } = useSidebar();

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
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className={cn(!open ? 'space-y-6' : 'space-y-0.5')}>
              {studioNavigation
                .filter((item) => {
                  const flag = featureFlagMap[item.href];
                  return !flag || isFeatureEnabled(flag);
                })
                .map((item) => {
                  const active = isActive(item.href);
                  return (
                    <SidebarMenuItem key={item.name} className="flex items-center justify-center">
                      <SidebarNavLink
                        href={item.href}
                        icon={item.icon}
                        label={item.name}
                        isActive={active}
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
            <SidebarMenu className={cn(!open ? 'space-y-6' : 'space-y-0.5')}>
              <SidebarMenuItem className="flex items-center justify-center">
                <SidebarNavLink href="/" icon={ArrowLeft} label="Back to Taboo" />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className={cn('px-2 py-1 text-[12px] text-sidebar-foreground/50', !open && 'hidden')}>
          &copy; {new Date().getFullYear()} TabooTV
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
