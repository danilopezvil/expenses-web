import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, useAuthStore } from '@/lib/stores/auth.store';

function getBaseUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing NEXT_PUBLIC_API_URL in production');
    }
    return 'http://localhost:3000/v1';
  }

  if (process.env.NODE_ENV === 'production' && !apiUrl.startsWith('https://')) {
    throw new Error('NEXT_PUBLIC_API_URL must use https:// in production');
  }
  return apiUrl;
}

const BASE_URL = getBaseUrl();

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track whether a token refresh is already in progress to avoid race conditions
let isRefreshing = false;
let pendingRequests: Array<{ resolve: (token: string) => void; reject: (error: Error) => void }> = [];

function onRefreshed(token: string) {
  pendingRequests.forEach(({ resolve }) => resolve(token));
  pendingRequests = [];
}

function onRefreshFailed(error: Error) {
  pendingRequests.forEach(({ reject }) => reject(error));
  pendingRequests = [];
}

function addPendingRequest(resolve: (token: string) => void, reject: (error: Error) => void) {
  pendingRequests.push({ resolve, reject });
}

// Request interceptor — attach access token from memory store
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor — handle 401 (refresh) and 403 (redirect)
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 403) {
      if (typeof window !== 'undefined') {
        clearAuthAndRedirect();
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request until the token is refreshed
        return new Promise((resolve, reject) => {
          addPendingRequest((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          }, (refreshError) => reject(refreshError));
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<{ accessToken: string }>(
          `${BASE_URL}/auth/refresh`,
          {},
          { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
        );

        const { accessToken } = data;

        setInMemoryToken(accessToken);

        onRefreshed(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch {
        onRefreshFailed(new Error('Unable to refresh session'));
        clearAuthAndRedirect();
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

function setInMemoryToken(token: string) {
  useAuthStore.setState({ accessToken: token });
}

function clearAuthAndRedirect() {
  useAuthStore.getState().clearAuth();
  const locale = window.location.pathname.match(/^\/(es|en)(\/|$)/)?.[1] ?? 'es';
  window.location.href = `/${locale}/login`;
}

export default apiClient;
