'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { createPortal } from 'react-dom';

interface CircuitBreakerErrorUIProps {
  onClose: () => void;
  onRetry: () => void;
}

/**
 * Error UI displayed when the circuit breaker trips due to infinite render loops
 */
export function CircuitBreakerErrorUI({
  onClose,
  onRetry,
}: CircuitBreakerErrorUIProps): React.ReactNode {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md bg-surface border border-white/10 rounded-2xl shadow-2xl p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">Something went wrong</h2>
          <p className="text-sm text-text-secondary mb-6">
            The upload form encountered an error. Please try again.
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button onClick={onRetry} className="bg-red-primary hover:bg-red-primary/90">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
