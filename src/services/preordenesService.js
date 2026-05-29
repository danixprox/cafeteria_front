import axiosClient from './axiosClient';

const preordenesService = {
  // Mesero: listar preórdenes del día (desde las 3PM)
  getAll: () => axiosClient.get('/preordenes/'),

  // Mesero: gestionar estado
  marcarConPedido: (id) => axiosClient.patch(`/preordenes/${id}/marcar_con_pedido/`),
  marcarEntregada: (id) => axiosClient.patch(`/preordenes/${id}/marcar_entregada/`),
  cancelar:        (id) => axiosClient.patch(`/preordenes/${id}/cancelar/`),

  // Cliente: crear preorden al reservar (integración futura con reservas)
  crearPorCliente: (reserva_id, productos, notas = '') =>
    axiosClient.post('/preordenes/crear_por_cliente/', { reserva_id, productos, notas }),
};

export default preordenesService;
