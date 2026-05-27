import api from './axiosClient';

export const categoriasService = {
    getAll: () => api.get('/categorias/'),
    getById: (id) => api.get(`/categorias/${id}/`),
    create: (data) => api.post('/categorias/', data),
    update: (id, data) => api.patch(`/categorias/${id}/`, data),
    delete: (id) => api.delete(`/categorias/${id}/`)
};
