import api from '../lib/axios';
import { handleSuccessResponse, handleErrorResponse } from '../utils/apiUtils';

export const socialApi = {
  toggleLike: async (recipeId) => {
    try {
      const response = await api.post(`/likes/toggle/r/${recipeId}`);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error);
    }
  },

  toggleBookmark: async (recipeId) => {
    try {
      const response = await api.post(`/bookmarks/${recipeId}`);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error);
    }
  },

  getBookmarks: async () => {
    try {
      const response = await api.get('/bookmarks');
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error);
    }
  },
};
