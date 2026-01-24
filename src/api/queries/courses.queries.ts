/**
 * Courses Query Hooks
 *
 * TanStack Query hooks for course-related data fetching
 */

import { useQuery } from '@tanstack/react-query';
import type { CourseListFilters } from '../client/courses.client';
import { coursesClient } from '../client/courses.client';
import { queryKeys } from '../query-keys';

/**
 * Hook to fetch list of courses
 */
export function useCoursesList(filters?: CourseListFilters) {
  return useQuery({
    queryKey: queryKeys.courses.list(filters),
    queryFn: () => coursesClient.list(filters),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch course detail
 * Stale time: 30 minutes (course metadata rarely changes)
 */
export function useCourseDetail(id: string | number | null | undefined) {
  return useQuery({
    queryKey: queryKeys.courses.detail(id!),
    queryFn: () => coursesClient.getDetail(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to fetch course videos
 */
export function useCourseVideos(id: string | number | null | undefined) {
  return useQuery({
    queryKey: queryKeys.courses.videos(id!),
    queryFn: () => coursesClient.getVideos(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch course trailer
 */
export function useCourseTrailer(id: string | number | null | undefined) {
  return useQuery({
    queryKey: queryKeys.courses.trailer(id!),
    queryFn: () => coursesClient.getTrailer(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch course play data (video by UUID)
 */
export function useCoursePlay(uuid: string | null | undefined) {
  return useQuery({
    queryKey: [...queryKeys.courses.detail(uuid!), 'play'],
    queryFn: () => coursesClient.playVideo(uuid!),
    enabled: !!uuid,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

