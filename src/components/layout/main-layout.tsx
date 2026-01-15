'use client';

import { NavigationProgress } from '@/components/navigation/NavigationProgress';
import { AppSidebar } from '@/components/sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuthStore } from '@/lib/stores';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { Footer } from './footer';
import { TopHeader } from './top-header';

interface MainLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export function MainLayout({ children, showFooter = true }: MainLayoutProps) {
  const { checkAuth } = useAuthStore();
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
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset className="bg-background min-h-screen overflow-x-hidden">
        <NavigationProgress />
        <TopHeader />

        {/* Main content area */}
        <div className="pt-14">
          <main>{children}</main>
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
      </SidebarInset>
    </SidebarProvider>
  );
}
