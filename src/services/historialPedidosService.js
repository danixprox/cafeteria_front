import axiosClient from './axiosClient';

export const obtenerHistorialPedidos = async (filtros = {}) => {
  const params = new URLSearchParams();
  Object.keys(filtros || {}).forEach((k) => {
    const v = filtros[k];
    if (v === undefined || v === null || v === '') return;
    if (Array.isArray(v)) {
      v.forEach(item => params.append(k, String(item)));
      return;
    }
    if (typeof v === 'object') {
      // serializar objetos para evitar "[object Object]"
      params.append(k, JSON.stringify(v));
      return;
    }
    params.append(k, String(v));
  });
  const url = `/pedidos/historial/?${params.toString()}`;
  const resp = await axiosClient.get(url);
  // Compatibilidad: si backend devuelve paginación, retornar objeto completo; si devuelve array, retornarlo
  if (resp.data && resp.data.results !== undefined) return resp.data;
  return Array.isArray(resp.data) ? { results: resp.data, count: resp.data.length, page: 1, page_size: resp.data.length } : resp.data;
};

export const obtenerDetallePedido = async (id) => {
  const resp = await axiosClient.get(`/pedidos/historial/${id}/`);
  return resp.data;
};

export const obtenerPedidosActuales = async () => {
  const resp = await axiosClient.get('/pedidos/historial/actuales/');
  return resp.data;
};

export const editarPedidoActual = async (id, productos) => {
  const resp = await axiosClient.patch(`/pedidos/historial/${id}/editar/`, { productos });
  return resp.data;
};

export const obtenerSugerenciasClientes = async (q) => {
  if (!q) return [];
  const resp = await axiosClient.get(`/pedidos/historial/clientes-sugerencias/?q=${encodeURIComponent(q)}`);
  return resp.data;
};
