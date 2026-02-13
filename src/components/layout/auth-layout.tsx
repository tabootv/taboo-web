'use client';

import { Logo } from '@/components/ui/logo';
import Link from 'next/link';
import { Toaster } from 'sonner';

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
      <header className="relative z-10 py-6 px-6 md:px-12 w-full border-white/5 border-b">
        <div className="max-w-7xl mx-auto">
          <Logo size="md" linkTo="/" />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-start justify-center px-4 py-6">
        <div className="w-full max-w-[480px]">
          {/* Solid Dark Card - Compact Supabase Style */}
          <div className="rounded-xl py-8 px-5">
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
      <footer className="relative z-10 py-6 px-4 text-center border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-medium text-white/20 uppercase tracking-widest">
          <p>&copy; {new Date().getFullYear()} TabooTV. All rights reserved.</p>
          <div className="flex gap-6">
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href="https://taboo.tv/terms-conditions"
            >
              Terms
            </Link>
            <Link target="_blank" rel="noopener noreferrer" href="https://taboo.tv/privacy-policy">
              Privacy
            </Link>
            <Link target="_blank" rel="noopener noreferrer" href="https://taboo.tv/refund-policy">
              Refund
            </Link>
            <Link target="_blank" rel="noopener noreferrer" href="https://taboo.tv/become-creator">
              Become a Creator
            </Link>
          </div>
        </div>
      </footer>

      <Toaster
        position="bottom-center"
        richColors
        toastOptions={{
          style: {
            background: '#0d0d0d',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#e6e7ea',
            zIndex: 99999,
          },
        }}
      />
    </div>
  );
}
