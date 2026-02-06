'use client';

import { Toaster } from 'sonner';
import { Logo } from '@/components/ui/logo';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px]"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(171, 0, 19, 0.06) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 py-5 px-4">
        <div className="max-w-7xl mx-auto">
          <Logo size="md" linkTo="/home" />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-[400px]">
          {/* Solid Dark Card - Compact Supabase Style */}
          <div className="rounded-xl p-6 bg-surface border border-border">
            {/* Title */}
            {title && (
              <div className="text-center mb-5">
                <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
                {subtitle && <p className="mt-1.5 text-sm text-text-secondary">{subtitle}</p>}
              </div>
            )}

            {/* Form Content */}
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs text-text-secondary">
            &copy; {new Date().getFullYear()} TabooTV. All rights reserved.
          </p>
        </div>
      </footer>

      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          style: {
            background: '#0d0d0d',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#e6e7ea',
          },
        }}
      />
    </div>
  );
}
