/**
 * Studio Query Hooks
 *
 * TanStack Query hooks for studio-related data fetching
 */

import { shortsClient } from '@/api/client/shorts.client';
import { countryNameToCode, getFlagEmoji, TOTAL_COUNTRIES } from '@/shared/utils/iso-country';
import { useQuery } from '@tanstack/react-query';
import { creatorsClient } from '../client/creators.client';
import { studioClient } from '../client/studio.client';
import { queryKeys } from '../query-keys';
import type {
  Post,
  StudioPostListItem,
  StudioPostsListResponse,
  StudioVideoListItem,
  StudioVideosListResponse,
  StudioVideosQueryParams,
  Video,
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
 * Transform Video from external API to StudioVideoListItem format
 * Maps API fields to StudioVideoListItem with all new publication fields
 */
function transformVideoToStudioItem(
  video: Video & {
    published?: boolean;
    processing?: boolean;
    bunny_status?: 0 | 1 | 2 | 3;
    bunny_encode_progress?: number;
    bunny_available_resolutions?: string;
    publish_schedule?: { scheduled_at: string } | null;
    location?: string;
    country_id?: number;
    latitude?: number;
    longitude?: number;
  }
): StudioVideoListItem {
  const item: StudioVideoListItem = {
    id: video.id!,
    uuid: video.uuid,
    title: video.title,
    created_at: video.published_at || new Date().toISOString(),
    likes_count: video.likes_count,
    comments_count: video.comments_count,
  };

  // Only set optional properties if they have values (exactOptionalPropertyTypes)
  if (video.description) item.description = video.description;
  const thumbnail = video.thumbnail || video.card_thumbnail;
  if (thumbnail) item.thumbnail = thumbnail;
  if (video.views_count !== undefined) item.views_count = video.views_count;
  if (video.duration !== undefined) item.duration = video.duration;
  if (video.published_at) item.published_at = video.published_at;

  // Publication status - use 'published' field if available, fall back to published_at check
  if (video.published !== undefined) {
    item.published = video.published;
  } else {
    // Infer published status from published_at for backwards compatibility
    item.published = !!video.published_at;
  }

  // Processing fields
  if (video.processing !== undefined) item.processing = video.processing;
  if (video.bunny_status !== undefined) item.bunny_status = video.bunny_status;
  if (video.bunny_encode_progress !== undefined)
    item.bunny_encode_progress = video.bunny_encode_progress;
  if (video.bunny_available_resolutions)
    item.bunny_available_resolutions = video.bunny_available_resolutions;
  if (video.is_bunny_video !== undefined) item.is_bunny_video = video.is_bunny_video;

  // Schedule
  if (video.publish_schedule) item.publish_schedule = video.publish_schedule;

  // Location fields
  if (video.location) item.location = video.location;
  if (video.country_id !== undefined) item.country_id = video.country_id;
  if (video.latitude !== undefined) item.latitude = video.latitude;
  if (video.longitude !== undefined) item.longitude = video.longitude;

  // Country name from country object or string
  if (video.country) {
    if (typeof video.country === 'string') {
      item.country = video.country;
    } else if (video.country.name) {
      item.country = video.country.name;
    }
  }

  // Short flag
  if (video.short !== undefined) item.short = video.short;
  if (video.is_short !== undefined) item.short = video.is_short;

  // Tags
  if (video.tags && video.tags.length > 0) {
    item.tags = video.tags.map((t) => t.name);
  }

  // Legacy status field for compatibility
  item.status = video.published_at ? 'published' : 'draft';

  return item;
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
 * Hook to fetch creator's shorts using external REST API
 * @param creatorId - The user ID of the creator (user.id)
 * @param page - Page number for pagination
 * @param filters - Optional filter parameters (status, sortBy)
 */
export function useStudioShorts(
  creatorId: number | undefined,
  page = 1,
  filters: ContentFilters = {}
) {
  return useQuery({
    queryKey: queryKeys.studio.shorts(creatorId, page, filters),
    queryFn: async (): Promise<StudioVideosListResponse> => {
      const response = await shortsClient.list({
        creator_id: creatorId!,
        short: true,
        page,
        per_page: 20,
        sort_by: filters.sortBy || 'newest',
        types: 'shorts',
        // Map status to API params
        ...(filters.status === 'published' && { published: true }),
        ...(filters.status === 'draft' && { published: false }),
      });

      // Transform all videos - filtering is done client-side in page.tsx
      const videos = response.data.map(transformVideoToStudioItem);

      return {
        videos,
        pagination: {
          current_page: response.current_page,
          last_page: response.last_page,
          per_page: response.per_page,
          total: response.total,
        },
      };
    },
    enabled: !!creatorId,
    staleTime: 1000 * 60 * 10, // 10 minutes
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
