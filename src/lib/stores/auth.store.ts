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
  /** True after the persist middleware has finished reading localStorage */
  _hydrated: boolean;
}

interface AuthActions {
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
  _setHydrated: () => void;
}

type AuthStore = AuthState & AuthActions;

function setSessionCookie(value: string | null) {
  if (typeof document === 'undefined') return;
  if (value) {
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
      _hydrated: false,

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

      _setHydrated: () => set({ _hydrated: true }),
    }),
    {
      name: 'expenses-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        // Restore session cookie when user comes back from localStorage
        if (state?.user) {
          setSessionCookie(state.user.id);
        }
      },
    }
  )
);

// Mark hydration complete AFTER the store is created.
// localStorage is synchronous — by the time create() returns, rehydration is already done.
// We use the persist API here so useAuthStore is guaranteed to be defined.
if (typeof window !== 'undefined') {
  if (useAuthStore.persist.hasHydrated()) {
    useAuthStore.setState({ _hydrated: true, accessToken: null });
  } else {
    useAuthStore.persist.onFinishHydration(() => {
      useAuthStore.setState({ _hydrated: true, accessToken: null });
    });
  }
}
