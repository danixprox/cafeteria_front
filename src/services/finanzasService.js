import api from './axiosClient';

export const finanzasService = {
    crearSesionReserva: (data) => api.post('/finanzas/crear-sesion-reserva/', data),
    iniciarPagoPedido: (data) => api.post('/finanzas/iniciar-pago-pedido/', data),
    confirmarPagoStripe: (sessionId) => api.post('/finanzas/confirmar-pago-stripe/', { session_id: sessionId }),
    confirmarPagoQR: (pagoId) => api.post('/finanzas/confirmar-pago-qr/', { pago_id: pagoId }),
    cancelarPagoPedido: (pedidoId) => api.post('/finanzas/cancelar-pago-pedido/', { pedido_id: pedidoId }),
    cancelarPagoReserva: (reservaId) => api.post('/finanzas/cancelar-pago-reserva/', { reserva_id: reservaId })
};
