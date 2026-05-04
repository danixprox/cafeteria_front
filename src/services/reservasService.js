import api from './axiosClient';

export const reservasService = {
    getAll: () => api.get('/reservas/'),
    getMisReservas: () => api.get('/reservas/mis_reservas/'),
    create: (data) => api.post('/reservas/', data),
    cancelar: (id) => api.patch(`/reservas/${id}/cancelar/`),
    confirmarLlegada: (id) => api.patch(`/reservas/${id}/confirmar_llegada/`),
    liberar: (id) => api.patch(`/reservas/${id}/liberar/`),
    noAsistio: (id) => api.patch(`/reservas/${id}/no_asistio/`),
    finalizar: (id) => api.patch(`/reservas/${id}/finalizar/`)
};
