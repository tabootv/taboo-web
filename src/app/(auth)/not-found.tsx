import { Button } from '@/components/ui/button';
import { Home, LogIn, Search } from 'lucide-react';
import Link from 'next/link';

export default function AuthNotFound() {
  return (
    <div className="w-full max-w-[400px] mx-auto">
      <div className="rounded-xl p-6 bg-surface border border-border">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-10 h-10 rounded-full bg-red-muted flex items-center justify-center">
            <Search className="w-5 h-5 text-red-primary" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-lg font-semibold text-text-primary text-center mb-1.5">
          Page not found
        </h1>
        <p className="text-sm text-text-secondary text-center mb-5">
          This page doesn&apos;t exist.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="destructive" className="flex-1 gap-2" asChild>
            <Link href="/sign-in">
              <LogIn className="w-4 h-4" />
              Back to Sign In
            </Link>
          </Button>
          <Button variant="outline" className="flex-1 gap-2" asChild>
            <Link href="/">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
