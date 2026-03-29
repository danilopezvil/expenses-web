import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track whether a token refresh is already in progress to avoid race conditions
let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
  pendingRequests.forEach((cb) => cb(token));
  pendingRequests = [];
}

function addPendingRequest(cb: (token: string) => void) {
  pendingRequests.push(cb);
}

// Request interceptor — attach access token from memory store
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    // Access token lives only in the Zustand store (memory), not in localStorage.
    // We import lazily to avoid circular deps and SSR issues.
    const raw = (window as unknown as Record<string, unknown>).__zustand_auth_token__;
    if (raw && typeof raw === 'string') {
      config.headers.Authorization = `Bearer ${raw}`;
    }
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
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = typeof window !== 'undefined'
          ? getStoredRefreshToken()
          : null;

        if (!refreshToken) {
          clearAuthAndRedirect();
          return Promise.reject(error);
        }

        const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
          `${BASE_URL}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const { accessToken, refreshToken: newRefreshToken } = data;

        // Persist new tokens via the auth store
        setInMemoryToken(accessToken);
        setStoredRefreshToken(newRefreshToken);

        onRefreshed(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch {
        clearAuthAndRedirect();
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Helpers that bridge between the API client and the auth store.
// Using a lightweight approach to avoid circular imports.
// ---------------------------------------------------------------------------

function getStoredRefreshToken(): string | null {
  try {
    const raw = localStorage.getItem('expenses-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { refreshToken?: string } };
    return parsed?.state?.refreshToken ?? null;
  } catch {
    return null;
  }
}

function setStoredRefreshToken(token: string) {
  try {
    const raw = localStorage.getItem('expenses-auth');
    if (!raw) return;
    const parsed = JSON.parse(raw) as { state?: Record<string, unknown> };
    if (parsed.state) {
      parsed.state.refreshToken = token;
      localStorage.setItem('expenses-auth', JSON.stringify(parsed));
    }
  } catch {
    // ignore
  }
}

function setInMemoryToken(token: string) {
  (window as unknown as Record<string, unknown>).__zustand_auth_token__ = token;
}

function clearAuthAndRedirect() {
  try {
    localStorage.removeItem('expenses-auth');
  } catch {
    // ignore
  }
  delete (window as unknown as Record<string, unknown>).__zustand_auth_token__;
  window.location.href = '/login';
}

export default apiClient;
