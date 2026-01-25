'use client';

import { useVideos } from '@/api/queries/video.queries';
import type { Creator } from '@/types';
import { useMemo } from 'react';
import { CreatorFeaturedVideo } from '../CreatorFeaturedVideo';
import { CreatorShortsGrid } from '../CreatorShortsGrid';
import { CreatorVideoGrid } from '../CreatorVideoGrid';
import { shuffleArray } from '@/shared/utils/array';
import type { TabType } from '../types';

interface CreatorHomeTabProps {
  creator: Creator;
  onTabChange: (tab: TabType) => void;
}

export function CreatorHomeTab({ creator, onTabChange }: CreatorHomeTabProps) {
  const { data: videosData, isLoading: videosLoading } = useVideos(
    {
      creators: String(creator.id),
      short: false,
      sort_by: 'latest',
      per_page: 20,
    },
    {
      enabled: true,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );

  const { data: shortsData, isLoading: shortsLoading } = useVideos(
    {
      creators: String(creator.id),
      short: true,
      sort_by: 'latest',
      per_page: 20,
    },
    {
      enabled: true,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );

  const longVideos = videosData?.videos || [];
  const shortVideos = shortsData?.videos || [];
  const featuredVideo = longVideos[0];
  const latestVideos = longVideos.slice(1);
  const randomShorts = useMemo(() => shuffleArray(shortVideos), [shortVideos]);

  if (videosLoading || shortsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div
          className="w-10 h-10 rounded-full border-4 border-[#1a1a1a] border-t-[#AB0113]"
          style={{ animation: 'spin 1s linear infinite' }}
        />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      {featuredVideo && <CreatorFeaturedVideo video={featuredVideo} />}

      {latestVideos.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-9">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white mb-4 sm:mb-6 sm:text-xl">
              Latest Videos
            </h2>

            <button
              onClick={() => onTabChange('videos')}
              className="inline-flex items-center gap-1.5 text-white/50 text-sm font-medium bg-transparent border-none cursor-pointer hover:text-white transition-colors"
            >
              Show more{' '}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>

          <CreatorVideoGrid videos={latestVideos} variant="rail" />
        </section>
      )}

      {shortVideos.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-9">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white mb-4 sm:mb-6 sm:text-xl">
              Shorts
            </h2>

            <button
              onClick={() => onTabChange('shorts')}
              className="inline-flex items-center gap-1.5 text-white/50 text-sm font-medium bg-transparent border-none cursor-pointer hover:text-white transition-colors"
            >
              Show more{' '}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>

          <CreatorShortsGrid shorts={randomShorts.slice(0, 8)} variant="rail" />
        </section>
      )}
    </>
  );
}
