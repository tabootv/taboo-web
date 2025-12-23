import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

// Token storage key - API: app.taboo.tv
const TOKEN_KEY = 'tabootv_token';

// Create axios instance
// Use /api proxy in browser to avoid CORS, direct URL on server
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Browser: use local proxy to avoid CORS
    return '/api';
  }
  // Server: use direct API URL
  return process.env.NEXT_PUBLIC_API_URL || 'https://app.taboo.tv/api';
};

const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      removeToken();
      // Redirect to login if in browser
      if (typeof window !== 'undefined') {
        window.location.href = '/sign-in';
      }
    }

    // Handle 403 Forbidden (subscription required)
    if (error.response?.status === 403) {
      const data = error.response.data as { message?: string };
      if (data?.message?.includes('subscription')) {
        if (typeof window !== 'undefined') {
          window.location.href = '/plans';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Token management functions
export function getToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return Cookies.get(TOKEN_KEY);
}

export function setToken(token: string): void {
  Cookies.set(TOKEN_KEY, token, {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

export function removeToken(): void {
  Cookies.remove(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export default apiClient;
