import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: AuthUser | null;
  /** Lives only in memory — never persisted to localStorage */
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
}

interface AuthActions {
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      setAuth: (user, accessToken, refreshToken) => {
        // Keep access token in memory AND expose it on window for the API client
        if (typeof window !== 'undefined') {
          (window as unknown as Record<string, unknown>).__zustand_auth_token__ = accessToken;
        }
        set({ user, accessToken, refreshToken, isLoading: false });
      },

      clearAuth: () => {
        if (typeof window !== 'undefined') {
          delete (window as unknown as Record<string, unknown>).__zustand_auth_token__;
        }
        set({ user: null, accessToken: null, refreshToken: null, isLoading: false });
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'expenses-auth',
      storage: createJSONStorage(() => localStorage),
      // Only persist user and refreshToken — accessToken stays in memory only
      partialize: (state) => ({
        user: state.user,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration the accessToken is null (not persisted).
        // The app should call /auth/refresh on mount to restore it.
        if (state) {
          state.accessToken = null;
        }
      },
    }
  )
);
