import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add request interceptor to include user email header
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.email) {
    config.headers['X-User-Email'] = user.email;
  }
  return config;
});

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

// Lost and Found Items
export const reportLostItem = (data) => api.post('/items/lost', data);
export const reportFoundItem = (data) => api.post('/items/found', data);
export const getLostItems = () => api.get('/items/lost');
export const getFoundItems = () => api.get('/items/found');
export const claimItem = (id, data) => api.put(`/items/claim/${id}`, data);

export default api;
