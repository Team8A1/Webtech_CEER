import axios from 'axios';

const LOCAL_URL = 'http://localhost:8000';
const PROD_URL = 'https://webtech-ceer.onrender.com';

export const BASE_URL = PROD_URL;

const API_BASE_URL = import.meta.env.VITE_API_URL || `${BASE_URL}/api`;



const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (error.config.url.includes('/login') || error.config.url.includes('/auth') || error.config.url.includes('password')) {
        return Promise.reject(error);
      }

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      window.location.href = `/login/${user.role || 'student'}`;
    }
    return Promise.reject(error);
  }
);

export default api;
