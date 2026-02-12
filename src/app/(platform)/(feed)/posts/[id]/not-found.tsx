import { Button } from '@/components/ui/button';
import { FileX, MessageSquare, Home } from 'lucide-react';
import Link from 'next/link';

export default function PostNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl shadow-medium p-6 sm:p-8">
        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-12 h-12 rounded-full bg-red-muted flex items-center justify-center">
            <FileX className="w-6 h-6 text-red-primary" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-xl font-semibold text-text-primary text-center mb-2">Post not found</h1>
        <p className="text-sm text-text-secondary text-center mb-6">
          The post you&apos;re looking for doesn&apos;t exist or may have been deleted.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="destructive" className="flex-1 gap-2" asChild>
            <Link href="/community">
              <MessageSquare className="w-4 h-4" />
              Community
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
