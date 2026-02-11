import { UserX } from 'lucide-react';
import Link from 'next/link';

export default function ProfileNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 page-px">
      <div className="p-4 bg-surface rounded-full border border-border">
        <UserX className="w-12 h-12 text-text-secondary" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-2">User Not Found</h1>
        <p className="text-text-secondary max-w-md">
          The user you&apos;re looking for doesn&apos;t exist or may have changed their handle.
        </p>
      </div>
      <Link
        href="/"
        className="px-6 py-2.5 bg-red-primary text-white rounded-lg font-medium hover:bg-red-dark transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
