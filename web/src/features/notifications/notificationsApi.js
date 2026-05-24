import api from '../../lib/axios';

export const getNotifications = () => api.get('/notifications');
export const markNotificationAsRead = (id) => api.patch(`/notifications/${id}/read`);
export const clearNotification = (id) => api.delete(`/notifications/${id}`);
export const clearAllNotifications = () => api.delete('/notifications');
