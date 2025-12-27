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

export interface CourseListFilters {
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
      const { data } = await apiClient.get('/courses', { params: filters });
      const coursesData = data.courses || data;
      
      if (coursesData.data) {
        return coursesData;
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
      
      return coursesData;
    } catch {
      try {
        const { data } = await apiClient.get('/home/courses');
        const coursesData = data.courses || data.data || data;
        const coursesArray = Array.isArray(coursesData) ? coursesData : (coursesData?.data || []);
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
          const { data } = await apiClient.get('/home/series');
          const seriesData = data.series || data.data || data;
          const seriesArray = Array.isArray(seriesData) ? seriesData : (seriesData?.data || []);
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
      const { data } = await apiClient.get<ApiResponse<Course>>(`/courses/${id}`);
      const courseData = data.series || data.data || data;
      return courseData || null;
    } catch {
      return null;
    }
  },

  /**
   * Get course videos
   */
  getVideos: async (id: string | number): Promise<Video[]> => {
    try {
      const { data } = await apiClient.get(`/courses/${id}`);
      const courseData = data.series || data.data || data;
      return courseData?.videos || [];
    } catch {
      return [];
    }
  },

  /**
   * Play course video by UUID
   */
  playVideo: async (uuid: string): Promise<Video> => {
    const { data } = await apiClient.get<ApiResponse<Video>>(`/courses/play/${uuid}`);
    return data.data;
  },

  /**
   * Get course trailer
   */
  getTrailer: async (id: string | number): Promise<{ url: string }> => {
    const { data } = await apiClient.get(`/course/${id}/trailer`);
    return data;
  },
};

