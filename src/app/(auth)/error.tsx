'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[AuthError]', error);
  }, [error]);

  return (
    <div className="w-full max-w-[400px] mx-auto">
      <div className="rounded-xl p-6 bg-surface border border-border">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-10 h-10 rounded-full bg-red-muted flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-primary" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-lg font-semibold text-text-primary text-center mb-1.5">
          Something went wrong
        </h1>
        <p className="text-sm text-text-secondary text-center mb-5">
          We couldn&apos;t load this page. Please try again.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={reset} variant="destructive" className="flex-1 gap-2">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
          <Button variant="outline" className="flex-1 gap-2" asChild>
            <Link href="/">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Minimal correlation ID */}
        {error.digest && (
          <p className="mt-4 text-center text-[11px] font-mono text-text-muted">
            Error ref: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
