'use client';

import { StudioSidebar } from '@/components/sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { StudioHeader } from '@/features/creator-studio';
import { useAuthStore } from '@/shared/stores/auth-store';
import { cn } from '@/shared/utils/formatting';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  // Safety valve: if hydration stalls, stop blocking after 3s
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!_hasHydrated) {
        useAuthStore.setState({ _hasHydrated: true });
      }
    }, 3000);
    return () => clearTimeout(timeout);
  }, [_hasHydrated]);

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!user?.channel && !user?.is_creator) {
      router.replace('/');
    }

    setIsChecking(false);
  }, [_hasHydrated, user, router]);

  if (!_hasHydrated || isChecking) {
    // After hydration, cached user data is available from localStorage
    if (_hasHydrated && !user?.channel && !user?.is_creator) {
      // Non-creator: show nothing while redirect fires
      return null;
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          {_hasHydrated && <p className="text-text-secondary">Loading Creator Studio...</p>}
        </div>
      </div>
    );
  }

  if (!user?.channel && !user?.is_creator) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <SidebarProvider defaultOpen={false}>
        <StudioHeader />
        <div className="flex pt-(--header-height)">
          <StudioSidebar />

          <SidebarInset className="min-h-[calc(100svh-var(--header-height))] bg-background">
            <div className={cn('w-full pt-6')}>{children}</div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
