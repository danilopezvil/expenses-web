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

/** Sync a lightweight cookie so the middleware can detect authenticated sessions */
function setSessionCookie(value: string | null) {
  if (typeof document === 'undefined') return;
  if (value) {
    // SameSite=Strict, no httpOnly (client needs to set it)
    document.cookie = `x-auth-user=${encodeURIComponent(value)}; path=/; SameSite=Strict`;
  } else {
    document.cookie = 'x-auth-user=; path=/; SameSite=Strict; Max-Age=0';
  }
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          (window as unknown as Record<string, unknown>).__zustand_auth_token__ = accessToken;
          setSessionCookie(user.id);
        }
        set({ user, accessToken, refreshToken, isLoading: false });
      },

      clearAuth: () => {
        if (typeof window !== 'undefined') {
          delete (window as unknown as Record<string, unknown>).__zustand_auth_token__;
          setSessionCookie(null);
        }
        set({ user: null, accessToken: null, refreshToken: null, isLoading: false });
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'expenses-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.accessToken = null;
          // Re-sync cookie after rehydration so middleware stays in sync
          if (state.user) {
            setSessionCookie(state.user.id);
          }
        }
      },
    }
  )
);
