'use client';

import { useRouter } from 'next/navigation';
import { Component, type ReactNode } from 'react';
import { Button } from './ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component to catch React errors and display user-friendly messages.
 */
class ErrorBoundaryClass extends Component<
  ErrorBoundaryProps & { router: ReturnType<typeof useRouter> },
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps & { router: ReturnType<typeof useRouter> }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  handleGoBack = (): void => {
    const { router } = this.props;
    if (typeof document !== 'undefined' && document.referrer) {
      router.push(document.referrer);
    } else {
      router.back();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="max-w-md w-full rounded-lg bg-surface border border-border p-6 text-center">
            <h2 className="text-xl font-semibold text-text-primary mb-2">Something went wrong</h2>
            <p className="text-text-secondary mb-4">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={this.handleReset} variant="outline">
                Try Again
              </Button>
              <Button onClick={this.handleGoBack} variant="outline">
                Go Back
              </Button>
              <Button onClick={() => globalThis.location.reload()} variant="default">
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Error boundary wrapper that provides router access.
 */
export function ErrorBoundary(props: ErrorBoundaryProps) {
  const router = useRouter();
  return <ErrorBoundaryClass {...props} router={router} />;
}
