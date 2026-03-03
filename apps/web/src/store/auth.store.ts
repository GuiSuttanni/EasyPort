import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Catalog } from '@/types';

interface AuthState {
  user: User | null;
  catalog: Catalog | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  setAuth: (user: User, catalog: Catalog, accessToken: string, refreshToken: string) => void;
  updateCatalog: (catalog: Catalog) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      catalog: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      setAuth: (user, catalog, accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);
        }
        set({ user, catalog, accessToken, refreshToken, isAuthenticated: true });
      },

      updateCatalog: (catalog) => set({ catalog }),

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
        set({ user: null, catalog: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'catalogo-auth',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
      partialize: (state) => ({
        user: state.user,
        catalog: state.catalog,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
