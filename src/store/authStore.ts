import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User } from '../types/auth';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        token: null,
        user: null,
        isAuthenticated: false,
        login: (token, user) => set({ token, user, isAuthenticated: true }, false, 'auth/login'),
        logout: () => set({ token: null, user: null, isAuthenticated: false }, false, 'auth/logout'),
        updateUser: (partial) => {
          const current = get().user;
          if (current) set({ user: { ...current, ...partial } }, false, 'auth/updateUser');
        },
      }),
      {
        name: 'auth-storage',
      }
    ),
    { name: 'auth-store' }
  )
);
