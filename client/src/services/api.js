/**
 * Axios API Service
 * Centralized axios instance with interceptors
 */

import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
});

// ─── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || 'An unexpected error occurred';

        // Handle 401 — clear auth and redirect
        if (error.response?.status === 401) {
            // Clear stored auth state
            localStorage.removeItem('pm-auth-storage');
            delete api.defaults.headers.common['Authorization'];

            // Only redirect if not already on auth pages
            if (!window.location.pathname.includes('/login')) {
                toast.error('Session expired. Please login again.');
                window.location.href = '/login';
            }
        } else if (error.response?.status >= 500) {
            toast.error('Server error. Please try again later.');
        }
        // Let calling code handle 400-level errors specifically
        return Promise.reject(error);
    }
);

export default api;

// ─── API Service Functions ─────────────────────────────────────────────────────

// Auth
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    updatePassword: (data) => api.put('/auth/update-password', data),
};

// Users
export const userAPI = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
    uploadCV: (formData) =>
        api.post('/users/upload-cv', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 60000, // Extended timeout for AI processing
        }),
    getCVAnalysis: () => api.get('/users/cv-analysis'),
    reanalyzeCV: () => api.post('/users/reanalyze-cv', {}, { timeout: 60000 }),
};


// Internships
export const internshipAPI = {
    getAll: (params) => api.get('/internships', { params }),
    getOne: (id) => api.get(`/internships/${id}`),
    create: (data) => api.post('/internships', data),
    update: (id, data) => api.put(`/internships/${id}`, data),
    delete: (id) => api.delete(`/internships/${id}`),
    getStats: (id) => api.get(`/internships/${id}/stats`),
};

// Applications
export const applicationAPI = {
    submit: (data) => api.post('/applications', data),
    getMy: () => api.get('/applications/my'),
    getOne: (id) => api.get(`/applications/${id}`),
    withdraw: (id) => api.patch(`/applications/${id}/withdraw`),
    getRecommendations: () => api.get('/applications/recommendations'),
    updateStatus: (id, data) => api.patch(`/applications/${id}/status`, data),
};

// Admin
export const adminAPI = {
    getDashboard: () => api.get('/admin/dashboard'),
    getUsers: (params) => api.get('/admin/users', { params }),
    getUserDetail: (id) => api.get(`/admin/users/${id}`),
    toggleUserActive: (id) => api.patch(`/admin/users/${id}/toggle-active`),
    getApplications: (params) => api.get('/admin/applications', { params }),
    triggerBatchScoring: (internshipId) => api.post(`/admin/internships/${internshipId}/score-all`),
    getRankedCandidates: (internshipId, params) => api.get(`/admin/internships/${internshipId}/candidates`, { params }),
    triggerAllocation: (internshipId, data) => api.post(`/admin/internships/${internshipId}/allocate`, data),
    getAllocationReport: (internshipId) => api.get(`/admin/internships/${internshipId}/report`),
};

// AI
export const aiAPI = {
    chat: (message, history) => api.post('/ai/chat', { message, history }),
};
