/**
 * Base API Client
 *
 * Type-safe HTTP client wrapper around axios.
 * Provides consistent error handling and request/response interceptors.
 */

import { getRequiredEnv } from '@/shared/lib/config/env';
import { redirect } from '@/shared/utils/redirect';
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import Cookies from 'js-cookie';

const TOKEN_KEY = 'tabootv_token';

const getBaseURL = (): string => {
  if (globalThis.window !== undefined) {
    return '/api';
  }
  return getRequiredEnv('NEXT_PUBLIC_API_URL');
};

export interface RequestConfig extends AxiosRequestConfig {
  params?: Record<string, unknown> | undefined;
  serverToken?: string;
}

class ApiClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: getBaseURL(),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const serverToken = (config as RequestConfig).serverToken;
        const token = serverToken || this.getToken();

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        try {
          if (error.response?.status === 401) {
            this.removeToken();
            if (globalThis.window !== undefined) {
              redirect('/sign-in');
            }
          }

          if (error.response?.status === 403) {
            const data = error.response.data as { message?: string };
            if (data?.message?.includes('subscription')) {
              if (globalThis.window !== undefined) {
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
  }

  getToken(serverToken?: string): string | undefined {
    if (serverToken) return serverToken;
    if (globalThis.window === undefined) return undefined;
    return Cookies.get(TOKEN_KEY);
  }

  setToken(token: string): void {
    Cookies.set(TOKEN_KEY, token, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  removeToken(): void {
    Cookies.remove(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const { data } = await this.client.get<T>(endpoint, config);
    return data;
  }

  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.client.post<T>(endpoint, data, config);
    return response.data;
  }

  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.client.put<T>(endpoint, data, config);
    return response.data;
  }

  async patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.client.patch<T>(endpoint, data, config);
    return response.data;
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const response = await this.client.delete<T>(endpoint, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();

export const getToken = () => apiClient.getToken();
export const setToken = (token: string) => apiClient.setToken(token);
export const removeToken = () => apiClient.removeToken();
export const isAuthenticated = () => apiClient.isAuthenticated();
