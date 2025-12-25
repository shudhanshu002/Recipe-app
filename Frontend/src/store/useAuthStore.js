import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/auth';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (userData) => set({ user: userData, isAuthenticated: true }),
      // logout: () => set({ user: null, isAuthenticated: false }),
      logout: async () => {
        set({ loading: true });
        try {
          // Attempt to notify backend
          await authApi.logout();
        } catch (error) {
          console.error('Logout API error:', error);
          // Even if backend fails (e.g. 401), we should still logout locally
        } finally {
          // CRITICAL FIX: Always clear state here
          set({ user: null, isAuthenticated: false, loading: false });
        }
      },

      updateUser: (data) =>
        set((state) => ({
          user: { ...state.user, ...data },
        })),

      setUser: (userData) => set({ user: userData }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
