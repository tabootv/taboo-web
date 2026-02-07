'use client';

import { useCreatorsList } from '@/api/queries/creators.queries';
import { PageHeader } from '@/components/ui/page-header';
import { CreatorCard } from '@/features/creator/components/CreatorCard';
import { CreatorCardSkeleton } from '@/features/creator/components/CreatorCardSkeleton';
import { Rss, Star, Users } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

export default function CreatorsPage() {
  const { data, isLoading } = useCreatorsList({ page: 1 });

  const creatorsList = useMemo(() => {
    const creators = data?.data || [];
    return [...creators].sort((a, b) => a.id - b.id);
  }, [data?.data]);

  const skeletonKeys = useMemo(
    () =>
      Array.from(
        { length: 6 },
        (_, i) => `creator-skeleton-${i}-${Math.random().toString(36).substring(2, 9)}`
      ),
    []
  );

  return (
    <div className="relative z-10 mx-auto page-px py-12">
      <PageHeader
        title="Creators"
        classNameActions="mx-auto"
        actions={
          <div className="flex gap-2">
            <Link
              href="/community"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 text-text-secondary border border-white/10 font-medium text-sm transition-all hover:bg-white/10 hover:text-white"
            >
              <Rss className="w-4 h-4" />
              Posts
            </Link>
            <Link
              href="/creators"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-primary/10 text-red-primary border border-red-primary/30 font-medium text-sm transition-all hover:bg-red-primary/20"
            >
              <Star className="w-4 h-4" />
              Creators
            </Link>
          </div>
        }
      />

      <div className="mt-4">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {skeletonKeys.map((key: string) => (
              <CreatorCardSkeleton key={key} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {creatorsList.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        )}
      </div>

      {!isLoading && creatorsList.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-[#131315] flex items-center justify-center mb-6">
            <Users className="w-8 h-8 text-red-primary" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No creators found</h3>
          <p className="text-text-secondary max-w-md">Check back later for new content creators.</p>
        </div>
      )}
    </div>
  );
}
