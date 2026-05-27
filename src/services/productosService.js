import api from './axiosClient';

export const productosService = {
    getAll: () => api.get('/productos/'),
    getDisponibles: () => api.get('/productos/disponibles/'),
    getById: (id) => api.get(`/productos/${id}/`),
    create: (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if(data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        return api.post('/productos/', formData);
    },
    update: (id, data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if(data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        return api.patch(`/productos/${id}/`, formData);
    },
    delete: (id) => api.delete(`/productos/${id}/`)
};
