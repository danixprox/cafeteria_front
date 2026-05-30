import api from './axiosClient';

const cocinaService = {
  obtenerPerfilCocinero: () => api.get('/cocina/perfil/'),
  obtenerComandas: () => api.get('/cocina/comandas/'),
  obtenerDetalleComanda: (id) => api.get(`/cocina/comandas/${id}/`),
  iniciarPreparacion: (id) => api.patch(`/cocina/comandas/${id}/en-preparacion/`),
  marcarComoLista: (id) => api.patch(`/cocina/comandas/${id}/lista/`),
};

export default cocinaService;
