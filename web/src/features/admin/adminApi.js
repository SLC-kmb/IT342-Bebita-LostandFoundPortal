import api from '../../lib/axios';

export const getDashboardStats = () => api.get('/admin/dashboard-stats');
export const getPendingClaims = () => api.get('/admin/pending-claims');
export const approveClaim = (id) => api.put(`/admin/claims/${id}/approve`);
export const rejectClaim = (id) => api.put(`/admin/claims/${id}/reject`);
export const getAllUsers = () => api.get('/admin/users');
export const getAllItems = () => api.get('/admin/items');
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const deleteItem = (id) => api.delete(`/admin/items/${id}`);
