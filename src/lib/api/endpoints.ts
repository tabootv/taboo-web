import apiClient, { setToken, removeToken } from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  AuthResponse,
  MeResponse,
  LoginCredentials,
  RegisterData,
  FirebaseLoginData,
  Video,
  ShortVideo,
  Series,
  SeriesCategory,
  Course,
  Post,
  Comment,
  PostComment,
  Creator,
  Plan,
  Subscription,
  SubscriptionInfo,
  Notification,
  ChatMessage,
  Playlist,
  Banner,
  SearchResults,
  ReportData,
  BlockData,
  Tag,
} from '@/types';

// ============================================
// Authentication
// ============================================

export const auth = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/login', credentials);
    // Token is at root level in the response
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/register', userData);
    // Token is at root level in the response
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  firebaseLogin: async (firebaseData: FirebaseLoginData): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/firebase-login', firebaseData);
    // Token is at root level in the response
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const { data } = await apiClient.post('/forget-password', { email });
    return data;
  },

  resetPassword: async (payload: {
    email: string;
    token: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ message: string }> => {
    const { data } = await apiClient.post('/reset-password', payload);
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/logout');
    removeToken();
  },

  me: async (): Promise<MeResponse> => {
    const { data } = await apiClient.get<MeResponse>('/me');
    return data;
  },

  registerDeviceToken: async (token: string, platform: 'ios' | 'android' | 'web'): Promise<void> => {
    await apiClient.post('/device-token', { token, platform });
  },
};

// ============================================
// Profile
// ============================================

export const profile = {
  get: async (): Promise<User> => {
    const { data } = await apiClient.get<ApiResponse<User>>('/profile');
    return data.data;
  },

  updateProfile: async (profileData: Partial<User>): Promise<User> => {
    const { data } = await apiClient.post<ApiResponse<User>>('/profile/update-profile', profileData);
    return data.data;
  },

  updateDisplayPicture: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('dp', file);
    const { data } = await apiClient.post<ApiResponse<User>>('/profile/update-dp', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  updateEmail: async (email: string, password: string): Promise<User> => {
    const { data } = await apiClient.post<ApiResponse<User>>('/profile/update-email', { email, password });
    return data.data;
  },

  updateContact: async (contactData: { phone?: string }): Promise<User> => {
    const { data } = await apiClient.post<ApiResponse<User>>('/profile/update-contact', contactData);
    return data.data;
  },

  updatePassword: async (passwords: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ message: string }> => {
    const { data } = await apiClient.post('/profile/update-password', passwords);
    return data;
  },

  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/profile/delete');
    removeToken();
  },
};

// ============================================
// Videos
// ============================================

export const videos = {
  list: async (params?: { page?: number; per_page?: number }): Promise<PaginatedResponse<Video>> => {
    // Use public endpoint for listing all platform videos
    const { data } = await apiClient.get('/public/videos', { params: { page: params?.page, limit: params?.per_page } });
    // API returns { videos: [...], pagination: {...} }
    // Transform videos to match expected format (public API has creator.channel, we need channel at root)
    const videos = (data.videos || []).map((video: Video & { creator?: { channel?: { id: number; name: string } } }) => ({
      ...video,
      channel: video.channel || video.creator?.channel,
    }));
    return {
      data: videos,
      current_page: data.pagination?.current_page || 1,
      last_page: data.pagination?.last_page || 1,
      per_page: data.pagination?.per_page || 20,
      total: data.pagination?.total || 0,
      first_page_url: '',
      from: null,
      last_page_url: '',
      links: [],
      next_page_url: null,
      path: '',
      prev_page_url: null,
      to: null,
    };
  },

  getAll: async (page = 1, perPage = 24): Promise<PaginatedResponse<Video>> => {
    // Use public endpoint for listing all platform videos
    // Matches Taboo BO behavior: short=false (only long-form videos), sorted by published_at DESC
    const { data } = await apiClient.get('/public/videos', {
      params: {
        page,
        limit: perPage,
        short: false, // CRITICAL: Only long-form videos, never shorts
        is_short: false,
        type: 'video',
        published: true,
        sort_by: 'published_at',
        order: 'desc',
      },
    });
    // API returns { videos: [...], pagination: {...} }
    // Transform videos to match expected format (public API has creator.channel, we need channel at root)
    const videos = (data.videos || []).map((video: Video & { creator?: { channel?: { id: number; name: string } } }) => ({
      ...video,
      channel: video.channel || video.creator?.channel,
    }));
    return {
      data: videos,
      current_page: data.pagination?.current_page || 1,
      last_page: data.pagination?.last_page || 1,
      per_page: data.pagination?.per_page || perPage,
      total: data.pagination?.total || 0,
      first_page_url: '',
      from: null,
      last_page_url: '',
      links: [],
      next_page_url: null,
      path: '',
      prev_page_url: null,
      to: null,
    };
  },

  getLongForm: async (page = 1, perPage = 24): Promise<PaginatedResponse<Video>> => {
    const response = await videos.getAll(page, perPage);
    // Defensive: drop any shorts if backend ignores flags
    const filtered = (response.data || []).filter((v: any) => {
      if (v?.short === true || v?.is_short === true || v?.type === 'short') {
        return false;
      }
      return true;
    });
    if (process.env.NODE_ENV === 'development' && filtered.length !== (response.data || []).length) {
      console.warn('Filtered out short content from /videos response');
    }
    return { ...response, data: filtered };
  },

  getRelatedLongForm: async (
    videoId: string | number,
    page = 1,
    perPage = 12
  ): Promise<PaginatedResponse<Video>> => {
    // Prefer dedicated related endpoint if available
    try {
      const { data } = await apiClient.get('/public/videos/related', {
        params: {
          video_id: videoId,
          page,
          limit: perPage,
          short: false,
          is_short: false,
          type: 'video',
          published: true,
          sort_by: 'published_at',
          order: 'desc',
        },
      });
      const list = data?.videos || data?.data || data || [];
      return {
        data: list.filter((v: any) => v?.id !== videoId && v?.short !== true && v?.is_short !== true && v?.type !== 'short'),
        current_page: data?.pagination?.current_page ?? page,
        last_page: data?.pagination?.last_page ?? page,
        per_page: perPage,
        total: data?.pagination?.total ?? list.length,
        first_page_url: '',
        from: null,
        last_page_url: '',
        links: [],
        next_page_url: null,
        path: '',
        prev_page_url: null,
        to: null,
      };
    } catch (error) {
      // Fallback: use long-form list and filter out current video
      const fallback = await videos.getLongForm(page, perPage + 4);
      fallback.data = (fallback.data || []).filter((v: any) => v?.id !== videoId);
      return fallback;
    }
  },

  getVideo: async (id: string | number): Promise<Video> => {
    const { data } = await apiClient.get(`/videos/${id}/play`);
    return data.video || data.data || data;
  },

  getTags: async (id: string | number): Promise<Tag[]> => {
    const { data } = await apiClient.get(`/videos/${id}/tags`);
    const tags = data?.tags || data?.data || data || [];
    return Array.isArray(tags) ? tags : [];
  },

  play: async (id: string | number): Promise<{ video: Video; videos: Video[] }> => {
    const { data } = await apiClient.get(`/videos/${id}/play`);
    return {
      video: data.video || data.data || data,
      videos: data.videos || [],
    };
  },

  getRelated: async (id: string | number): Promise<Video[]> => {
    const { data } = await apiClient.get(`/videos/${id}/play`);
    return data.videos || [];
  },

  getBookmarked: async (page = 1, perPage = 12): Promise<PaginatedResponse<Video>> => {
    const { data } = await apiClient.get('/profile/bookmarked-videos', { params: { page, per_page: perPage } });
    return data.videos || data;
  },

  getHistory: async (page = 1, perPage = 12): Promise<PaginatedResponse<Video>> => {
    const { data } = await apiClient.get('/profile/watch-history', { params: { page, per_page: perPage } });
    return data.videos || data;
  },

  getLiked: async (page = 1, perPage = 12): Promise<PaginatedResponse<Video>> => {
    const { data } = await apiClient.get('/profile/liked-videos', { params: { page, per_page: perPage } });
    return data.videos || data;
  },

  getComments: async (uuid: string, page = 1): Promise<PaginatedResponse<Comment>> => {
    const { data } = await apiClient.get(`/videos/${uuid}/comments-list`, { params: { page } });
    return data.comments || data;
  },

  addComment: async (uuid: string, content: string, parentId?: number): Promise<Comment> => {
    const { data } = await apiClient.post<ApiResponse<Comment>>(`/videos/${uuid}/comment`, {
      content,
      parent_id: parentId,
    });
    return data.data;
  },

  postComment: async (uuid: string, content: string, parentId?: number): Promise<Comment> => {
    const { data } = await apiClient.post<ApiResponse<Comment>>(`/videos/${uuid}/comment`, {
      content,
      parent_id: parentId,
    });
    return data.data;
  },

  toggleLike: async (uuid: string): Promise<{ has_liked: boolean; likes_count: number }> => {
    const { data } = await apiClient.post(`/videos/${uuid}/toggle-like`);
    return data;
  },

  toggleDislike: async (uuid: string): Promise<{ has_disliked: boolean; dislikes_count: number }> => {
    const { data } = await apiClient.post(`/videos/${uuid}/toggle-dislike`);
    return data;
  },

  toggleBookmark: async (uuid: string): Promise<{ is_bookmarked: boolean }> => {
    const { data } = await apiClient.post(`/videos/${uuid}/toggle-bookmark`);
    return data;
  },

  toggleAutoplay: async (): Promise<{ video_autoplay: boolean }> => {
    const { data } = await apiClient.post('/videos/toggle-autoplay');
    return data;
  },

  deleteComment: async (uuid: string): Promise<void> => {
    await apiClient.delete(`/videos/${uuid}/delete`);
  },
};

// ============================================
// Shorts (V1 & V2)
// ============================================

export const shorts = {
  // V1 - Legacy
  list: async (params?: { page?: number; per_page?: number }): Promise<PaginatedResponse<ShortVideo>> => {
    const { data } = await apiClient.get('/shorts', { params });
    return data.videos || data;
  },

  getAll: async (page = 1, perPage = 10): Promise<PaginatedResponse<Video>> => {
    const { data } = await apiClient.get('/v2/shorts', { params: { page, per_page: perPage } });
    return data.videos || data;
  },

  getShort: async (uuid: string): Promise<Video> => {
    const { data } = await apiClient.get<ApiResponse<Video>>(`/v2/shorts/${uuid}`);
    return data.data;
  },

  // V2 - Optimized
  listV2: async (params?: {
    page?: number;
    per_page?: number;
    creator?: number;
  }): Promise<PaginatedResponse<ShortVideo>> => {
    try {
      const { data } = await apiClient.get('/v2/shorts', { params });
      const shortsData = data.videos || data;
      // Handle paginated response
      if (shortsData.data) {
        return shortsData;
      }
      // Handle array response
      if (Array.isArray(shortsData)) {
        return {
          data: shortsData,
          current_page: params?.page || 1,
          last_page: 1,
          per_page: params?.per_page || 10,
          total: shortsData.length,
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
      return shortsData;
    } catch {
      // Fallback: Try home/short-videos endpoint
      try {
        const { data } = await apiClient.get('/v2/home/short-videos');
        const shortsData = data.videos || data.data || data;
        const shortsArray = Array.isArray(shortsData) ? shortsData : (shortsData?.data || []);
        return {
          data: shortsArray,
          current_page: 1,
          last_page: 1,
          per_page: shortsArray.length,
          total: shortsArray.length,
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
        // Return empty response instead of throwing
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
  },

  getV2: async (uuid: string): Promise<ShortVideo | null> => {
    try {
      const { data } = await apiClient.get<ApiResponse<ShortVideo>>(`/v2/shorts/${uuid}`);
      return data.data;
    } catch {
      return null;
    }
  },

  getCommentsV2: async (uuid: string, params?: { page?: number }): Promise<PaginatedResponse<Comment>> => {
    const { data } = await apiClient.get(`/v2/shorts/${uuid}/comments`, { params });
    return data.comments || data;
  },

  toggleLike: async (uuid: string): Promise<{ has_liked: boolean; likes_count: number }> => {
    const { data } = await apiClient.post(`/v2/shorts/${uuid}/toggle-like`);
    return data;
  },

  toggleBookmark: async (uuid: string): Promise<{ is_bookmarked: boolean }> => {
    const { data } = await apiClient.post(`/v2/shorts/${uuid}/toggle-bookmark`);
    return data;
  },
};

// ============================================
// Series
// ============================================

export const series = {
  list: async (params?: {
    page?: number;
    sort_by?: string;
    category_ids?: number[];
  }): Promise<{ series: Series[] }> => {
    // Use /home/series which loads media relation for thumbnails
    const { data } = await apiClient.get('/home/series', { params });
    // Handle both paginated and array responses
    const seriesData = data.series?.data || data.series || [];
    return { series: Array.isArray(seriesData) ? seriesData : [] };
  },

  getAll: async (page = 1, perPage = 12): Promise<PaginatedResponse<Series>> => {
    // Use /home/series which loads media relation for thumbnails
    const { data } = await apiClient.get('/home/series', { params: { page, per_page: perPage } });
    const seriesResponse = data.series;
    // Handle paginated response
    if (seriesResponse?.data) {
      return {
        data: seriesResponse.data,
        current_page: seriesResponse.current_page || page,
        last_page: seriesResponse.last_page || 1,
        per_page: seriesResponse.per_page || perPage,
        total: seriesResponse.total || 0,
        first_page_url: seriesResponse.first_page_url || '',
        from: seriesResponse.from || null,
        last_page_url: seriesResponse.last_page_url || '',
        links: seriesResponse.links || [],
        next_page_url: seriesResponse.next_page_url || null,
        path: seriesResponse.path || '',
        prev_page_url: seriesResponse.prev_page_url || null,
        to: seriesResponse.to || null,
      };
    }
    // Fallback for non-paginated response
    return {
      data: seriesResponse || [],
      current_page: 1,
      last_page: 1,
      per_page: perPage,
      total: seriesResponse?.length || 0,
      first_page_url: '',
      from: null,
      last_page_url: '',
      links: [],
      next_page_url: null,
      path: '',
      prev_page_url: null,
      to: null,
    };
  },

  getCategories: async (): Promise<SeriesCategory[]> => {
    // Categories come from Inertia props in Vue, we'll fetch them from the series list
    return [];
  },

  getSeriesDetail: async (uuid: string): Promise<Series | null> => {
    // Use /trailer endpoint which returns series with videos, channel, and categories
    try {
      const { data } = await apiClient.get(`/series/${uuid}/trailer`);
      return data.data?.series || data.series || data.data || data;
    } catch {
      return null;
    }
  },

  getSeriesVideos: async (uuid: string, page = 1): Promise<PaginatedResponse<Video>> => {
    // Videos are included in the series detail from /trailer endpoint
    // This is a fallback that tries to get videos from the series detail
    try {
      const { data } = await apiClient.get(`/series/${uuid}/trailer`);
      const series = data.data?.series || data.series || data.data || data;
      const videos = series?.videos || [];
      return {
        data: videos,
        current_page: page,
        last_page: 1,
        per_page: videos.length,
        total: videos.length,
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
  },

  getTrailer: async (id: number | string): Promise<{ url: string; series?: Series }> => {
    const { data } = await apiClient.get(`/series/${id}/trailer`);
    const series = data.data?.series || data.series || data.data || data;
    return {
      url: series?.trailer_url || series?.trailer || '',
      series,
    };
  },

  // Vue: route('series.video', uuid)
  playVideo: async (uuid: string): Promise<{ video: Video; videos: Video[]; series: Series }> => {
    const { data } = await apiClient.get(`/series/${uuid}/play`);
    return {
      video: data.video || data.data,
      videos: data.videos || [],
      series: data.series || {},
    };
  },
};

// ============================================
// Courses
// ============================================

export const courses = {
  list: async (params?: { page?: number }): Promise<PaginatedResponse<Course>> => {
    try {
      // Try dedicated courses endpoint first
      const { data } = await apiClient.get('/courses', { params });
      const coursesData = data.courses || data;
      // Handle paginated response
      if (coursesData.data) {
        return coursesData;
      }
      // Handle array response
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
      // Fallback: Try home/courses endpoint
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
        // Final fallback: Get series and filter by type='course' or module_type='course'
        try {
          const { data } = await apiClient.get('/home/series');
          const seriesData = data.series || data.data || data;
          const seriesArray = Array.isArray(seriesData) ? seriesData : (seriesData?.data || []);
          const coursesArray = seriesArray.filter((s: { type?: string; module_type?: string }) =>
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
          // All endpoints failed, return empty
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

  get: async (id: number): Promise<Course | null> => {
    try {
      const { data } = await apiClient.get<ApiResponse<Course>>(`/courses/${id}`);
      return data.data;
    } catch {
      return null;
    }
  },

  getCourseDetail: async (id: number): Promise<Course | null> => {
    try {
      const { data } = await apiClient.get(`/courses/${id}`);
      // API returns { series: { ...courseData, videos: [...] } }
      return data.series || data.data || data;
    } catch {
      return null;
    }
  },

  getCourseVideos: async (id: number): Promise<{ data: Video[] }> => {
    try {
      const { data } = await apiClient.get(`/courses/${id}`);
      // Videos are included in the course detail response
      const courseData = data.series || data.data || data;
      return { data: courseData?.videos || [] };
    } catch {
      return { data: [] };
    }
  },

  playVideo: async (uuid: string): Promise<Video> => {
    const { data } = await apiClient.get<ApiResponse<Video>>(`/courses/play/${uuid}`);
    return data.data;
  },

  getTrailer: async (seriesId: number): Promise<{ url: string }> => {
    const { data } = await apiClient.get(`/course/${seriesId}/trailer`);
    return data;
  },

  // Get course detail by ID (numeric or UUID)
  getCourseByUuid: async (id: string): Promise<Course | null> => {
    // Try /courses/{id} endpoint which returns { series: { ...course, videos: [...] } }
    try {
      const { data } = await apiClient.get(`/courses/${id}`);
      // API returns { series: { ...courseData, videos: [...] } }
      const courseData = data.series || data.data || data;
      if (courseData && (courseData.uuid || courseData.id)) {
        return courseData;
      }
    } catch {
      // Continue to fallback
    }

    // Fallback: try series trailer endpoint for UUID-based lookups
    try {
      const { data } = await apiClient.get(`/series/${id}/trailer`);
      const courseData = data.data?.series || data.series || data.data || data;
      if (courseData && (courseData.uuid || courseData.id)) {
        return courseData;
      }
    } catch {
      // Continue
    }

    return null;
  },
};

// ============================================
// Home Feed
// ============================================

export const home = {
  getBanners: async (): Promise<Banner[]> => {
    const { data } = await apiClient.get('/home/banners');
    const banners = data.banners || data.data || data;
    return Array.isArray(banners) ? banners : (banners?.data || []);
  },

  getFeaturedVideos: async (): Promise<Video[]> => {
    const { data } = await apiClient.get('/home/featured-videos');
    const videos = data.videos || data.data || data;
    return Array.isArray(videos) ? videos : (videos?.data || []);
  },

  getShortVideos: async (): Promise<Video[]> => {
    const { data } = await apiClient.get('/home/short-videos');
    const videos = data.videos || data.data || data;
    return Array.isArray(videos) ? videos : (videos?.data || []);
  },

  getShortVideosV2: async (): Promise<Video[]> => {
    const { data } = await apiClient.get('/v2/home/short-videos');
    // Handle various response formats (array, { videos: [] }, { data: [] }, { data: { data: [] } })
    const videos = data.videos || data.data || data;
    return Array.isArray(videos) ? videos : (videos?.data || []);
  },

  getRecommendedVideos: async (): Promise<Video[]> => {
    const { data } = await apiClient.get('/home/recommended-videos');
    const videos = data.videos || data.data || data;
    return Array.isArray(videos) ? videos : (videos?.data || []);
  },

  getSeries: async (): Promise<Series[]> => {
    const { data } = await apiClient.get('/home/series');
    const series = data.series || data.data || data;
    return Array.isArray(series) ? series : (series?.data || []);
  },

  getCourses: async (): Promise<Course[]> => {
    const { data } = await apiClient.get('/home/courses');
    const courses = data.courses || data.data || data;
    return Array.isArray(courses) ? courses : (courses?.data || []);
  },

  getCreators: async (): Promise<Creator[]> => {
    const { data } = await apiClient.get('/creators', { params: { per_page: 20 } });
    return data.creators?.data || data.data || [];
  },
};

// ============================================
// Community Posts
// ============================================

export const posts = {
  list: async (params?: { page?: number }): Promise<PaginatedResponse<Post>> => {
    const { data } = await apiClient.get('/posts', { params });
    return data.posts || data;
  },

  get: async (id: number): Promise<Post> => {
    const { data } = await apiClient.get(`/posts/${id}`);
    return data.post || data.data || data;
  },

  // Vue: route('posts.store') with FormData { caption, post_image }
  create: async (caption: string, image?: File): Promise<Post> => {
    const formData = new FormData();
    formData.append('caption', caption);
    if (image) {
      formData.append('post_image', image);
    }
    const { data } = await apiClient.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.post || data.data;
  },

  // Vue: route('posts.like', post.id)
  like: async (id: number): Promise<{ likes_count: number; dislikes_count: number }> => {
    const { data } = await apiClient.post(`/posts/${id}/like`);
    return data;
  },

  // Vue: route('posts.dislike', post.id)
  dislike: async (id: number): Promise<{ likes_count: number; dislikes_count: number }> => {
    const { data } = await apiClient.post(`/posts/${id}/dislike`);
    return data;
  },

  // Vue: route('posts.destroy', post.id)
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/posts/${id}`);
  },

  // Vue: route('postComments.list', post.id)
  getComments: async (id: number, params?: { page?: number }): Promise<PaginatedResponse<PostComment>> => {
    const { data } = await apiClient.get(`/post-comments/posts/${id}`, { params });
    return data.postComment || data.comments || data;
  },

  // Vue: route('postComments.store', post.id) with { content, parent_id? }
  postComment: async (postId: number, content: string, parentId?: number): Promise<PostComment> => {
    const { data } = await apiClient.post(`/post-comments/posts/${postId}`, {
      content,
      ...(parentId && { parent_id: parentId }),
    });
    return data.postComment || data.data;
  },

  // Vue: route('postComments.replies', comment.id)
  getCommentReplies: async (commentId: number): Promise<PaginatedResponse<PostComment>> => {
    const { data } = await apiClient.get(`/post-comments/${commentId}/replies`);
    return data.postComment || data;
  },

  // Vue: route('postComments.like', comment.id)
  likeComment: async (commentId: number): Promise<void> => {
    await apiClient.post(`/post-comments/${commentId}/like`);
  },

  // Vue: route('postComments.dislike', comment.id)
  dislikeComment: async (commentId: number): Promise<void> => {
    await apiClient.post(`/post-comments/${commentId}/dislike`);
  },
};

// ============================================
// Comments (Video)
// ============================================

export const comments = {
  toggleLike: async (uuid: string): Promise<{ has_liked: boolean; likes_count: number }> => {
    const { data } = await apiClient.post(`/comments/${uuid}/like-toggle`);
    return data;
  },

  toggleDislike: async (uuid: string): Promise<{ has_disliked: boolean; dislikes_count: number }> => {
    const { data } = await apiClient.post(`/comments/${uuid}/dislike-toggle`);
    return data;
  },
};

// ============================================
// Creators / Channels
// ============================================

export const creators = {
  /**
   * Get creators list (requires auth)
   */
  list: async (params?: { page?: number }): Promise<PaginatedResponse<Creator>> => {
    const { data } = await apiClient.get('/creators', { params });
    return data.creators || data;
  },

  /**
   * Get creators list from public endpoint (no auth required)
   * Used on public pages like choose-plan
   * Response: { success: true, data: { creators: [...], pagination: {...} } }
   */
  listPublic: async (params?: { page?: number; per_page?: number; id?: number; handler?: string }): Promise<{ data: Creator[]; creators?: Creator[] }> => {
    const { data } = await apiClient.get('/public/creators', { params });
    // Handle nested response: { success, data: { creators, pagination } }
    const creators = data.data?.creators || data.creators || data.data || [];
    return { data: creators, creators };
  },

  get: async (id: number): Promise<Creator> => {
    const { data } = await apiClient.get(`/creators/${id}`);
    return data.creator || data.data || data;
  },

  toggleFollow: async (id: number): Promise<{ is_following: boolean; followers_count: number }> => {
    const { data } = await apiClient.post(`/creators/${id}/follow-toggle`);
    return data;
  },

  getVideos: async (
    id: number,
    params?: { sort_by?: string; page_url?: string }
  ): Promise<PaginatedResponse<Video>> => {
    const url = params?.page_url || `/creators/creator-videos/${id}`;
    const queryParams = params?.sort_by ? { sort_by: params.sort_by } : undefined;
    const { data } = await apiClient.get(url, { params: queryParams });
    return data.videos || data;
  },

  getShorts: async (
    id: number,
    params?: { sort_by?: string; page_url?: string }
  ): Promise<PaginatedResponse<ShortVideo>> => {
    const url = params?.page_url || `/creators/creator-shorts/${id}`;
    const queryParams = params?.sort_by ? { sort_by: params.sort_by } : undefined;
    const { data } = await apiClient.get(url, { params: queryParams });
    return data.videos || data;
  },

  getSeries: async (
    id: number,
    params?: { sort_by?: string; page_url?: string }
  ): Promise<PaginatedResponse<Series>> => {
    const url = params?.page_url || `/creators/creator-series/${id}`;
    const queryParams = params?.sort_by ? { sort_by: params.sort_by } : undefined;
    const { data } = await apiClient.get(url, { params: queryParams });
    return data.series || data;
  },

  getPosts: async (
    id: number,
    params?: { sort_by?: string; page_url?: string }
  ): Promise<PaginatedResponse<Post>> => {
    const url = params?.page_url || `/creators/creator-posts/${id}`;
    const queryParams = params?.sort_by ? { sort_by: params.sort_by } : undefined;
    const { data } = await apiClient.get(url, { params: queryParams });
    return data.posts || data;
  },

  getCourses: async (
    id: number,
    params?: { sort_by?: string; page_url?: string }
  ): Promise<PaginatedResponse<Course>> => {
    const url = params?.page_url || `/creators/creator-course/${id}`;
    const queryParams = params?.sort_by ? { sort_by: params.sort_by } : undefined;
    const { data } = await apiClient.get(url, { params: queryParams });
    return data.courses || data;
  },
};

// ============================================
// Live Chat
// ============================================

export const liveChat = {
  getMessages: async (params?: { page?: number }): Promise<PaginatedResponse<ChatMessage>> => {
    const { data } = await apiClient.get('/live-chat/messages', { params });
    return data.messages || data;
  },

  sendMessage: async (content: string): Promise<ChatMessage> => {
    const { data } = await apiClient.post<ApiResponse<ChatMessage>>('/live-chat/messages', { content });
    return data.data;
  },

  getPlatformUsersCount: async (): Promise<{ count: number }> => {
    const { data } = await apiClient.get('/live-chat/platform-users-count');
    return data;
  },
};

// ============================================
// Notifications
// ============================================

export const notifications = {
  list: async (): Promise<Notification[]> => {
    const { data } = await apiClient.get('/notifications/list');
    return data.notifications || data.data;
  },

  readAll: async (): Promise<void> => {
    await apiClient.post('/notifications/read-all');
  },

  deleteAll: async (): Promise<void> => {
    await apiClient.delete('/notifications/delete-all');
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },

  getContactPreferences: async (): Promise<Record<string, boolean>> => {
    const { data } = await apiClient.get('/notifications/contacts');
    return data.contacts || data.data;
  },
};

// ============================================
// Subscriptions & Plans
// ============================================

export const subscriptions = {
  /**
   * Get all available plans with Whop checkout URLs
   * Used by /choose-plan and checkout pages
   */
  getPlans: async (): Promise<Plan[]> => {
    const { data } = await apiClient.get('/plans/list');
    return data.plans || data.data || [];
  },

  /**
   * Get plans filtered by country (for regional pricing)
   */
  getPlansByCountry: async (country?: string): Promise<Plan[]> => {
    const { data } = await apiClient.get('/plans/by-country', { params: { country } });
    return data.plans || data.data || [];
  },

  /**
   * Quick subscription status check
   * Used for UI gating decisions
   */
  getStatus: async (): Promise<{ is_subscribed: boolean }> => {
    const { data } = await apiClient.get('/subscription/status');
    return { is_subscribed: data.is_subscribed || data.subscribed || false };
  },

  /**
   * Get full subscription details including manage_url
   * Used on billing/subscription management pages
   */
  getSubscription: async (): Promise<Subscription | null> => {
    try {
      const { data } = await apiClient.get<ApiResponse<Subscription>>('/subscription');
      return data.data || data;
    } catch {
      return null;
    }
  },

  /**
   * Get subscription info with manage_url for billing page
   * Returns entitlement state + management link
   */
  getSubscriptionInfo: async (): Promise<SubscriptionInfo> => {
    try {
      const { data } = await apiClient.get('/subscription-info');
      return {
        is_subscribed: data.is_subscribed ?? false,
        provider: data.provider,
        plan: data.plan,
        status: data.status,
        current_period_end: data.current_period_end,
        manage_url: data.manage_url,
      };
    } catch {
      // Fallback: try to construct from /subscription endpoint
      try {
        const subscription = await subscriptions.getSubscription();
        if (subscription) {
          return {
            is_subscribed: subscription.status === 'active',
            provider: subscription.provider,
            plan: subscription.plan?.slug || subscription.plan?.name,
            status: subscription.status,
            current_period_end: subscription.current_period_end || subscription.expires_at,
            manage_url: subscription.payload?.manage_url,
          };
        }
      } catch {
        // Ignore
      }
      return { is_subscribed: false };
    }
  },

  /**
   * Create subscription via Apple In-App Purchase
   */
  createApple: async (receipt: string): Promise<Subscription> => {
    const { data } = await apiClient.post<ApiResponse<Subscription>>('/subscription/create', { receipt });
    return data.data;
  },

  /**
   * Create subscription via Google Play
   */
  createGooglePlay: async (purchaseToken: string, productId: string): Promise<Subscription> => {
    const { data } = await apiClient.post<ApiResponse<Subscription>>('/subscription/google-play/create', {
      purchase_token: purchaseToken,
      product_id: productId,
    });
    return data.data;
  },
};

// ============================================
// Search
// ============================================

export const search = {
  query: async (q: string, params?: { page?: number }): Promise<SearchResults> => {
    const { data } = await apiClient.get('/search', { params: { q, ...params } });
    // Backend returns { message, results: { videos, shorts, series, creators } }
    return data.results || data;
  },

  search: async (q: string): Promise<SearchResults> => {
    const { data } = await apiClient.get('/search', { params: { q } });
    // Backend returns { message, results: { videos, shorts, series, creators } }
    return data.results || data;
  },
};

// ============================================
// Playlists
// ============================================

export const playlists = {
  list: async (page = 1, perPage = 3): Promise<PaginatedResponse<Playlist>> => {
    const { data } = await apiClient.get('/playlists', { params: { page, per_page: perPage } });
    return data.data || data;
  },

  get: async (id: number, page = 1): Promise<Playlist & { videos: PaginatedResponse<Video> }> => {
    const { data } = await apiClient.get(`/playlists/${id}`, { params: { page } });
    return data.data || data;
  },
};

// ============================================
// Public Content
// ============================================

export const publicContent = {
  getVideos: async (params?: { page?: number }): Promise<PaginatedResponse<Video>> => {
    const { data } = await apiClient.get('/public/videos', { params });
    return data.videos || data;
  },

  getMapVideos: async (): Promise<Video[]> => {
    const { data } = await apiClient.get('/public/map-videos');
    return data.videos || data.data;
  },
};

// ============================================
// Reports & Blocking
// ============================================

export const moderation = {
  report: async (reportData: ReportData): Promise<{ message: string }> => {
    const { data } = await apiClient.post('/report', reportData);
    return data;
  },

  blockContent: async (blockData: BlockData): Promise<{ message: string }> => {
    const { data } = await apiClient.post('/block', blockData);
    return data;
  },

  blockUser: async (uuid: string): Promise<{ message: string }> => {
    const { data } = await apiClient.post(`/block/users/${uuid}`);
    return data;
  },
};

// ============================================
// Places (Google Maps Proxy)
// ============================================

export const places = {
  autocomplete: async (input: string): Promise<{ predictions: Array<{ place_id: string; description: string }> }> => {
    const { data } = await apiClient.get('/places/autocomplete', { params: { input } });
    return data;
  },

  getDetails: async (placeId: string): Promise<Record<string, unknown>> => {
    const { data } = await apiClient.get('/places/details', { params: { place_id: placeId } });
    return data;
  },
};

// ============================================
// Creator Studio
// ============================================

export interface PromoterStats {
  id: number;
  email: string;
  name: string;
  state: string;
  stats: {
    clicks_count: number;
    referrals_count: number;
    sales_count: number;
    customers_count: number;
    revenue_amount: number;
    active_customers_count: number;
  };
  balance: {
    current_balance: number;
    paid_balance: number;
  };
  profile: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  joined_at: string;
  last_login_at: string | null;
}

export interface ReportDataPoint {
  date: string;
  clicks_count: number;
  referrals_count: number;
  sales_count: number;
  customers_count: number;
  revenue_amount: number;
  promoter_earnings_amount: number;
}

export interface PromoterReportResponse {
  promoter_id: number;
  period: {
    start_date: string;
    end_date: string;
    group_by: string;
  };
  totals: {
    clicks_count: number;
    referrals_count: number;
    sales_count: number;
    customers_count: number;
    revenue_amount: number;
    promoter_earnings_amount: number;
  };
  data: ReportDataPoint[];
}

export const creator = {
  /**
   * Get FirstPromoter iframe login token for earnings dashboard
   * Backend mints a token using the creator's firstpromoter_promoter_id
   */
  getFirstPromoterToken: async (): Promise<{ access_token: string }> => {
    const { data } = await apiClient.post('/creator/firstpromoter/iframe-token');
    return data;
  },

  /**
   * Get promoter stats (clicks, referrals, sales, balance, etc.)
   */
  getPromoterStats: async (): Promise<PromoterStats> => {
    const { data } = await apiClient.get('/creator/firstpromoter/stats');
    return data;
  },

  /**
   * Get promoter reports with time-series data
   */
  getPromoterReports: async (params?: {
    start_date?: string;
    end_date?: string;
    group_by?: 'day' | 'week' | 'month';
  }): Promise<PromoterReportResponse> => {
    const { data } = await apiClient.get('/creator/firstpromoter/reports', { params });
    return data;
  },
};

// ============================================
// Clips
// ============================================

export const clips = {
  getMyClips: async (): Promise<Video[]> => {
    const { data } = await apiClient.get('/clips/my-clips');
    return data.clips || data.data;
  },

  getClippingVideo: async (id: number): Promise<Video> => {
    const { data } = await apiClient.get<ApiResponse<Video>>(`/clipping/videos/${id}`);
    return data.data;
  },

  saveClip: async (clipData: {
    video_id: number;
    start_time: number;
    end_time: number;
    title?: string;
  }): Promise<Video> => {
    const { data } = await apiClient.post<ApiResponse<Video>>('/clipping/clips', clipData);
    return data.data;
  },
};
