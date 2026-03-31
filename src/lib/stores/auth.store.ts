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

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

function setSessionCookie(value: string | null) {
  if (typeof document === 'undefined') return;
  if (value) {
    document.cookie = `x-auth-user=${encodeURIComponent(value)}; path=/; SameSite=Strict; Max-Age=${COOKIE_MAX_AGE}`;
  } else {
    document.cookie = 'x-auth-user=; path=/; SameSite=Strict; Max-Age=0';
  }
}

// Captured from the state creator (which runs before hydration) so it is safe
// to call from onRehydrateStorage even when localStorage is synchronous and
// the exported `useAuthStore` reference is not yet assigned.
let _markHydrated: (() => void) | null = null;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => {
      _markHydrated = () => set({ _hydrated: true });
      return {
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
      };
    },
    {
      name: 'expenses-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.user) {
          setSessionCookie(state.user.id);
        }
        // Use the captured `set` so this works even with synchronous localStorage
        // (where useAuthStore wouldn't be assigned yet at call time).
        _markHydrated?.();
      },
    }
  )
);
