import api from './axiosClient';

export const salasService = {
    getAll: () => api.get('/salas/'),
    getById: (id) => api.get(`/salas/${id}/`),
    create: (data) => api.post('/salas/', data),
    update: (id, data) => api.put(`/salas/${id}/`, data),
    cambiarEstado: (id, habilitada) => api.patch(`/salas/${id}/estado/`, { habilitada }),
    getDisponibilidad: (id, fecha) => api.get(`/salas/${id}/disponibilidad/?fecha=${fecha}`),
    getMesas: (id) => api.get(`/salas/${id}/mesas/`)
};
