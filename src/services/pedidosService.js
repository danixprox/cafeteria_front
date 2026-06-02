import axiosClient from './axiosClient';

const pedidosService = {
  crearPorMesero: (sala_id, mesa_id, productos) => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return axiosClient.post('/pedidos/crear_por_mesero/', { sala_id, mesa_id, productos }, { headers });
  },

  getAll: () => axiosClient.get('/pedidos/'),

  marcarEntregado: (pedidoId) => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return axiosClient.patch(`/pedidos/${pedidoId}/marcar_entregado/`, null, { headers });
  },

  cancelarPedido: (pedidoId) => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return axiosClient.patch(`/pedidos/${pedidoId}/cancelar_pedido/`, null, { headers });
  },
};

export default pedidosService;
