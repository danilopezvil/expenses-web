import apiClient from './client';
import type { User } from '@/types/api.types';

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  register(body: RegisterDto): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', body).then((r) => r.data);
  },

  login(body: LoginDto): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', body).then((r) => r.data);
  },

  refresh(refreshToken: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/refresh', { refreshToken }).then((r) => r.data);
  },

  logout(refreshToken: string): Promise<void> {
    return apiClient.post('/auth/logout', { refreshToken }).then(() => undefined);
  },

  me(): Promise<User> {
    return apiClient.get<User>('/auth/me').then((r) => r.data);
  },
};
