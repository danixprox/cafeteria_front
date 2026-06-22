import api from './axiosClient';

export const notificacionesOperativasService = {
  listar: (limite = 10) => api.get(`/pedidos/notificaciones/?limite=${limite}`),
  marcarLeida: (id) => api.patch(`/pedidos/notificaciones/${id}/leer/`),
  buscarClientes: (q = '') => api.get(`/pedidos/clientes/buscar/?q=${encodeURIComponent(q)}`),
};
