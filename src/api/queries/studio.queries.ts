/**
 * Studio Query Hooks
 *
 * TanStack Query hooks for studio-related data fetching
 */

import { countryNameToCode, getFlagEmoji, TOTAL_COUNTRIES } from '@/shared/utils/iso-country';
import { useQuery } from '@tanstack/react-query';
import { creatorsClient } from '../client/creators.client';
import { studioClient } from '../client/studio.client';
import { queryKeys } from '../query-keys';
import type {
  Post,
  StudioPostListItem,
  StudioPostsListResponse,
  StudioVideosQueryParams,
} from '../types';

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
 * Transform Post from external API to StudioPostListItem format
 */
function transformPostToStudioItem(post: Post): StudioPostListItem {
  const item: StudioPostListItem = {
    id: post.id,
    uuid: post.uuid,
    body: post.caption,
    created_at: post.created_at,
  };

  // Only set optional properties if they have values (exactOptionalPropertyTypes)
  if (post.published_at) item.published_at = post.published_at;
  if (post.likes_count !== undefined) item.likes_count = post.likes_count;
  if (post.comments_count !== undefined) item.comments_count = post.comments_count;

  return item;
}

export interface ContentFilters {
  status?: 'all' | 'processing' | 'published' | 'draft' | 'scheduled';
  sortBy?: 'newest' | 'oldest';
  [key: string]: unknown;
}

/**
 * Hook to fetch creator's videos using /api/studio/videos endpoint
 *
 * @param params - Query parameters for filtering and pagination
 * @param options - Additional query options
 */
export function useStudioVideos(
  params: StudioVideosQueryParams = {},
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.studio.videos(params),
    queryFn: () => studioClient.getVideos(params),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch creator's shorts using /api/studio/videos endpoint
 *
 * @param params - Query parameters for filtering and pagination
 * @param options - Additional query options
 */
export function useStudioShorts(
  params: StudioVideosQueryParams = {},
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.studio.shorts(params),
    queryFn: () => studioClient.getVideos(params),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

/**
 * Hook to fetch creator's posts using external REST API
 * @param channelId - The channel ID (user.channel.id)
 * @param page - Page number for pagination
 */
export function useStudioPosts(channelId: number | undefined, page = 1) {
  return useQuery({
    queryKey: queryKeys.studio.posts(channelId, page),
    queryFn: async (): Promise<StudioPostsListResponse> => {
      const response = await creatorsClient.getPosts(channelId!, {
        sort_by: 'latest',
      });

      return {
        posts: response.data.map(transformPostToStudioItem),
        pagination: {
          current_page: response.current_page,
          last_page: response.last_page,
          per_page: response.per_page,
          total: response.total,
        },
      };
    },
    enabled: !!channelId,
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
