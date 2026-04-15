import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  login as loginService,
  logout as logoutService,
  register as registerService,
  loginWithGoogle as loginWithGoogleService,
  syncSupabaseSession,
} from '../services/authService';
import { isConfigured } from '../services/supabase';
import type { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole, extra?: Record<string, unknown>) => Promise<boolean>;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password, role) => {
        set({ isLoading: true, error: null });
        try {
          const user = await loginService(email, password, role);
          if (user) {
            set({ user, isAuthenticated: true, isLoading: false });
            return true;
          } else {
            set({ error: 'Invalid email or password. Try the demo credentials.', isLoading: false });
            return false;
          }
        } catch (err) {
          set({ error: 'Login failed. Please try again.', isLoading: false });
          return false;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        await logoutService();
        set({ user: null, isAuthenticated: false, isLoading: false, error: null });
      },

      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          await loginWithGoogleService();
          // Actual session hydration happens in initAuth after OAuth redirect
        } catch {
          set({ error: 'Google Sign-In failed. Please try again.', isLoading: false });
        }
      },

      initAuth: async () => {
        if (!isConfigured) return;
        try {
          const user = await syncSupabaseSession();
          if (user) {
            set({ user, isAuthenticated: true });
          }
        } catch {
          // ignore — stay logged out
        }
      },

      register: async (name, email, password, role, extra = {}) => {
        set({ isLoading: true, error: null });
        try {
          const user = await registerService(name, email, password, role, extra);
          if (user) {
            // Doctors require approval, don't auto-login
            if (role === 'doctor') {
              set({ isLoading: false });
              return true;
            }
            set({ user, isAuthenticated: true, isLoading: false });
            return true;
          } else {
            set({ error: 'Registration failed. Please try again.', isLoading: false });
            return false;
          }
        } catch (err) {
          set({ error: 'Registration failed. Please try again.', isLoading: false });
          return false;
        }
      },

      updateUser: (updates) => {
        const current = get().user;
        if (current) {
          set({ user: { ...current, ...updates } });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'dermaai_auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
