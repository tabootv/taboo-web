'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { TopHeader } from './top-header';
import { Sidebar } from './sidebar';
import { Footer } from './footer';
import { NavigationProgress } from '@/components/navigation/NavigationProgress';
import { useAuthStore, useSidebarStore } from '@/lib/stores';
import { Toaster } from 'sonner';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export function MainLayout({ children, showFooter = true }: MainLayoutProps) {
  const { checkAuth } = useAuthStore();
  const { isExpanded } = useSidebarStore();
  const pathname = usePathname();

  // Check if we're on the home page (banner goes behind header)
  const isHomePage = pathname === '/home' || pathname === '/';

  // Check auth state on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="bg-background min-h-screen">
      <NavigationProgress />
      <TopHeader />
      <Sidebar />

      {/* Main content area - shifts based on sidebar state */}
      <div
        className={cn(
          'pt-14 transition-all duration-300',
          // Desktop: margin-left based on sidebar expanded state
          'lg:ml-[72px]',
          isExpanded && 'lg:ml-60'
        )}
      >
        <main className={isHomePage ? '' : ''}>{children}</main>
        {showFooter && <Footer />}
      </div>

      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          style: {
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          },
        }}
      />
    </div>
  );
}
