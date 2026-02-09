import apiClient from './apiClient';

export const supervisorsAPI = {
    getAllSupervisors: async () => {
        const response = await apiClient.get('/supervisors/all');
        return response.data;
    },

    getSupervisorById: async (id) => {
        const response = await apiClient.get(`/supervisors/${id}`);
        return response.data;
    },

    createSupervisor: async (supervisorData) => {
        const response = await apiClient.post('/supervisors/create', supervisorData);
        return response.data;
    },

    updateSupervisor: async (id, supervisorData) => {
        const response = await apiClient.put(`/supervisors/${id}`, supervisorData);
        return response.data;
    },

    deleteSupervisor: async (id) => {
        const response = await apiClient.delete(`/supervisors/${id}`);
        return response.data;
    }
};
