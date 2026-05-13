import api from '../../shared/apiClient';

export const reportLostItem = (data) => api.post('/items/lost', data);
export const reportFoundItem = (data) => api.post('/items/found', data);
export const getLostItems = () => api.get('/items/lost');
export const getFoundItems = () => api.get('/items/found');
export const claimItem = (id, data) => api.put(`/items/claim/${id}`, data);
