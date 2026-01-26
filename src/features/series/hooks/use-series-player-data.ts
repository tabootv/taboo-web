'use client';
import { useMe } from '@/api/queries/auth.queries';
import { useSeriesDetail, useSeriesPlay } from '@/api/queries/series.queries';

export function useSeriesPlayerData(seriesId: string, videoUuid: string) {
  const { data: playData, isLoading: isLoadingPlay } = useSeriesPlay(videoUuid);
  const { data: seriesData, isLoading: isLoadingSeries } = useSeriesDetail(seriesId);
  const { data: meData } = useMe();

  const isLoading = isLoadingPlay || isLoadingSeries;
  const currentVideo = playData?.video || null;
  const episodes = seriesData?.videos || [];
  const autoplayEnabled = meData?.user?.video_autoplay || false;
  const isCourse = seriesData?.type === 'course' || seriesData?.module_type === 'course';

  const currentEpisodeIndex = episodes.findIndex((v) => v.uuid === currentVideo?.uuid);
  const nextEpisode =
    currentEpisodeIndex >= 0 && currentEpisodeIndex < episodes.length - 1
      ? episodes[currentEpisodeIndex + 1]
      : null;

  return {
    isLoading,
    currentVideo,
    episodes,
    autoplayEnabled,
    isCourse,
    currentEpisodeIndex,
    nextEpisode,
    seriesData,
  };
}
