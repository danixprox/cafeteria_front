import api from './axiosClient';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const salasService = {
    getAll: () => api.get('/salas/'),
    getById: (id) => api.get(`/salas/${id}/`),
    create: (data) => axios.post(`${API_URL}/salas/`, data, { headers: getHeaders() }),
    update: (id, data) => axios.patch(`${API_URL}/salas/${id}/`, data, { headers: getHeaders() }),
    delete: (id) => api.delete(`/salas/${id}/`),
    cambiarEstado: (id, habilitada) => api.patch(`/salas/${id}/estado/`, { habilitada }),
    getDisponibilidad: (id, fecha) => api.get(`/salas/${id}/disponibilidad/?fecha=${fecha}`),
    getMesas: (id) => api.get(`/salas/${id}/mesas/`),
    subirGaleria: (id, formData) => axios.post(`${API_URL}/salas/${id}/subir_galeria/`, formData, { headers: getHeaders() }),
    eliminarImagen: (id, imagenId) => api.post(`/salas/${id}/eliminar_imagen/`, { imagen_id: imagenId })
};
