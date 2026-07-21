import api from './axiosClient';

export const puntosService = {
  cliente: () => api.get('/puntos/'),
  canjear: (producto_id, cantidad = 1) => api.post('/puntos/', { producto_id, cantidad }),
  admin: () => api.get('/puntos/admin/'),
  configurar: (data) => api.patch('/puntos/admin/', data),
};
