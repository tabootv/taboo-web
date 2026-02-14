import { Button } from '@/components/ui/button';
import { Home, Search, Users } from 'lucide-react';
import Link from 'next/link';

export default function PlatformNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12">
      {/* Card */}
      <div className="w-full max-w-md bg-surface border border-border rounded-xl shadow-medium p-6 sm:p-8">
        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-12 h-12 rounded-full bg-red-muted flex items-center justify-center">
            <Search className="w-6 h-6 text-red-primary" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-xl font-semibold text-text-primary text-center mb-2">Page not found</h1>
        <p className="text-sm text-text-secondary text-center mb-6">
          This page doesn&apos;t exist or may have been moved.
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
            <Link href="/creators">
              <Users className="w-4 h-4" />
              Browse Creators
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
