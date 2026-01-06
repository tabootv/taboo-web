'use client';

import { useSidebarStore } from '@/lib/stores';
import { StudioSidebar, StudioHeader } from '@/features/creator-studio';
import { cn } from '@/lib/utils';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const { isExpanded } = useSidebarStore();

  return (
    <div className="min-h-screen bg-background">
      <StudioHeader />
      <StudioSidebar />

      {/* Main content area - shifts based on sidebar state */}
      <main
        className={cn(
          'pt-14 min-h-screen transition-all duration-300',
          // Desktop: margin-left based on sidebar expanded state
          'lg:ml-[72px]',
          isExpanded && 'lg:ml-60'
        )}
      >
        {children}
      </main>
    </div>
  );
}
