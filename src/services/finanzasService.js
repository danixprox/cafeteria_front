import api from './axiosClient';

export const finanzasService = {
    crearSesionReserva: (data) => api.post('/finanzas/crear-sesion-reserva/', data),
    iniciarPagoPedido: (data) => api.post('/finanzas/iniciar-pago-pedido/', data),
    confirmarPagoStripe: (sessionId) => api.post('/finanzas/confirmar-pago-stripe/', { session_id: sessionId }),
    confirmarPagoQR: (pagoId) => api.post('/finanzas/confirmar-pago-qr/', { pago_id: pagoId }),
    obtenerNotaVentaPedido: (pedidoId, metodoPago) => api.post('/finanzas/nota-venta-pedido/', { pedido_id: pedidoId, metodo_pago: metodoPago }),
    cancelarPagoPedido: (pedidoId) => api.post('/finanzas/cancelar-pago-pedido/', { pedido_id: pedidoId }),
    cancelarPagoReserva: (reservaId) => api.post('/finanzas/cancelar-pago-reserva/', { reserva_id: reservaId }),
    
    // Cart and Mesa State persistence
    iniciarPedidoMesa: (mesaId, cliente = {}) => api.post(`/pedidos/mesa/${mesaId}/iniciar/`, cliente),
    getPedidoActivoMesa: (mesaId) => api.get(`/pedidos/mesa/${mesaId}/activo/`),
    agregarDetalle: (pedidoId, data) => api.post(`/pedidos/${pedidoId}/detalles/`, data),
    actualizarDetalle: (pedidoId, detalleId, data) => api.patch(`/pedidos/${pedidoId}/detalles/${detalleId}/`, data),
    eliminarDetalle: (pedidoId, detalleId) => api.delete(`/pedidos/${pedidoId}/detalles/${detalleId}/`),
    actualizarMesaEstado: (mesaId, estado) => api.patch(`/mesas/${mesaId}/estado/`, { estado }),
    
    // Split confirm and pay flow
    confirmarPedido: (pedidoId) => api.post(`/pedidos/${pedidoId}/confirmar/`),
    getResumenPago: (pedidoId) => api.get(`/pedidos/${pedidoId}/resumen-pago/`),
    pagarEfectivo: (pedidoId) => api.post(`/pedidos/${pedidoId}/pagar-efectivo/`)
};
