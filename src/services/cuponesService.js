import api from './axiosClient';

export const cuponesService = {
  getAll: () => api.get('/cupones/'),
  create: (data) => api.post('/cupones/', data),
  update: (id, data) => api.patch(`/cupones/${id}/`, data),
  delete: (id) => api.delete(`/cupones/${id}/`),
  aplicar: (pedidoId, codigo) => api.post(`/pedidos/${pedidoId}/aplicar-cupon/`, { codigo }),
  quitar: (pedidoId) => api.post(`/pedidos/${pedidoId}/quitar-cupon/`),
};
