'use client';

import { ComposeFAB } from '@/components/fab/compose-fab';
import { NavigationProgress } from '@/components/layout/navigation/NavigationProgress';
import { ScrollRestoration } from '@/components/layout/navigation/ScrollRestoration';
import { AppSidebar } from '@/components/sidebar';
import { SidebarBackdrop, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { cn } from '@/shared/utils/formatting';
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
  const pathname = usePathname();
  const router = useRouter();
  const PIP_RETURN_URL_KEY = 'tabootv_pip_return_url';

  // Route-based drawer mode: overlay sidebar on video/shorts pages
  const isDrawerRoute =
    pathname.startsWith('/videos/') ||
    (pathname.startsWith('/series/') && pathname.includes('/play/')) ||
    pathname.startsWith('/shorts');

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
    <SidebarProvider defaultOpen={false} drawerMode={isDrawerRoute}>
      <TopHeader />
      <div className="flex pt-[var(--header-height)]">
        <AppSidebar />
        <SidebarBackdrop />
        <SidebarInset className="bg-background min-h-[calc(100svh-var(--header-height))]">
          <ScrollRestoration />
          <NavigationProgress />

          <div className={cn('overflow-x-hidden flex-1')}>
            {children}
            {showFooter && <Footer />}
          </div>

          <ComposeFAB />
          <Toaster
            position="bottom-center"
            richColors
            className="z-99999999"
            toastOptions={{
              style: {
                background: '#ab0013',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#ffffff',
                zIndex: 99999,
              },
            }}
          />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
