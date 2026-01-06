/**
 * Courses API Client
 *
 * API Endpoints:
 * - GET /courses → CourseListResponse
 * - GET /courses/{id} → Course
 * - GET /courses/play/{uuid} → Video
 * - GET /course/{id}/trailer → { url: string }
 */

import type { ApiResponse, Course, PaginatedResponse, Video } from '../types';
import { apiClient } from './base-client';

export interface CourseListFilters extends Record<string, unknown> {
  page?: number;
  per_page?: number;
  sort_by?: string;
}

export interface CourseListResponse extends PaginatedResponse<Course> {}

export const coursesClient = {
  /**
   * Get list of courses
   */
  list: async (filters?: CourseListFilters): Promise<CourseListResponse> => {
    try {
      const data = await apiClient.get<
        { courses?: Course[]; data?: CourseListResponse } | CourseListResponse | Course[]
      >('/courses', {
        params: filters as Record<string, unknown>,
      });

      let coursesData: unknown = data;
      if (typeof data === 'object' && data !== null && 'courses' in data) {
        const obj = data as { courses?: Course[]; data?: CourseListResponse };
        coursesData = obj.courses || obj.data || data;
      }

      if (
        coursesData &&
        typeof coursesData === 'object' &&
        'data' in coursesData &&
        'current_page' in coursesData
      ) {
        return coursesData as CourseListResponse;
      }

      if (Array.isArray(coursesData)) {
        return {
          data: coursesData,
          current_page: 1,
          last_page: 1,
          per_page: coursesData.length,
          total: coursesData.length,
          first_page_url: '',
          from: null,
          last_page_url: '',
          links: [],
          next_page_url: null,
          path: '',
          prev_page_url: null,
          to: null,
        };
      }

      return coursesData as unknown as CourseListResponse;
    } catch {
      try {
        const data = await apiClient.get<
          { courses?: Course[]; data?: CourseListResponse } | CourseListResponse | Course[]
        >('/home/courses');

        let coursesData: unknown = data;
        if (typeof data === 'object' && data !== null && 'courses' in data) {
          const obj = data as { courses?: Course[]; data?: CourseListResponse };
          coursesData = obj.courses || obj.data || data;
        }

        let coursesArray: Course[];
        if (Array.isArray(coursesData)) {
          coursesArray = coursesData;
        } else if (coursesData && typeof coursesData === 'object' && 'data' in coursesData) {
          coursesArray = (coursesData as CourseListResponse).data;
        } else {
          coursesArray = [];
        }
        return {
          data: coursesArray,
          current_page: 1,
          last_page: 1,
          per_page: coursesArray.length,
          total: coursesArray.length,
          first_page_url: '',
          from: null,
          last_page_url: '',
          links: [],
          next_page_url: null,
          path: '',
          prev_page_url: null,
          to: null,
        };
      } catch {
        try {
          const data = await apiClient.get<
            { series?: Course[]; data?: CourseListResponse } | CourseListResponse | Course[]
          >('/home/series');

          let seriesData: unknown = data;
          if (typeof data === 'object' && data !== null && 'series' in data) {
            const obj = data as { series?: Course[]; data?: CourseListResponse };
            seriesData = obj.series || obj.data || data;
          }

          let seriesArray: Course[];
          if (Array.isArray(seriesData)) {
            seriesArray = seriesData;
          } else if (seriesData && typeof seriesData === 'object' && 'data' in seriesData) {
            seriesArray = (seriesData as CourseListResponse).data;
          } else {
            seriesArray = [];
          }
          const coursesArray = seriesArray.filter(
            (s: { type?: string; module_type?: string }) =>
              s.type === 'course' || s.module_type === 'course'
          );
          return {
            data: coursesArray,
            current_page: 1,
            last_page: 1,
            per_page: coursesArray.length,
            total: coursesArray.length,
            first_page_url: '',
            from: null,
            last_page_url: '',
            links: [],
            next_page_url: null,
            path: '',
            prev_page_url: null,
            to: null,
          };
        } catch {
          return {
            data: [],
            current_page: 1,
            last_page: 1,
            per_page: 0,
            total: 0,
            first_page_url: '',
            from: null,
            last_page_url: '',
            links: [],
            next_page_url: null,
            path: '',
            prev_page_url: null,
            to: null,
          };
        }
      }
    }
  },

  /**
   * Get course detail by ID
   */
  getDetail: async (id: string | number): Promise<Course | null> => {
    try {
      const data = await apiClient.get<
        ApiResponse<Course> | { series?: Course; data?: Course } | Course
      >(`/courses/${id}`);
      if (data && typeof data === 'object') {
        if ('series' in data && data.series) return data.series;
        if ('data' in data && data.data) return data.data;
        if ('type' in data) return data as Course;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Get course videos
   */
  getVideos: async (id: string | number): Promise<Video[]> => {
    try {
      const data = await apiClient.get<
        { series?: { videos?: Video[] }; data?: { videos?: Video[] } } | { videos?: Video[] }
      >(`/courses/${id}`);
      if (data && typeof data === 'object') {
        if (
          'series' in data &&
          data.series &&
          typeof data.series === 'object' &&
          'videos' in data.series
        ) {
          return (data.series as { videos?: Video[] }).videos || [];
        }
        if ('data' in data && data.data && typeof data.data === 'object' && 'videos' in data.data) {
          return (data.data as { videos?: Video[] }).videos || [];
        }
        if ('videos' in data && Array.isArray(data.videos)) {
          return data.videos;
        }
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Play course video by UUID
   */
  playVideo: async (uuid: string): Promise<Video> => {
    try {
      const data = await apiClient.get<
        ApiResponse<Video> | { video?: Video; message?: string } | Video
      >(`/courses/play/${uuid}`);

      if (!data || typeof data !== 'object') {
        throw new Error(`Invalid response format for video with UUID ${uuid}`);
      }

      if (
        'video' in data &&
        data.video &&
        typeof data.video === 'object' &&
        !Array.isArray(data.video)
      ) {
        return data.video as Video;
      }

      if ('data' in data && data.data) {
        return data.data;
      }

      if ('uuid' in data || 'title' in data || 'url' in data || 'id' in data) {
        return data as Video;
      }

      throw new Error(`Video with UUID ${uuid} not found or invalid format`);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to fetch video with UUID ${uuid}: ${String(error)}`);
    }
  },

  /**
   * Get course trailer
   */
  getTrailer: async (id: string | number): Promise<{ url: string }> => {
    const data = await apiClient.get<{ url: string }>(`/course/${id}/trailer`);
    return data;
  },
};
