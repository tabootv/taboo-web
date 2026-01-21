'use client';

import { useCreatorsList } from '@/api/queries';
import { CreatorCard, CreatorCardSkeleton } from '@/components/creator';
import { PageHeader } from '@/components/ui';
import { Rss, Star, Users } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

export default function CreatorsPage() {
  const { data, isLoading } = useCreatorsList({ page: 1 });

  // Stable sorting by id prevents list reshuffling when following creators
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
    <div className="creators-page-atmosphere min-h-screen">
      <div className="creators-atmosphere-bg" />

      <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 pt-6">
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
                href="/creator"
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
            <div className="grid-creators">
              {skeletonKeys.map((key: string) => (
                <CreatorCardSkeleton key={key} />
              ))}
            </div>
          ) : (
            <div className="grid-creators">
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
            <p className="text-text-secondary max-w-md">
              Check back later for new content creators.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
