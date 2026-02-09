import apiClient from './apiClient';

export const absensiAPI = {
    checkIn: async (absensiData) => {
        const response = await apiClient.post('/absensi/check-in', absensiData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    getTodayAttendance: async (userId) => {
        const response = await apiClient.get(`/absensi/today/${userId}`);
        return response.data;
    },

    getUserAttendanceHistory: async (userId, limit = 50, offset = 0) => {
        const response = await apiClient.get(`/absensi/user/${userId}`, {
            params: { limit, offset }
        });
        return response.data;
    },

    getAttendanceByDateRange: async (userId, startDate, endDate) => {
        const response = await apiClient.get(`/absensi/user/${userId}/date-range`, {
            params: { startDate, endDate }
        });
        return response.data;
    },

    getAttendanceSummary: async (userId) => {
        const response = await apiClient.get(`/absensi/summary/${userId}`);
        return response.data;
    },

    getAllAttendance: async (limit = 100, offset = 0) => {
        const response = await apiClient.get('/absensi/all', {
            params: { limit, offset }
        });
        return response.data;
    }
};
