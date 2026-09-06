import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Role {
  _id: string;
  name: string;
  permissions: string[];
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  authProvider: 'local' | 'google' | 'both';
  roles: (Role | string)[];
  isActive: boolean;
  emailVerified: boolean;
  telegramChatId?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string, permissions?: string[]) => void;
  setAccessToken: (accessToken: string) => void;
  setPermissions: (permissions: string[]) => void;
  setUser: (user: User) => void;
  setIsLoading: (isLoading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      permissions: [],
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user: User, accessToken: string, permissions: string[] = []) =>
        set({
          user,
          accessToken,
          permissions,
          isAuthenticated: true,
          isLoading: false,
        }),

      setAccessToken: (accessToken: string) =>
        set({
          accessToken,
          isAuthenticated: true,
        }),

      setPermissions: (permissions: string[]) =>
        set({
          permissions,
        }),

      setUser: (user: User) =>
        set({
          user,
          isAuthenticated: true,
        }),

      setIsLoading: (isLoading: boolean) =>
        set({
          isLoading,
        }),

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          permissions: [],
          isAuthenticated: false,
          isLoading: false,
        }),
    }),
    {
      name: 'qindil_auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

