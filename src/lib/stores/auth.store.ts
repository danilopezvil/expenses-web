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
  isLoading: boolean;
  /** True after the persist middleware has finished reading localStorage */
  _hydrated: boolean;
}

interface AuthActions {
  setAuth: (user: AuthUser, accessToken?: string | null) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
  _setHydrated: () => void;
}

type AuthStore = AuthState & AuthActions;

let inMemoryAccessToken: string | null = null;
export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function setAccessToken(token: string | null) {
  inMemoryAccessToken = token;
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
        isLoading: false,
        _hydrated: false,

        setAuth: (user, accessToken) => {
          const normalizedAccessToken = accessToken ?? null;
          setAccessToken(normalizedAccessToken);
          set({ user, accessToken: normalizedAccessToken, isLoading: false });
        },

        clearAuth: () => {
          setAccessToken(null);
          set({ user: null, accessToken: null, isLoading: false });
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
      }),
      onRehydrateStorage: () => () => {
        // Use the captured `set` so this works even with synchronous localStorage
        // (where useAuthStore wouldn't be assigned yet at call time).
        _markHydrated?.();
      },
    }
  )
);
