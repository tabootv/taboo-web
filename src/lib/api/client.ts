import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { getRequiredEnv } from '@/shared/lib/config/env';
import { redirect } from '@/shared/lib/utils/redirect';
import { handleApiError } from '@/shared/lib/utils/error-handler';

const TOKEN_KEY = 'tabootv_token';

const getBaseURL = (): string => {
  if (typeof window !== 'undefined') {
    return '/api';
  }
  return getRequiredEnv('NEXT_PUBLIC_API_URL');
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

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    try {
      if (error.response?.status === 401) {
        removeToken();
        if (typeof window !== 'undefined') {
          redirect('/sign-in');
        }
      }

      if (error.response?.status === 403) {
        const data = error.response.data as { message?: string };
        if (data?.message?.includes('subscription')) {
          if (typeof window !== 'undefined') {
            redirect('/plans');
          }
        }
      }
    } catch (redirectError) {
      console.error('Error in response interceptor:', redirectError);
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
