import api from '../lib/axios';
import { handleErrorResponse } from '../utils/apiUtils';

export const newsletterApi = {
  subscribe: async (email) => {
    try {
      const response = await api.post('/newsletter/subscribe', { email });
      return response.data;
    } catch (error) {
      return handleErrorResponse(error);
    }
  },
};
