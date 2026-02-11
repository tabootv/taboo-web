'use client';

import { Avatar } from '@/components/ui/avatar';
import { useAuthStore } from '@/shared/stores/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface PublicProfileClientProps {
  handler: string;
  displayName: string | null;
  avatar?: string | undefined;
  isCreator: boolean;
}

export function PublicProfileClient({
  handler,
  displayName,
  avatar,
  isCreator,
}: PublicProfileClientProps) {
  const router = useRouter();
  const currentHandler = useAuthStore((state) => state.user?.handler);

  useEffect(() => {
    if (currentHandler === handler) {
      router.replace('/profile');
    }
  }, [currentHandler, handler, router]);

  return (
    <div className="page-px max-w-[1920px] py-6 min-h-screen">
      {/* Profile Header */}
      <div className="bg-surface rounded-lg elevation-low border border-border overflow-hidden">
        {/* Cover */}
        <div className="h-32 md:h-48 bg-linear-to-r from-red-primary to-red-dark" />

        {/* Profile Info */}
        <div className="relative px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 sm:-mt-12">
            {/* Avatar */}
            <Avatar
              src={avatar || null}
              alt={displayName || handler}
              fallback={displayName || handler}
              className="w-32 h-32 border-4 border-surface text-4xl"
            />

            {/* Info */}
            <div className="flex-1 sm:mb-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-text-primary">{displayName || handler}</h1>
                {isCreator ? (
                  <span className="text-xs px-2.5 py-1 bg-red-primary/20 text-red-primary rounded-full font-medium">
                    Creator
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-text-secondary">@{handler}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
