import apiClient from './apiClient';

export const izinAPI = {
    createLeaveRequest: async (leaveData) => {
        const response = await apiClient.post('/izin/request', leaveData);
        return response.data;
    },

    getUserLeaveRequests: async (status = null) => {
        const response = await apiClient.get('/izin/my-requests', {
            params: status ? { status } : {}
        });
        return response.data;
    },

    getUserLeaveSummary: async () => {
        const response = await apiClient.get('/izin/summary');
        return response.data;
    },

    deleteLeaveRequest: async (id) => {
        const response = await apiClient.delete(`/izin/${id}`);
        return response.data;
    },

    // Admin endpoints
    getAllLeaveRequests: async (status = null) => {
        const response = await apiClient.get('/izin/admin/all', {
            params: status ? { status } : {}
        });
        return response.data;
    },

    getLeaveRequestDetail: async (id) => {
        const response = await apiClient.get(`/izin/admin/${id}`);
        return response.data;
    },

    approveLeaveRequest: async (id) => {
        const response = await apiClient.put(`/izin/admin/${id}/approve`);
        return response.data;
    },

    rejectLeaveRequest: async (id, keterangan = '') => {
        const response = await apiClient.put(`/izin/admin/${id}/reject`, { keterangan });
        return response.data;
    },

    getPendingLeaveCount: async () => {
        const response = await apiClient.get('/izin/admin/pending/count');
        return response.data;
    }
};
