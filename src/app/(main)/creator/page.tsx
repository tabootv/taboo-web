'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Users, Video, Rss, Star } from 'lucide-react';
import { creators as creatorsApi } from '@/lib/api';
import type { Creator } from '@/types';
import { formatCompactNumber } from '@/lib/utils';

// Filter categories for creators
const filterCategories = [
  { id: 'all', name: 'All Creators' },
  { id: 'documentary', name: 'Documentary' },
  { id: 'journalism', name: 'Journalism' },
  { id: 'investigation', name: 'Investigation' },
  { id: 'travel', name: 'Travel' },
];

export default function CreatorsPage() {
  const [creatorsList, setCreatorsList] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        setIsLoading(true);
        const response = await creatorsApi.list({ page: 1 });
        const creators = response.data || [];
        setCreatorsList(creators);
      } catch (error) {
        console.error('Error fetching creators:', error);
      } finally {
        setTimeout(() => setIsLoading(false), 500);
      }
    };

    fetchCreators();
  }, []);

  return (
    <div className="creators-page-atmosphere min-h-screen">
      {/* Atmospheric Background */}
      <div className="creators-atmosphere-bg" />

      <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 pt-6">
        {/* Page Title left, tabs centered to match community */}
        <div className="relative flex items-center min-h-[44px] pb-3">
          <h1 className="text-2xl md:text-3xl font-bold text-white absolute left-0">
            Creators
          </h1>
          <div className="w-full flex justify-center">
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
          </div>
        </div>

        {/* Creators Grid */}
        <div className="mt-4">
          {isLoading ? (
            <div className="grid-creators">
              {Array.from({ length: 6 }).map((_, index) => (
                <CreatorCardSkeleton key={index} />
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

        {/* Empty State */}
        {!isLoading && creatorsList.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-[#131315] flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-red-primary" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No creators found
            </h3>
            <p className="text-text-secondary max-w-md">
              Check back later for new content creators.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Clean Creator Card Component
function CreatorCard({ creator }: { creator: Creator }) {
  const [isFollowing, setIsFollowing] = useState(creator.following ?? false);

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await creatorsApi.toggleFollow(creator.id);
      if (response) {
        setIsFollowing(response.is_following);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  return (
    <div className="creator-card-bg h-full">
      <Link href={`/creators/creator-profile/${creator.id}`} className="flex flex-col h-full">
        {/* Banner */}
        <div className="relative h-[110px] w-full rounded-t-lg overflow-hidden">
          {creator.banner ? (
            <Image
              src={creator.banner}
              alt=""
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-red-dark to-red-primary" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/50" />
        </div>

        {/* Content */}
        <div className="card-content flex-1">
          {/* Avatar */}
          <div className="relative size-[88px] rounded-full overflow-hidden border-4 border-surface -mt-[60px] bg-surface flex-shrink-0">
            {creator.dp ? (
              <Image
                src={creator.dp}
                alt={creator.name || 'Creator'}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-red-primary to-red-dark flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {(creator.name || 'C').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="w-full">
            <div className="flex items-center justify-between gap-[10px]">
              <div>
                <p className="text-[18px] font-medium text-white">{creator.name}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 text-xs text-text-secondary border border-white/10">
                    <Video className="w-3.5 h-3.5" />
                    <span className="font-medium">{creator.videos_count || 0}</span>
                    <span className="uppercase tracking-wide text-[10px] opacity-70">Videos</span>
                  </span>
                </div>
              </div>

              {/* Desktop Follow Button */}
              <div className="hidden md:block">
                <button
                  onClick={handleFollow}
                  aria-pressed={isFollowing}
                  className="btn btn-primary btn-sm min-w-[96px] justify-center"
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>

            <p className="text-[14px] font-normal text-[#9D9D9D] mt-3 line-clamp-3">
              {creator.description}
            </p>
          </div>
        </div>

        {/* Mobile Follow Button */}
        <div className="md:hidden">
          <button
            onClick={handleFollow}
            aria-pressed={isFollowing}
            className="btn btn-primary btn-sm w-[93%] mx-auto my-[15px] min-w-[120px] justify-center"
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>
      </Link>
    </div>
  );
}

// Skeleton Loader
function CreatorCardSkeleton() {
  return (
    <div className="creator-card-bg h-full">
      {/* Banner Skeleton */}
      <div className="h-[100px] w-full bg-gray-700 rounded-t-lg animate-pulse" />
      <div className="card-content !px-2">
        {/* Avatar Skeleton */}
        <div className="size-[88px] rounded-full bg-gray-700 -mt-[60px] animate-pulse" />
        <div className="w-full">
          <div className="flex items-center justify-between">
            {/* Name Skeleton */}
            <div className="w-[120px] h-[22px] bg-gray-700 rounded animate-pulse" />
            {/* Button Skeleton */}
            <div className="w-[86px] h-[36px] bg-gray-700 rounded-[18px] animate-pulse hidden md:block" />
          </div>
          {/* Description Skeleton */}
          <div className="w-[230px] h-[22px] bg-gray-700 rounded animate-pulse mt-2 md:mt-6" />
        </div>
      </div>
    </div>
  );
}
