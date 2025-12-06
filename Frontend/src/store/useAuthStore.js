import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,

            // --- Existing Logic (Unchanged) ---
            login: (userData) => set({ user: userData, isAuthenticated: true }),
            logout: () => set({ user: null, isAuthenticated: false }),

            updateUser: (data) =>
                set((state) => ({
                    user: { ...state.user, ...data },
                })),

            // --- New Helper for Subscription ---
            // This fixes the "setUser is not a function" error
            setUser: (userData) => set({ user: userData }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
        },
    ),
);

export default useAuthStore;
