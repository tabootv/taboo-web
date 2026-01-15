import { apiClient, setToken, removeToken } from '@/api/client';
import type { AuthResponse, MeResponse, LoginCredentials, RegisterData, FirebaseLoginData } from '@/types';

/**
 * Authentication API endpoints.
 */
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const data = await apiClient.post<AuthResponse>('/login', credentials);
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const data = await apiClient.post<AuthResponse>('/register', userData);
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  firebaseLogin: async (firebaseData: FirebaseLoginData): Promise<AuthResponse> => {
    const data = await apiClient.post<AuthResponse>('/auth/firebase-login', firebaseData);
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/logout');
    removeToken();
  },

  me: async (): Promise<MeResponse> => {
    const data = await apiClient.get<MeResponse>('/me');
    return data;
  },
};

