import api from './axiosClient';

export const mesasService = {
    getAll: () => api.get('/mesas/'),
    create: (data) => api.post('/mesas/', data),
    update: (id, data) => api.put(`/mesas/${id}/`, data),
    patch: (id, data) => api.patch(`/mesas/${id}/`, data),
    delete: (id) => api.delete(`/mesas/${id}/`)
};
