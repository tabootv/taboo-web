'use client';

import { useCreatorByHandler, useCreatorProfile } from '@/api/queries/creators.queries';
import { useVideos } from '@/api/queries/video.queries';
import { CreatorHeader } from './_components/CreatorHeader';
import { CreatorTabs } from './_components/CreatorTabs';
import { CreatorHomeTab } from './_components/tabs/CreatorHomeTab';
import { CreatorVideosTab } from './_components/tabs/CreatorVideosTab';
import { CreatorShortsTab } from './_components/tabs/CreatorShortsTab';
import { CreatorSeriesTab } from './_components/tabs/CreatorSeriesTab';
import { CreatorPostsTab } from './_components/tabs/CreatorPostsTab';
import { CreatorEducationTab } from './_components/tabs/CreatorEducationTab';
import type { TabConfig, TabType } from './_components/types';
import { Button } from '@/components/ui/button';
import { buildSocialUrl } from '@/shared/utils/social';
import { Globe, Play, PlaySquare } from 'lucide-react';
import { useMemo, useState } from 'react';

function VideoIcon() {
  return <Play className="w-[18px] h-[18px]" />;
}

function ShortsIcon() {
  return <PlaySquare className="w-[18px] h-[18px]" />;
}

function GlobeIcon() {
  return <Globe className="w-[18px] h-[18px]" />;
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

interface CreatorPageContentProps {
  handler: string;
}

export function CreatorPageContent({ handler }: CreatorPageContentProps) {
  const [activeTab, setActiveTab] = useState<TabType>('home');

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
    const basic = basicCreator;
    const profile = profileData;

    if (profile) {
      return profile;
    }
    return basic;
  }, [basicCreator, profileData]);

  const { data: videosData } = useVideos(
    creator
      ? {
        creators: String(creator.id),
        short: false,
        sort_by: 'latest',
        per_page: 1,
      }
      : undefined,
    {
      enabled: !!creator?.id,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );

  const featuredVideoThumbnail = videosData?.videos?.[0]?.thumbnail;

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
      {
        key: 'x',
        url: buildSocialUrl('x', creator.x),
        icon: <XIcon />,
        label: 'X',
      },
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
          style={{
            animation: 'spin 1s linear infinite',
          }}
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

      <CreatorTabs activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />

      {activeTab === 'home' && (
        <CreatorHomeTab creator={creator} onTabChange={setActiveTab} />
      )}

      {activeTab === 'videos' && <CreatorVideosTab creator={creator} />}

      {activeTab === 'shorts' && <CreatorShortsTab creator={creator} />}

      {activeTab === 'series' && <CreatorSeriesTab creator={creator} />}

      {activeTab === 'posts' && <CreatorPostsTab creator={creator} />}

      {activeTab === 'education' && <CreatorEducationTab creator={creator} />}
    </div>
  );
}
