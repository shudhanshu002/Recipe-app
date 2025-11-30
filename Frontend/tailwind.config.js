import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
            },
        },
    },
    // ✅ FIX: Force Vite to recognize Tiptap exports
    optimizeDeps: {
        include: ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-bubble-menu', '@tiptap/extension-floating-menu', '@tiptap/extension-image', '@tiptap/extension-link'],
    },
});
