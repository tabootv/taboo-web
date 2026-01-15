'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores';
import { StudioHeader } from '@/features/creator-studio';
import { StudioSidebar } from '@/components/sidebar';
import { SidebarProvider, SidebarInset, useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, _hasHydrated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for auth store to be ready AND hydrated from localStorage
    if (isLoading || !_hasHydrated) return;

    // Check authentication
    if (!isAuthenticated) {
      router.push('/sign-in?redirect=/studio');
      return;
    }

    // Check if user is a creator (has a channel or is_creator flag)
    if (!user?.channel && !user?.is_creator) {
      router.push('/home');
      return;
    }

    setIsChecking(false);
  }, [isAuthenticated, isLoading, _hasHydrated, user, router]);

  // Show loading while checking auth or waiting for hydration
  if (isLoading || !_hasHydrated || isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading Creator Studio...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authorized
  if (!isAuthenticated || (!user?.channel && !user?.is_creator)) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <StudioSidebar />
      <SidebarInset className="min-h-screen bg-background">
        <StudioContent>{children}</StudioContent>
      </SidebarInset>
    </SidebarProvider>
  );
}

function StudioContent({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar();
  const sidebarOffsetClass = state === 'expanded' ? 'md:pl-[16rem]' : 'md:pl-[3rem]';

  return (
    <div className={cn('min-h-screen bg-background', sidebarOffsetClass)}>
      <StudioHeader />
      <main className={cn('pt-14', sidebarOffsetClass)}>{children}</main>
    </div>
  );
}
