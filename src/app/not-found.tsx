import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { Home, Search } from 'lucide-react';
import Link from 'next/link';

export default function RootNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-background relative overflow-hidden">
      {/* Decorative red glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(171, 0, 19, 0.08) 0%, transparent 70%)',
        }}
      />

      {/* Logo */}
      <div className="relative z-10 mb-8">
        <Logo size="md" linkTo="/" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-surface border border-border rounded-xl shadow-medium p-6 sm:p-8">
        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-12 h-12 rounded-full bg-red-muted flex items-center justify-center">
            <Search className="w-6 h-6 text-red-primary" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-xl font-semibold text-text-primary text-center mb-2">Page not found</h1>
        <p className="text-sm text-text-secondary text-center mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="destructive" className="flex-1 gap-2" asChild>
            <Link href="/">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
          <Button variant="outline" className="flex-1 gap-2" asChild>
            <Link href="/">Browse Content</Link>
          </Button>
        </div>
      </div>

      {/* Support footnote */}
      <p className="relative z-10 mt-6 text-xs text-text-tertiary text-center">
        If you believe this is an error, contact{' '}
        <a
          href="mailto:support@taboo.tv"
          className="text-text-secondary hover:text-text-primary underline underline-offset-2 transition-colors"
        >
          support@taboo.tv
        </a>
      </p>
    </div>
  );
}
