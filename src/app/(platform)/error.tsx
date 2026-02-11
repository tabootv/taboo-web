'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/shared/utils/formatting';
import { AlertTriangle, ArrowLeft, ChevronDown, Copy, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function PlatformError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    console.error('[PlatformError]', error);
  }, [error]);

  const correlationIds = [
    error.digest && `Request ID: ${error.digest}`,
    process.env.NEXT_PUBLIC_BUILD_ID && `Build: ${process.env.NEXT_PUBLIC_BUILD_ID}`,
  ].filter(Boolean);

  const handleCopyIds = async () => {
    const text = correlationIds.join('\n');
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Copied to clipboard');
    }
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12">
      {/* Card */}
      <div className="w-full max-w-md bg-surface border border-border rounded-xl shadow-medium p-6 sm:p-8">
        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-12 h-12 rounded-full bg-red-muted flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-primary" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-xl font-semibold text-text-primary text-center mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-text-secondary text-center mb-6">
          We hit an unexpected error loading this page. You can try again or go back.
        </p>

        {/* Correlation IDs */}
        {correlationIds.length > 0 && (
          <div className="bg-elevated rounded-lg p-3 mb-5">
            <div className="flex items-center justify-between gap-2">
              <div className="font-mono text-xs text-text-tertiary space-y-0.5 min-w-0">
                {correlationIds.map((id) => (
                  <div key={id} className="truncate">
                    {id}
                  </div>
                ))}
              </div>
              <button
                onClick={handleCopyIds}
                className="flex-shrink-0 p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors"
                aria-label="Copy error IDs"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={reset} variant="destructive" className="flex-1 gap-2">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
          <Button variant="outline" className="flex-1 gap-2" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>

        {/* Collapsible details */}
        {error.message && (
          <details
            className="mt-5"
            open={detailsOpen}
            onToggle={(e) => setDetailsOpen((e.target as HTMLDetailsElement).open)}
          >
            <summary className="flex items-center gap-1.5 text-xs text-text-tertiary cursor-pointer select-none hover:text-text-secondary transition-colors">
              <ChevronDown
                className={cn('w-3.5 h-3.5 transition-transform', detailsOpen && 'rotate-180')}
              />
              Technical details
            </summary>
            <div className="mt-2 bg-elevated rounded-lg p-3">
              <p className="font-mono text-xs text-text-tertiary break-words">{error.message}</p>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
