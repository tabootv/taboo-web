/**
 * Home Data Layer
 *
 * Coordinates fetching of home page data with proper cursor-based pagination.
 *
 * The home page has two types of content:
 * 1. Static sections (banners, creators, featured, shorts, recommended, series) - fetched once
 * 2. Paginated sections (playlists) - loaded incrementally with cursor
 *
 * Since the backend doesn't provide a unified home endpoint with cursor pagination,
 * this layer coordinates the existing endpoints and provides a cursor-based interface.
 */

import { cache } from 'react';
import { homeClient } from '@/api/client/home.client';
import { playlistsClient } from '@/api/client/playlists.client';
import { TOKEN_KEY, decodeCookieToken } from '@/shared/lib/auth/cookie-config';
import type { Banner, Creator, Playlist, Series, Video } from '@/types';
import { cookies } from 'next/headers';

// ============================================
// Types
// ============================================

export interface HomeStaticData {
  banners: Banner[];
  creators: Creator[];
  featured: Video[];
  shorts: Video[];
  recommended: Video[];
  series: Series[];
}

export interface HomePageData {
  static: HomeStaticData | null;
  playlists: Playlist[];
  nextCursor: number | null;
  isLastPage: boolean;
}

export interface FetchHomeOptions {
  cursor?: number | null;
  includeStatic?: boolean;
}

// ============================================
// Home Data Fetcher
// ============================================

/**
 * Fetch home page data with cursor-based pagination.
 * Wrapped with React.cache() for per-request deduplication (server-cache-react rule).
 *
 * @param options.cursor - Page cursor for playlists (null for initial load)
 * @param options.includeStatic - Whether to fetch static sections (true for initial load)
 * @returns Home page data with static sections, playlists, and next cursor
 */
export const fetchHomeData = cache(
  async (options: FetchHomeOptions = {}): Promise<HomePageData> => {
    const cookieStore = await cookies();
    const serverToken = decodeCookieToken(cookieStore.get(TOKEN_KEY)?.value);

    const { cursor = null, includeStatic = cursor === null } = options;
    const playlistPage = cursor ?? 1;

    const result: HomePageData = {
      static: null,
      playlists: [],
      nextCursor: null,
      isLastPage: false,
    };

    if (includeStatic) {
      const [banners, creators, featured, shorts, recommended, series] = await Promise.allSettled([
        homeClient.getBanners(serverToken),
        homeClient.getCreators(serverToken),
        homeClient.getFeaturedVideos(serverToken),
        homeClient.getShortVideos(serverToken),
        homeClient.getRecommendedVideos(serverToken),
        homeClient.getSeries(serverToken),
      ]);

      result.static = {
        banners: banners.status === 'fulfilled' ? banners.value : [],
        creators: creators.status === 'fulfilled' ? creators.value : [],
        featured: featured.status === 'fulfilled' ? featured.value : [],
        shorts: shorts.status === 'fulfilled' ? shorts.value : [],
        recommended: recommended.status === 'fulfilled' ? recommended.value : [],
        series: series.status === 'fulfilled' ? series.value : [],
      };
    }

    try {
      const playlistResponse = await playlistsClient.list(
        { page: playlistPage, per_page: 3 },
        serverToken
      );
      result.playlists = playlistResponse.data || [];

      const currentPage = playlistResponse.current_page ?? playlistPage;
      const lastPage = playlistResponse.last_page ?? 1;

      if (currentPage < lastPage) {
        result.nextCursor = currentPage + 1;
        result.isLastPage = false;
      } else {
        result.nextCursor = null;
        result.isLastPage = true;
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
      result.playlists = [];
      result.isLastPage = true;
    }

    return result;
  }
);

/**
 * Fetch a single playlist's videos with pagination.
 * Used for loading more videos within a playlist rail.
 * Wrapped with React.cache() for per-request deduplication (server-cache-react rule).
 */
export const fetchPlaylistVideos = cache(
  async (
    playlistId: number,
    page: number = 1
  ): Promise<{
    videos: Video[];
    currentPage: number;
    lastPage: number;
    hasMore: boolean;
  }> => {
    try {
      const response = await playlistsClient.get(playlistId, page);
      const videos = response.videos?.data || [];
      const currentPage = response.videos?.current_page || page;
      const lastPage = response.videos?.last_page || 1;

      return {
        videos,
        currentPage,
        lastPage,
        hasMore: currentPage < lastPage,
      };
    } catch (error) {
      console.error(`Error fetching playlist ${playlistId} videos:`, error);
      return {
        videos: [],
        currentPage: page,
        lastPage: page,
        hasMore: false,
      };
    }
  }
);
