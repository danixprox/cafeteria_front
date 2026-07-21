import api from './axiosClient';

export const combosService = {
  getAll: () => api.get('/combos/'),
  getActivos: () => api.get('/combos/activos/'),
  create: (data) => api.post('/combos/', data),
  update: (id, data) => api.patch(`/combos/${id}/`, data),
  delete: (id) => api.delete(`/combos/${id}/`),
};
