'use client';

import { useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/shared/utils/formatting';
import Link from 'next/link';

interface SidebarNavLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive?: boolean;
  tooltip?: string;
  className?: string;
}

export function SidebarNavLink({
  href,
  icon: Icon,
  label,
  isActive,
  tooltip,
  className,
}: SidebarNavLinkProps) {
  const { isMobile, state } = useSidebar();

  const link = (
    <Link
      href={href}
      data-active={isActive}
      className={cn(
        'w-full flex items-center gap-6 px-3 py-2.5 rounded-lg transition-all text-text-secondary hover:bg-[#1a1a1a]',
        '[&>svg]:size-6 [&>svg]:shrink-0 [&>span]:truncate',
        'group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:[&>span]:hidden',
        isActive && 'bg-[#0d0d0d] font-medium',
        className
      )}
    >
      <Icon className={cn(isActive ? 'text-red-primary' : '')} />
      <span>{label}</span>
    </Link>
  );

  if (!tooltip) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" align="center" hidden={state !== 'collapsed' || isMobile}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
