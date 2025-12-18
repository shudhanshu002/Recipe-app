import api from '../lib/axios';
import { handleSuccessResponse, handleErrorResponse } from '../utils/apiUtils';

export const recipeApi = {
  getAll: async (params) => {
    // params = { page, limit, search, cuisine, sort }
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/recipes?${queryString}`);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error);
    }
  },

  getOne: async (id) => {
    try {
      const response = await api.get(`/recipes/${id}`);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error);
    }
  },

  create: async (recipeData) => {
    try {
      // recipeData should be FormData object
      const response = await api.post('/recipes', recipeData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error);
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/recipes/${id}`);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error);
    }
  },

  getLikedVideos: async () => {
    try {
      const response = await api.get('/recipes/user/liked-videos');
      return response.data.data;
    } catch (error) {
      return handleErrorResponse(error);
    }
  },

  getTopChefs: async () => {
    try {
      const response = await api.get('/recipes/top-chefs');
      return response.data.data;
    } catch (error) {
      return handleErrorResponse(error);
    }
  },
  getRecipeOfTheDay: async () => {
    try {
      const response = await api.get('/recipes/daily');
      return response.data.data;
    } catch (error) {
      return handleErrorResponse(error);
    }
  },
};
