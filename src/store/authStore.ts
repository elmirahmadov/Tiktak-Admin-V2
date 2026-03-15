import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AuthState } from '../types';

interface AuthStore extends AuthState {
  isHydrated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setAuthenticated: (value: boolean) => void;
  setHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,
      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: 'tiktak-auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
