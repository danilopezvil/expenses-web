import apiClient from './client';
import { getAccessToken, setAccessToken } from '@/lib/stores/auth.store';
import type { User } from '@/types/api.types';
import { debugAuthLog } from '@/lib/utils/debug';

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
  accessToken?: string | null;
}

type SessionPayload = {
  user?: User;
  accessToken?: string | null;
};

async function normalizeSession(payload: SessionPayload): Promise<AuthResponse> {
  debugAuthLog('Normalizing auth payload', {
    hasInlineUser: Boolean(payload.user),
    hasAccessToken: Boolean(payload.accessToken),
  });

  if (payload.user) {
    return {
      user: payload.user,
      accessToken: payload.accessToken ?? null,
    };
  }

  const previousAccessToken = getAccessToken();
  const sessionAccessToken = payload.accessToken ?? null;

  if (sessionAccessToken) {
    setAccessToken(sessionAccessToken);
  }

  const user = await apiClient.get<User>('/auth/me').then((r) => r.data);
  debugAuthLog('Fetched /auth/me during normalizeSession', { userId: user.id });

  if (sessionAccessToken && previousAccessToken !== sessionAccessToken) {
    setAccessToken(previousAccessToken);
  }

  return {
    user,
    accessToken: sessionAccessToken,
  };
}

export const authApi = {
  register(body: RegisterDto): Promise<AuthResponse> {
    debugAuthLog('Register requested', { email: body.email });
    return apiClient
      .post<SessionPayload>('/auth/register', body)
      .then((r) => normalizeSession(r.data));
  },

  login(body: LoginDto): Promise<AuthResponse> {
    debugAuthLog('Login requested', { email: body.email });
    return apiClient
      .post<SessionPayload>('/auth/login', body)
      .then((r) => normalizeSession(r.data));
  },

  refresh(): Promise<AuthResponse> {
    debugAuthLog('Manual refresh requested');
    return apiClient
      .post<SessionPayload>('/auth/refresh', {})
      .then((r) => normalizeSession(r.data));
  },

  logout(): Promise<void> {
    return apiClient.post('/auth/logout', {}).then(() => undefined);
  },

  me(): Promise<User> {
    return apiClient.get<User>('/auth/me').then((r) => r.data);
  },
};
