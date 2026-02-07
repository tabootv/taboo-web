'use client';

import { Footer } from '@/components/layout/footer';
import { NavigationProgress } from '@/components/layout/navigation/NavigationProgress';
import { TopHeader } from '@/components/layout/top-header';
import { Toaster } from 'sonner';

interface CleanLayoutProps {
  children: React.ReactNode;
  showBack?: boolean;
}

export function CleanLayout({ children, showBack: _showBack = true }: CleanLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavigationProgress />
      <TopHeader hiddenSearch={true} classNameDivContainer="account-container" />

      <main className="flex-1 flex flex-col">
        <div className="flex-1">{children}</div>
        <Footer />
      </main>

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
