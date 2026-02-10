/**
 * Base API Client
 *
 * Type-safe HTTP client wrapper around axios.
 * Provides consistent error handling and request/response interceptors.
 *
 * Token Management:
 * - Tokens are stored in HttpOnly cookies (not accessible to JavaScript)
 * - Client-side requests go through /api/* proxy routes which read the cookie
 * - Server-side requests can pass a serverToken explicitly
 */

import { getRequiredEnv } from '@/shared/lib/config/env';
import { redirect } from '@/shared/utils/redirect';
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';

const getBaseURL = (): string => {
  if (globalThis.window !== undefined) {
    // Client-side: use /api routes which proxy to backend
    // The proxy reads HttpOnly cookie and adds Authorization header
    return '/api';
  }
  // Server-side: direct API calls
  return getRequiredEnv('NEXT_PUBLIC_API_URL');
};

export interface RequestConfig extends AxiosRequestConfig {
  params?: Record<string, unknown> | undefined;
  serverToken?: string;
}

let isRedirecting = false;
let pendingSessionVerification: Promise<boolean> | null = null;

async function verifySessionIsInvalid(): Promise<boolean> {
  if (pendingSessionVerification) return pendingSessionVerification;
  pendingSessionVerification = (async () => {
    try {
      const res = await fetch('/api/me', {
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      });
      const data = await res.json();
      return data.authenticated !== true;
    } catch {
      return false; // Network error — don't logout
    } finally {
      setTimeout(() => {
        pendingSessionVerification = null;
      }, 2000);
    }
  })();
  return pendingSessionVerification;
}

async function coordinatedLogout(): Promise<void> {
  if (isRedirecting) return;

  // Don't trigger logout if auth state isn't confirmed yet
  const { useAuthStore } = await import('@/shared/stores/auth-store');
  const { isInitialized: initDone, isAuthenticated: authDone } = useAuthStore.getState();
  if (!initDone || !authDone) return;

  isRedirecting = true;

  // Safety: reset flag if redirect doesn't complete (e.g., blocked by extension)
  setTimeout(() => {
    isRedirecting = false;
  }, 5000);

  try {
    // Clear Zustand state — persist middleware auto-syncs to localStorage
    useAuthStore.setState({
      user: null,
      isSubscribed: false,
      isProfileComplete: false,
      isAuthenticated: false,
      isInitialized: false,
      isLoading: false,
    });

    // Don't call /api/logout here — automatic 401-triggered logout should only
    // clear local state and redirect, NOT invalidate the token on the backend.
    // Backend token invalidation only happens on explicit user-initiated logout.

    // Redirect — full page load starts fresh
    window.location.href = '/sign-in';
  } catch {
    window.location.href = '/sign-in';
  }
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
        // For server-side direct calls, add Authorization header if serverToken provided
        const serverToken = (config as RequestConfig).serverToken;
        if (serverToken && config.headers) {
          config.headers.Authorization = `Bearer ${serverToken}`;
        }
        // For client-side, the /api proxy routes handle Authorization
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        try {
          if (error.response?.status === 401) {
            const requestUrl = error.config?.url || '';
            // Always allow /me to fail without triggering logout
            if (requestUrl.includes('/me')) {
              return Promise.reject(error);
            }
            if (globalThis.window !== undefined) {
              // Only trigger logout after auth initialization completes.
              // During hydration (isInitialized: false), silently reject —
              // checkAuth() will determine the true auth state.
              const { useAuthStore } = await import('@/shared/stores/auth-store');
              const { isInitialized } = useAuthStore.getState();
              if (isInitialized) {
                const sessionInvalid = await verifySessionIsInvalid();
                if (sessionInvalid) {
                  coordinatedLogout();
                }
              }
            }
          }

          if (error.response?.status === 403) {
            const data = error.response.data as { message?: string };
            if (data?.message?.includes('subscription') && globalThis.window !== undefined) {
              redirect('/choose-plan');
            }
          }
        } catch (redirectError) {
          console.error('Error in response interceptor:', redirectError);
        }

        return Promise.reject(error);
      }
    );
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

/**
 * @deprecated Token management moved to HttpOnly cookies.
 * For server-side, read from cookies() and pass as serverToken.
 */
export const getToken = (): undefined => undefined;

/**
 * @deprecated Token management moved to HttpOnly cookies.
 * Tokens are set by /api/auth/* proxy routes.
 */
export const setToken = (_token: string): void => {
  console.warn('setToken is deprecated. Tokens are now managed via HttpOnly cookies.');
};

/**
 * @deprecated Token management moved to HttpOnly cookies.
 * Call /api/auth/logout to remove token.
 */
export const removeToken = (): void => {
  console.warn('removeToken is deprecated. Call /api/auth/logout to remove token.');
};

/**
 * @deprecated Token management moved to HttpOnly cookies.
 * Use authClient.me() to check authentication status.
 */
export const isAuthenticated = (): boolean => {
  console.warn('isAuthenticated is deprecated. Use authClient.me() to check auth status.');
  return false;
};
