import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, setAccessToken, useAuthStore } from '@/lib/stores/auth.store';
import { debugAuthLog } from '@/lib/utils/debug';

function getBaseUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    if (process.env.NODE_ENV === 'production') {
      return '/v1';
    }
    return '/v1';
  }

  if (process.env.NODE_ENV === 'production' && !apiUrl.startsWith('https://')) {
    throw new Error('NEXT_PUBLIC_API_URL must use https:// in production');
  }
  return apiUrl;
}

const BASE_URL = getBaseUrl();

debugAuthLog('API client configured', { baseURL: BASE_URL });

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
  debugAuthLog('Outgoing request', {
    method: config.method,
    url: config.url,
    hasAccessToken: Boolean(accessToken),
  });
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
    debugAuthLog('API response error', {
      method: originalRequest?.method,
      url: originalRequest?.url,
      status: error.response?.status ?? null,
      code: error.code ?? null,
      message: error.message,
      responseData: error.response?.data ?? null,
    });

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
        debugAuthLog('Attempting token refresh');
        const { data } = await axios.post<{ accessToken: string }>(
          `${BASE_URL}/auth/refresh`,
          {},
          { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
        );

        const { accessToken } = data;
        debugAuthLog('Token refresh succeeded', { hasAccessToken: Boolean(accessToken) });

        setInMemoryToken(accessToken);

        onRefreshed(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch {
        debugAuthLog('Token refresh failed');
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
  setAccessToken(token);
  useAuthStore.setState({ accessToken: token });
}

function clearAuthAndRedirect() {
  useAuthStore.getState().clearAuth();
  const locale = window.location.pathname.match(/^\/(es|en)(\/|$)/)?.[1] ?? 'es';
  window.location.href = `/${locale}/login`;
}

export default apiClient;
