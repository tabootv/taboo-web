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
  useSidebar,
} from '@/components/ui/sidebar';
import {
  ArrowLeft,
  BarChart3,
  DollarSign,
  LayoutDashboard,
  Settings,
  Upload,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const studioNavigation = [
  { name: 'Dashboard', href: '/studio', icon: LayoutDashboard },
  { name: 'Upload', href: '/studio/upload/video', icon: Upload },
  { name: 'Analytics', href: '/studio/analytics', icon: BarChart3 },
  { name: 'Earnings', href: '/studio/earnings', icon: DollarSign },
  { name: 'Payouts', href: '/studio/payouts', icon: Wallet },
  { name: 'Settings', href: '/studio/settings', icon: Settings },
];

export function StudioSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const isActive = (href: string) => {
    if (href === '/studio') {
      return pathname === '/studio';
    }
    // For Upload, match any upload path or posts
    if (href === '/studio/upload/video') {
      return pathname.startsWith('/studio/upload') || pathname === '/studio/posts';
    }
    return pathname.startsWith(href);
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2">
              <SidebarTrigger className="size-8" />
              <SidebarMenuButton
                asChild
                size="lg"
                className="data-[slot=sidebar-menu-button]:p-1.5!"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-red-primary">TabooTV</span>
                    <span className="text-[10px] font-medium text-red-primary px-1.5 py-0.5 bg-red-primary/10 rounded">
                      Studio
                    </span>
                  </div>
                </div>
              </SidebarMenuButton>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {studioNavigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.name}>
                      <Link href={item.href} onClick={handleNavClick}>
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
                  <Link href="/home" onClick={handleNavClick}>
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
