import { api, apiClient } from './client';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  displayName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export const authApi = {
  async register(data: RegisterInput): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    const { user, accessToken } = response.data.data;
    apiClient.setAccessToken(accessToken);
    return { user, accessToken };
  },

  async login(data: LoginInput): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    const { user, accessToken } = response.data.data;
    apiClient.setAccessToken(accessToken);
    return { user, accessToken };
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    apiClient.clearAccessToken();
  },

  async refreshToken(): Promise<string> {
    const response = await api.post('/auth/refresh');
    const { accessToken } = response.data.data;
    apiClient.setAccessToken(accessToken);
    return accessToken;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  },
};
