/**
 * Home Feed Query Hooks
 *
 * TanStack Query hooks for home page data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { homeClient } from '../client/home.client';
import { queryKeys } from '../query-keys';

/**
 * Hook to fetch home banners
 * Stale time: 10 minutes
 */
export function useBanners() {
  return useQuery({
    queryKey: queryKeys.home.banners(),
    queryFn: () => homeClient.getBanners(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch featured videos
 * Stale time: 10 minutes
 */
export function useFeaturedVideos() {
  return useQuery({
    queryKey: queryKeys.home.featured(),
    queryFn: () => homeClient.getFeaturedVideos(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch recommended videos
 * Stale time: 10 minutes
 */
export function useRecommendedVideos() {
  return useQuery({
    queryKey: queryKeys.home.recommended(),
    queryFn: () => homeClient.getRecommendedVideos(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch short videos
 * Stale time: 10 minutes
 */
export function useShortVideos() {
  return useQuery({
    queryKey: queryKeys.home.shorts(),
    queryFn: () => homeClient.getShortVideosV2(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch series
 * Stale time: 10 minutes
 */
export function useSeries() {
  return useQuery({
    queryKey: queryKeys.home.series(),
    queryFn: () => homeClient.getSeries(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch courses
 * Stale time: 10 minutes
 */
export function useCourses() {
  return useQuery({
    queryKey: queryKeys.home.courses(),
    queryFn: () => homeClient.getCourses(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch creators
 * Stale time: 10 minutes
 */
export function useCreators() {
  return useQuery({
    queryKey: queryKeys.home.creators(),
    queryFn: () => homeClient.getCreators(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
