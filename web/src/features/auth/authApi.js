import api from '../../shared/apiClient';

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
