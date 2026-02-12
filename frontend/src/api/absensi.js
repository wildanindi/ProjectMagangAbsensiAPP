import apiClient from './apiClient';

export const absensiAPI = {
    checkIn: async (formData) => {
        const response = await apiClient.post('/absensi/check-in', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    getTodayAttendance: async () => {
        const response = await apiClient.get('/absensi/today');
        return response.data;
    },

    getUserAttendanceHistory: async (limit = 50, offset = 0) => {
        const response = await apiClient.get('/absensi/history', {
            params: { limit, offset }
        });
        return response.data;
    },

    getAttendanceByDateRange: async (startDate, endDate) => {
        const response = await apiClient.get('/absensi/date-range', {
            params: { startDate, endDate }
        });
        return response.data;
    },

    getAttendanceStats: async () => {
        const response = await apiClient.get('/absensi/stats');
        return response.data;
    },

    // Admin endpoints
    getAllAttendance: async (limit = 100, offset = 0) => {
        const response = await apiClient.get('/absensi/admin/all', {
            params: { limit, offset }
        });
        return response.data;
    },

    getAttendanceSummaryToday: async () => {
        const response = await apiClient.get('/absensi/admin/summary-today');
        return response.data;
    },

    getUsersWithTodayAttendance: async () => {
        const response = await apiClient.get('/absensi/admin/users-today');
        return response.data;
    },

    getUserAttendanceDetail: async (userId) => {
        const response = await apiClient.get(`/absensi/admin/user/${userId}`);
        return response.data;
    },

    // User export
    exportUserExcel: async (month) => {
        const response = await apiClient.get('/absensi/export/excel', {
            params: { month },
            responseType: 'blob'
        });
        return response;
    },

    exportUserPdf: async (month) => {
        const response = await apiClient.get('/absensi/export/pdf', {
            params: { month },
            responseType: 'blob'
        });
        return response;
    },

    // Admin export
    exportAdminExcel: async (month) => {
        const response = await apiClient.get('/absensi/admin/export/excel', {
            params: { month },
            responseType: 'blob'
        });
        return response;
    },

    exportAdminPdf: async (month) => {
        const response = await apiClient.get('/absensi/admin/export/pdf', {
            params: { month },
            responseType: 'blob'
        });
        return response;
    }
};
