import apiClient from './apiClient';

export const authAPI = {
    login: async (username, password) => {
        const response = await apiClient.post('/auth/login', { username, password });
        return response.data;
    },

    register: async (userData) => {
        const response = await apiClient.post('/auth/register', userData);
        return response.data;
    },

    logout: async () => {
        const response = await apiClient.post('/auth/logout');
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await apiClient.get('/auth/profile');
        return response.data;
    }
};
