import apiClient from './apiClient';

export const izinAPI = {
    createLeaveRequest: async (leaveData) => {
        const response = await apiClient.post('/izin/request', leaveData);
        return response.data;
    },

    getUserLeaveRequests: async (userId, status = null) => {
        const response = await apiClient.get(`/izin/user/${userId}`, {
            params: status ? { status } : {}
        });
        return response.data;
    },

    getAllLeaveRequests: async (status = null) => {
        const response = await apiClient.get('/izin/all', {
            params: status ? { status } : {}
        });
        return response.data;
    },

    approveLeaveRequest: async (id) => {
        const response = await apiClient.put(`/izin/${id}/approve`);
        return response.data;
    },

    rejectLeaveRequest: async (id) => {
        const response = await apiClient.put(`/izin/${id}/reject`);
        return response.data;
    },

    getLeaveRequestById: async (id) => {
        const response = await apiClient.get(`/izin/${id}`);
        return response.data;
    }
};
