/**
 * Zustand Auth Store
 * Persists JWT token and user to localStorage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/services/api';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isLoading: false,

            login: async (email, password, adminKey) => {
                set({ isLoading: true });
                try {
                    const payload = { email, password };
                    if (adminKey) payload.adminKey = adminKey;
                    const { data } = await api.post('/auth/login', payload);
                    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                    set({ user: data.user, token: data.token, isLoading: false });
                    return data;
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            register: async (formData) => {
                set({ isLoading: true });
                try {
                    const { data } = await api.post('/auth/register', formData);
                    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                    set({ user: data.user, token: data.token, isLoading: false });
                    return data;
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            logout: () => {
                delete api.defaults.headers.common['Authorization'];
                set({ user: null, token: null });
            },

            updateUser: (userUpdates) => {
                set((state) => ({ user: { ...state.user, ...userUpdates } }));
            },

            refreshMe: async () => {
                try {
                    const { data } = await api.get('/auth/me');
                    set({ user: data.user });
                } catch {
                    get().logout();
                }
            },
        }),
        {
            name: 'pm-auth-storage',
            partialize: (state) => ({ token: state.token, user: state.user }),
            onRehydrateStorage: () => (state) => {
                // Restore axios Authorization header on app reload
                if (state?.token) {
                    api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
                }
            },
        }
    )
);
