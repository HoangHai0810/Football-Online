import axios from 'axios';

// In dev, Vite proxies /api → http://localhost:8080
// In prod, VITE_API_URL points to the Render backend URL
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: BASE_URL,
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — clear token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
