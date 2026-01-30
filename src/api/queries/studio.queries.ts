/**
 * Studio Query Hooks
 *
 * TanStack Query hooks for studio-related data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { studioClient } from '../client/studio.client';
import { queryKeys } from '../query-keys';
import { countryNameToCode, getFlagEmoji, TOTAL_COUNTRIES } from '@/shared/utils/iso-country';

type MapVideo = {
  id?: string | number;
  uuid?: string;
  country?: string;
  tags?: string[];
};

type AggregatedStats = {
  countriesRecorded: number;
  coveragePercent: number;
  topCountries: { name: string; count: number; flag: string }[];
  topTags: { name: string; count: number }[];
};

/**
 * Hook to fetch studio dashboard
 */
export function useStudioDashboard() {
  return useQuery({
    queryKey: queryKeys.studio.dashboard(),
    queryFn: () => studioClient.getDashboard(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch creator's videos
 */
export function useStudioVideos(page = 1) {
  return useQuery({
    queryKey: queryKeys.studio.videos(page),
    queryFn: () => studioClient.getVideos(page),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch creator's shorts
 */
export function useStudioShorts(page = 1) {
  return useQuery({
    queryKey: queryKeys.studio.shorts(page),
    queryFn: () => studioClient.getShorts(page),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

async function fetchMapVideos(creatorId: string | number): Promise<MapVideo[]> {
  const videos: MapVideo[] = [];
  let page = 1;
  let lastPage = 1;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://app.taboo.tv/api';

  while (page <= lastPage && page <= 5) {
    const url = new URL(`${apiUrl}/public/map-videos`);
    url.searchParams.set('page', String(page));
    url.searchParams.set('per_page', '50');
    url.searchParams.set('creators', String(creatorId));

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch map videos');

    const data = await res.json();
    const pageVideos = (data?.videos || []).map((v: Record<string, unknown>) => ({
      id: v.id,
      uuid: v.uuid,
      country: (v.country || v.country_name || 'Unknown') as string,
      tags: Array.isArray(v.tags) ? v.tags : [],
    }));
    videos.push(...pageVideos);

    lastPage = data?.pagination?.last_page || page;
    page += 1;
  }

  return videos;
}

function computeStats(videos: MapVideo[]): AggregatedStats {
  const byCountry: Record<string, number> = {};
  const byTag: Record<string, number> = {};

  videos.forEach((v) => {
    const country = v.country || 'Unknown';
    byCountry[country] = (byCountry[country] || 0) + 1;

    (v.tags || []).forEach((t) => {
      const tagName = typeof t === 'string' ? t : (t as { name?: string }).name || '';
      if (tagName) byTag[tagName] = (byTag[tagName] || 0) + 1;
    });
  });

  const topCountries = Object.entries(byCountry)
    .filter(([name]) => name !== 'Unknown')
    .map(([name, count]) => {
      const code = countryNameToCode(name);
      return {
        name,
        count,
        flag: code ? getFlagEmoji(code) : '🌐',
      };
    })
    .sort((a, b) => b.count - a.count);

  const topTags = Object.entries(byTag)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return {
    countriesRecorded: topCountries.length,
    coveragePercent: (topCountries.length / TOTAL_COUNTRIES) * 100,
    topCountries,
    topTags,
  };
}

/**
 * Hook to fetch map stats for a creator
 */
export function useMapStats(creatorId: string | number | null | undefined) {
  return useQuery({
    queryKey: queryKeys.studio.mapStats(String(creatorId || '')),
    queryFn: async () => {
      const videos = await fetchMapVideos(creatorId!);
      return computeStats(videos);
    },
    enabled: !!creatorId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
}

export type { AggregatedStats };
