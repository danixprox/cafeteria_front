import api from './axiosClient';

export const opinionesService = {
  listar: (params = {}) => api.get('/opiniones/', { params }),
  mias: () => api.get('/opiniones/mias/'),
  crear: (data) => api.post('/opiniones/', data),
  actualizarVisibilidad: (id, visible) => api.patch(`/opiniones/${id}/visibilidad/`, { visible }),
};

export default opinionesService;
