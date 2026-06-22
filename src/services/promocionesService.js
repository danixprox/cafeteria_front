import api from './axiosClient';

export const promocionesService = {
    getAll: () => api.get('/promociones/'),
    getById: (id) => api.get(`/promociones/${id}/`),
    create: (data) => api.post('/promociones/', data),
    update: (id, data) => api.patch(`/promociones/${id}/`, data),
    delete: (id) => api.delete(`/promociones/${id}/`)
};
