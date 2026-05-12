import api from './axiosClient';

export const salasService = {
    getAll: () => api.get('/salas/'),
    getById: (id) => api.get(`/salas/${id}/`),
    create: (data) => api.post('/salas/', data),
    update: (id, data) => api.patch(`/salas/${id}/`, data),
    delete: (id) => api.delete(`/salas/${id}/`),
    cambiarEstado: (id, habilitada) => api.patch(`/salas/${id}/estado/`, { habilitada }),
    getDisponibilidad: (id, fecha) => api.get(`/salas/${id}/disponibilidad/?fecha=${fecha}`),
    getMesas: (id) => api.get(`/salas/${id}/mesas/`),
    subirGaleria: (id, formData) => api.post(`/salas/${id}/subir_galeria/`, formData),
    eliminarImagen: (id, imagenId) => api.post(`/salas/${id}/eliminar_imagen/`, { imagen_id: imagenId })
};
