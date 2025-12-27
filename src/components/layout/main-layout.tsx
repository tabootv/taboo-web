'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
  const router = useRouter();
  const PIP_RETURN_URL_KEY = 'tabootv_pip_return_url';

  // Check if we're on the home page (banner goes behind header)
  const isHomePage = pathname === '/home' || pathname === '/';

  // Check auth state on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Global PiP return handler: poll to detect when PiP closes
  // Note: leavepictureinpicture event doesn't bubble to document, so we poll instead
  useEffect(() => {
    const storedUrl = sessionStorage.getItem(PIP_RETURN_URL_KEY);

    // If no stored URL, nothing to do
    if (!storedUrl) return;

    // If we're already on the stored URL, clean up
    if (storedUrl === pathname) {
      sessionStorage.removeItem(PIP_RETURN_URL_KEY);
      return;
    }

    // If PiP is not active but we have a stored URL, navigate back immediately
    if (!document.pictureInPictureElement) {
      sessionStorage.removeItem(PIP_RETURN_URL_KEY);
      router.push(storedUrl);
      return;
    }

    // Poll to detect when PiP closes (since event doesn't bubble to document)
    const checkPiP = setInterval(() => {
      if (!document.pictureInPictureElement) {
        clearInterval(checkPiP);
        const url = sessionStorage.getItem(PIP_RETURN_URL_KEY);
        if (url && url !== pathname) {
          sessionStorage.removeItem(PIP_RETURN_URL_KEY);
          router.push(url);
        }
      }
    }, 200);

    return () => clearInterval(checkPiP);
  }, [pathname, router, PIP_RETURN_URL_KEY]);

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
