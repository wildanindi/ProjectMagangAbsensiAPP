import apiClient from './apiClient';

export const periodsAPI = {
    getAllPeriods: async () => {
        const response = await apiClient.get('/periods/all');
        return response.data;
    },

    getPeriodById: async (id) => {
        const response = await apiClient.get(`/periods/${id}`);
        return response.data;
    },

    createPeriod: async (periodData) => {
        const response = await apiClient.post('/periods/create', periodData);
        return response.data;
    },

    updatePeriod: async (id, periodData) => {
        const response = await apiClient.put(`/periods/${id}`, periodData);
        return response.data;
    },

    deletePeriod: async (id) => {
        const response = await apiClient.delete(`/periods/${id}`);
        return response.data;
    },

    getActivePeriod: async () => {
        const response = await apiClient.get('/periods/active');
        return response.data;
    }
};
