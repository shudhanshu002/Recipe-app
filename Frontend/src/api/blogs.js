import api from '../lib/axios';

export const blogApi = {
    getAll: async () => {
        const response = await api.get('/blogs');
        return response.data.data;
    },
    toggleReaction: async (id, emoji) => {
        const response = await api.post(`/blogs/${id}/react`, { emoji });
        return response.data.data;
    },
    getOne: async (id) => {
        const response = await api.get(`/blogs/${id}`);
        return response.data.data;
    },
    getComments: async (id) => {
        const response = await api.get(`/blogs/${id}/comments`);
        return response.data.data;
    },
    addComment: async (id, data) => {
        const response = await api.post(`/blogs/${id}/comments`, data);
        return response.data.data;
    },
    // ✅ NEW
    toggleCommentLike: async (commentId) => {
        const response = await api.post(`/blogs/comments/${commentId}/like`);
        return response.data.data;
    },
    create: async (formData) => {
        const response = await api.post('/blogs', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        return response.data.data;
    },
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const response = await api.post('/blogs/upload-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data.url; // Returns the Cloudinary URL
    },
};
