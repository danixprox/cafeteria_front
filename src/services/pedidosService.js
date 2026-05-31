import axiosClient from './axiosClient';

const pedidosService = {
  crearPorMesero: (sala_id, mesa_id, productos) =>
    axiosClient.post('/pedidos/crear_por_mesero/', { sala_id, mesa_id, productos }),

  getAll: () => axiosClient.get('/pedidos/'),

  marcarEntregado: (pedidoId) =>
    axiosClient.patch(`/pedidos/${pedidoId}/marcar_entregado/`),

  cancelarPedido: (pedidoId) =>
    axiosClient.patch(`/pedidos/${pedidoId}/cancelar_pedido/`),
};

export default pedidosService;
