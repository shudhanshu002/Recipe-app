import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
    persist(
        (set) => ({
            theme: 'light',

            toggleTheme: () =>
                set((state) => {
                    const newTheme = state.theme === 'light' ? 'dark' : 'light';

                    
                    const root = window.document.documentElement;
                    if (newTheme === 'dark') {
                        root.classList.add('dark');
                    } else {
                        root.classList.remove('dark');
                    }

                    return { theme: newTheme };
                }),

            setTheme: (theme) => set({ theme }),
        }),
        {
            name: 'theme-storage',
        },
    ),
);

export default useThemeStore;
