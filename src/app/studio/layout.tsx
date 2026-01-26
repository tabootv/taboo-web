'use client';

import { StudioSidebar } from '@/components/sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { StudioHeader } from '@/features/creator-studio';
import { useAuthStore } from '@/shared/stores/auth-store';
import { cn } from '@/shared/utils/formatting';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, _hasHydrated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (isLoading || !_hasHydrated) return;

    if (!isAuthenticated) {
      router.push('/sign-in?redirect=/studio');
      return;
    }

    if (!user?.channel && !user?.is_creator) {
      router.push('/home');
      return;
    }

    setIsChecking(false);
  }, [isAuthenticated, isLoading, _hasHydrated, user, router]);

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
  return (
    <div className={cn('min-h-screen bg-background')}>
      <StudioHeader />
      <main className={cn('py-14')}>{children}</main>
    </div>
  );
}
