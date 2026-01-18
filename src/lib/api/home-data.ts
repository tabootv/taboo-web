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

import { homeClient, playlistsClient } from '@/api/client';
import type { Banner, Creator, Video, Series, Playlist } from '@/types';

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
 *
 * @param options.cursor - Page cursor for playlists (null for initial load)
 * @param options.includeStatic - Whether to fetch static sections (true for initial load)
 * @returns Home page data with static sections, playlists, and next cursor
 */
export async function fetchHomeData(options: FetchHomeOptions = {}): Promise<HomePageData> {
  const { cursor = null, includeStatic = cursor === null } = options;
  const playlistPage = cursor ?? 1;

  // Results container
  const result: HomePageData = {
    static: null,
    playlists: [],
    nextCursor: null,
    isLastPage: false,
  };

  // Fetch static data on initial load
  if (includeStatic) {
    const [banners, creators, featured, shorts, recommended, series] = await Promise.allSettled([
      homeClient.getBanners(),
      homeClient.getCreators(),
      homeClient.getFeaturedVideos(),
      homeClient.getShortVideos(),
      homeClient.getRecommendedVideos(),
      homeClient.getSeries(),
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

  // Fetch playlists with pagination
  try {
    const playlistResponse = await playlistsClient.list({ page: playlistPage, per_page: 3 });
    result.playlists = playlistResponse.data || [];

    // Determine next cursor
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
    // Degrade gracefully by returning no playlists
    console.error('Error fetching playlists:', error);
    result.playlists = [];
    result.isLastPage = true;
  }

  return result;
}

/**
 * Fetch a single playlist's videos with pagination.
 * Used for loading more videos within a playlist rail.
 */
export async function fetchPlaylistVideos(
  playlistId: number,
  page: number = 1
): Promise<{
  videos: Video[];
  currentPage: number;
  lastPage: number;
  hasMore: boolean;
}> {
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
