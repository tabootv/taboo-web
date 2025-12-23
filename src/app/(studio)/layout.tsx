'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useStudioSidebarStore } from '@/lib/stores';
import { StudioSidebar, StudioHeader } from '@/components/studio';
import { cn } from '@/lib/utils';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { isExpanded } = useStudioSidebarStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for auth store to be ready
    if (isLoading) return;

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
  }, [isAuthenticated, isLoading, user, router]);

  // Show loading while checking auth
  if (isLoading || isChecking) {
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
