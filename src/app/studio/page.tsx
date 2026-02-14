'use client';

import { useMapStats } from '@/api/queries/studio.queries';
import { useAuthStore } from '@/shared/stores/auth-store';
import { useEffect, useState } from 'react';
import { ContentMetricsGrid } from './_components/ContentMetricsGrid';
import { ContentPulseCard } from './_components/ContentPulseCard';
import { TopTagsCard } from './_components/TopTagsCard';
import { WelcomeHeader } from './_components/WelcomeHeader';
import { WorldTakeoverCard } from './_components/WorldTakeoverCard';

export default function StudioDashboard() {
  const { user } = useAuthStore();
  const channel = user?.channel;

  const [contentTotals, setContentTotals] = useState<{
    videos: number;
    shorts: number;
    posts: number;
    series: number;
    courses: number;
  } | null>(null);

  const {
    data: mapStats,
    isLoading: isLoadingMap,
    error: mapQueryError,
  } = useMapStats(channel?.id);

  const mapError = mapQueryError ? 'Could not load world stats right now.' : null;

  useEffect(() => {
    const channelId = channel?.id;
    if (!channelId) return;

    let cancelled = false;

    async function loadCounts() {
      try {
        const { creatorsClient } = await import('@/api/client/creators.client');
        const creator = await creatorsClient.getProfile(Number(channelId));
        if (!cancelled) {
          setContentTotals({
            videos: creator.videos_count || 0,
            shorts: creator.short_videos_count || creator.shorts_count || 0,
            posts: creator.posts_count || 0,
            series: creator.series_count || 0,
            courses: creator.course_count || 0,
          });
        }
      } catch (err) {
        console.error('Failed to load creator counts', err);
      }
    }

    loadCounts();
    return () => {
      cancelled = true;
    };
  }, [channel?.id]);

  if (!channel) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channelData = channel as Record<string, any>;
  const totals = {
    videos: contentTotals?.videos ?? channelData.videos_count ?? 0,
    shorts:
      contentTotals?.shorts ?? channelData.short_videos_count ?? channelData.shorts_count ?? 0,
    posts: contentTotals?.posts ?? channelData.posts_count ?? 0,
    series: contentTotals?.series ?? channelData.series_count ?? 0,
    courses: contentTotals?.courses ?? channelData.course_count ?? 0,
  };

  return (
    <div className="space-y-8">
      <WelcomeHeader channel={channel} />
      <ContentMetricsGrid totals={totals} />
      <ContentPulseCard />
      <WorldTakeoverCard mapStats={mapStats} isLoading={isLoadingMap} error={mapError} />
      <TopTagsCard mapStats={mapStats} isLoading={isLoadingMap} error={mapError} />
    </div>
  );
}
