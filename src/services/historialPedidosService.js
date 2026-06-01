import axiosClient from './axiosClient';

export const obtenerHistorialPedidos = async (filtros = {}) => {
  const params = new URLSearchParams();
  Object.keys(filtros || {}).forEach((k) => {
    if (filtros[k]) params.append(k, filtros[k]);
  });
  const url = `/pedidos/historial/?${params.toString()}`;
  const resp = await axiosClient.get(url);
  return resp.data;
};

export const obtenerDetallePedido = async (id) => {
  const resp = await axiosClient.get(`/pedidos/historial/${id}/`);
  return resp.data;
};

export const obtenerSugerenciasClientes = async (q) => {
  if (!q) return [];
  const resp = await axiosClient.get(`/pedidos/historial/clientes-sugerencias/?q=${encodeURIComponent(q)}`);
  return resp.data;
};
