import apiClient from './apiClient';

export const usersAPI = {
    getAllUsers: async (role = null) => {
        const response = await apiClient.get('/users/all', {
            params: role ? { role } : {}
        });
        return response.data;
    },

    getAllInterns: async () => {
        const response = await apiClient.get('/users/interns');
        return response.data;
    },

    getUserById: async (id) => {
        const response = await apiClient.get(`/users/${id}`);
        return response.data;
    },

    updateUser: async (id, userData) => {
        const response = await apiClient.put(`/users/${id}`, userData);
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await apiClient.delete(`/users/${id}`);
        return response.data;
    },

    createUser: async (userData) => {
        const response = await apiClient.post('/users/create', userData);
        return response.data;
    },

    resetPassword: async (id) => {
        const response = await apiClient.put(`/users/${id}/reset-password`);
        return response.data;
    },

    updateLeaveBalance: async (id, leaveBalance) => {
        const response = await apiClient.put(`/users/${id}/leave-balance`, { sisa_izin: leaveBalance });
        return response.data;
    },

    changePassword: async (id, passwordData) => {
        const response = await apiClient.put(`/users/${id}/change-password`, passwordData);
        return response.data;
    }
};
