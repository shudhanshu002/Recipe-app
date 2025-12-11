import { create } from 'zustand';
import api from '../lib/axios';

const useNotificationStore = create((set) => ({
    unreadCount: 0,

    fetchUnreadCount: async () => {
        try {
            const res = await api.get('/notifications');
            set({ unreadCount: res.data.data.unreadCount || 0 });
        } catch (error) {
            console.error('Failed to fetch notification count', error);
        }
    },

    setUnreadCount: (count) => set({ unreadCount: count }),

    decrementCount: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
}));

export default useNotificationStore;
