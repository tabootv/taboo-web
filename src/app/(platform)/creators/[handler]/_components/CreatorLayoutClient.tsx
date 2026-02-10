'use client';

import {
  useCreatorByHandler,
  useCreatorProfile,
  useCreatorVideos,
} from '@/api/queries/creators.queries';
import { CreatorHeader } from './CreatorHeader';
import { CreatorTabs } from './CreatorTabs';
import type { TabConfig } from './types';
import { Button } from '@/components/ui/button';
import { buildSocialUrl } from '@/shared/utils/social';
import { useMemo } from 'react';
import {
  VideoIcon,
  ShortsIcon,
  GlobeIcon,
  XIcon,
  TikTokIcon,
  InstagramIcon,
  FacebookIcon,
  YouTubeIcon,
} from './SocialIcons';

interface CreatorLayoutClientProps {
  handler: string;
  children: React.ReactNode;
}

export function CreatorLayoutClient({ handler, children }: CreatorLayoutClientProps) {
  const {
    data: creatorData,
    isLoading: creatorLoading,
    error: creatorError,
    refetch: refetchCreator,
  } = useCreatorByHandler(handler, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const basicCreator = creatorData?.creators?.[0];
  const creatorId = useMemo(() => basicCreator?.id, [basicCreator?.id]);

  const { data: profileData } = useCreatorProfile(creatorId);

  const creator = useMemo(() => {
    if (profileData) return profileData;
    return basicCreator;
  }, [basicCreator, profileData]);

  const { data: videosData } = useCreatorVideos(creator?.id, {
    sort_by: 'newest',
  });

  const featuredVideoThumbnail = videosData?.data?.[0]?.thumbnail;

  const tabs = useMemo<TabConfig[]>(() => {
    if (!creator) return [];
    return [
      { key: 'home', label: 'Home' },
      { key: 'videos', label: 'Videos', count: creator.videos_count },
      { key: 'shorts', label: 'Shorts', count: creator.short_videos_count },
      { key: 'series', label: 'Series', count: creator.series_count },
      { key: 'posts', label: 'Posts', count: creator.posts_count },
      { key: 'education', label: 'Education', count: creator.course_count },
    ].filter(
      (tab) => tab.key === 'home' || (tab.count !== undefined && tab.count > 0)
    ) as TabConfig[];
  }, [creator]);

  const stats = useMemo(() => {
    if (!creator) return [];
    return [
      {
        key: 'videos',
        label: 'Videos',
        value: creator.total_videos ?? creator.videos_count ?? 0,
        icon: <VideoIcon />,
      },
      {
        key: 'shorts',
        label: 'Shorts',
        value: creator.total_shorts ?? creator.short_videos_count ?? 0,
        icon: <ShortsIcon />,
      },
      {
        key: 'countries',
        label: 'Countries Recorded',
        value: creator.countries_recorded ?? 0,
        icon: <GlobeIcon />,
      },
    ].filter((s) => Number(s.value) > 0);
  }, [creator]);

  const socialLinks = useMemo(() => {
    if (!creator) return [];
    return [
      { key: 'x', url: buildSocialUrl('x', creator.x), icon: <XIcon />, label: 'X' },
      {
        key: 'tiktok',
        url: buildSocialUrl('tiktok', creator.tiktok),
        icon: <TikTokIcon />,
        label: 'TikTok',
      },
      {
        key: 'instagram',
        url: buildSocialUrl('instagram', creator.instagram),
        icon: <InstagramIcon />,
        label: 'Instagram',
      },
      {
        key: 'facebook',
        url: buildSocialUrl('facebook', creator.facebook),
        icon: <FacebookIcon />,
        label: 'Facebook',
      },
      {
        key: 'youtube',
        url: buildSocialUrl('youtube', creator.youtube),
        icon: <YouTubeIcon />,
        label: 'YouTube',
      },
    ]
      .filter((s) => s.url !== null)
      .map((s) => ({ ...s, url: s.url! }));
  }, [creator]);

  if (creatorLoading || !creator) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
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

  if (creatorError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight text-white m-0">
            Failed to load creator
          </h1>
          <Button
            onClick={() => refetchCreator()}
            className="px-6 py-2.5 bg-[#AB0113] text-white text-sm font-semibold rounded-lg hover:bg-[#c41420] hover:scale-105 transition-all"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <CreatorHeader
        creator={creator}
        featuredVideoThumbnail={featuredVideoThumbnail}
        stats={stats}
        socialLinks={socialLinks}
      />

      <CreatorTabs handler={handler} tabs={tabs} />

      {children}
    </div>
  );
}
