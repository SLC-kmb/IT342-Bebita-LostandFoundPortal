import api from '../../lib/axios';

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const googleLogin = (idToken) => api.post('/auth/google', { idToken });
export const verifyEmail = (token) => api.get(`/auth/verify-email?token=${token}`);
export const resendVerification = (email) => api.post('/auth/resend-verification', { email });
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (token, newPassword) => api.post('/auth/reset-password', { token, newPassword });
