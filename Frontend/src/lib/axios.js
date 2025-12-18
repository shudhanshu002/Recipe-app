import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// base call to be used in api;
api.interceptors.response.use(
  (response) => response, // success fn
  async (error) => {
    // error fn
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('refresh-token')
    ) {
      originalRequest._retry = true;

      try {
        await api.post('/users/refresh-token');
        return api(originalRequest);
      } catch (refreshErr) {
        console.error('Session expired:', refreshErr);
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
