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
    <div className="min-h-screen flex flex-col bg-[#030303] relative overflow-hidden">
      {/* Frosted background effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle red glow at top */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(171, 0, 19, 0.08) 0%, transparent 70%)',
          }}
        />
        {/* Subtle ambient glow */}
        <div
          className="absolute bottom-0 left-0 w-[600px] h-[600px]"
          style={{
            background: 'radial-gradient(circle at center, rgba(255,255,255,0.02) 0%, transparent 60%)',
          }}
        />
        <div
          className="absolute top-1/3 right-0 w-[500px] h-[500px]"
          style={{
            background: 'radial-gradient(circle at center, rgba(255,255,255,0.015) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <Logo size="md" linkTo="/home" />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Frosted Glass Card */}
          <div
            className="rounded-2xl p-8 backdrop-blur-xl"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            {/* Title */}
            {title && (
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white">{title}</h1>
                {subtitle && <p className="mt-2 text-white/60">{subtitle}</p>}
              </div>
            )}

            {/* Form Content */}
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} TabooTV. All rights reserved.
          </p>
        </div>
      </footer>

      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          style: {
            background: 'rgba(13, 13, 13, 0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
          },
        }}
      />
    </div>
  );
}
