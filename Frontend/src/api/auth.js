import api from '../lib/axios.js';
import {
  handleSuccessResponse,
  handleErrorResponse,
} from '../utils/apiUtils.js';

export const authApi = {
  // register auth
  register: async (userData) => {
    try {
      const response = await api.post('/users/register', userData);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error);
    }
  },

  // verify auth
  verifyOtp: async (data) => {
    try {
      const response = await api.post('/users/verify-otp', data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error);
    }
  },

  // login auth
  login: async (credentials) => {
    try {
      const response = await api.post('/users/login', credentials);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error);
    }
  },

  // logout auth
  logout: async () => {
    try {
      const response = await api.post('/users/logout');
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error);
    }
  },

  // refreshToken auth
  refreshToken: async () => {
    try {
      const response = await api.post('/users/refresh-token');
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error);
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/users/forgot-password', { email });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error);
    }
  },

  resetPassword: async (token, password) => {
    try {
      const response = await api.post(`/users/reset-password/${token}`, {
        password,
      });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error);
    }
  },
};
