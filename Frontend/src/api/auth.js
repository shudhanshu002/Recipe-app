import api from "../lib/axios.js";
import { handleSuccessResponse, handleErrorResponse } from "../utils/apiUtils.js";

export const authApi = {
    register: async (userData) => {
        try {
            const response = await api.post('/users/register', userData);
            return handleSuccessResponse(response);
        } catch (error) {
            return handleErrorResponse(error);
            
        }
    },

    verifyOtp: async (data) => {
        try {
            const response = await api.post('/users/verify-otp',data);
            return handleSuccessResponse(response);
        } catch (error) {
            return handleErrorResponse(error);
        }
    },

    login: async (credentials) => {
        try {
            const response = await api.post('/users/login', credentials);
            return handleSuccessResponse(response);
        } catch (error) {
            return handleErrorResponse(error);
        }
    },

    logout: async () => {
        try {
            const response = await api.post('/users/logout');
            return handleSuccessResponse(response);
        } catch (error) {
            return handleErrorResponse(error);
        }
    },

    refreshToken: async () => {
        try {
            const response = await api.post('/users/refresh-token');
            return handleSuccessResponse(response);
        } catch (error) {
            return handleErrorResponse(error);
        }
    }
}