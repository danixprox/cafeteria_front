import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import cocinaService from '../../services/cocinaService';

const estadosConfig = {
  pendiente: { label: 'Pendiente', bg: 'bg-amber-100', text: 'text-amber-800' },
  confirmado: { label: 'Confirmado', bg: 'bg-amber-100', text: 'text-amber-800' },
  en_preparacion: { label: 'En preparación', bg: 'bg-sky-100', text: 'text-sky-800' },
  lista: { label: 'Lista', bg: 'bg-emerald-100', text: 'text-emerald-800' },
  cancelado: { label: 'Cancelada', bg: 'bg-red-100', text: 'text-red-800' },
  entregada: { label: 'Entregada', bg: 'bg-violet-100', text: 'text-violet-800' },
};

const origenMap = { pedido_normal: 'Pedido normal', preorden: 'Preorden' };

const formatearFecha = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const getErrorMessage = (error) => {
  if (!error.response) return 'No se pudo conectar con el servidor.';
  if (error.response.status === 401) return 'Tu sesión expiró. Vuelve a iniciar sesión.';
  if (error.response.status === 403) return 'No tienes permiso para realizar esta acción.';
  if (error.response.status === 404) return 'No se encontró la comanda solicitada.';
  if (error.response.status === 500) return 'Ocurrió un error en el servidor. Intenta nuevamente.';
  return error.response.data?.error || 'Ocurrió un error.';
};

const DetalleComanda = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [comanda, setComanda] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accionLoading, setAccionLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState('');

  const cargarDetalle = async () => {
    setLoading(true);
    setError('');
    setMensaje(null);
    try {
      const response = await cocinaService.obtenerDetalleComanda(id);
      setComanda(response.data);
    } catch (err) {
      const texto = getErrorMessage(err);
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }
      setError(texto);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDetalle();
  }, [id]);

  const handleAccion = async () => {
    if (!comanda) return;
    const estado = comanda.estado;
    if (estado !== 'pendiente' && estado !== 'confirmado' && estado !== 'en_preparacion') return;

    const esPreparacion = ['pendiente', 'confirmado'].includes(estado);

    setAccionLoading(true);
    setError('');
    setMensaje(null);
    try {
      const response = esPreparacion ? await cocinaService.iniciarPreparacion(id) : await cocinaService.marcarComoLista(id);
      setMensaje({ type: 'success', text: response.data?.message || (esPreparacion ? 'La comanda pasó a En preparación.' : 'La comanda fue marcada como Lista.') });
      await cargarDetalle();
    } catch (err) {
      const texto = getErrorMessage(err);
      setError(texto);
    } finally {
      setAccionLoading(false);
    }
  };

  const renderCliente = () => {
    if (!comanda?.cliente) return 'Sin cliente';
    if (typeof comanda.cliente === 'string') return comanda.cliente;
    return comanda.cliente.nombre || comanda.cliente.usuario?.nombre || 'Cliente registrado';
  };

  const meseroResponsable = comanda?.mesero || comanda?.mesero_responsable || comanda?.responsable || null;

  if (loading) return (<div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">Cargando detalle de la comanda...</div>);
  if (error) return (<div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 shadow-sm text-red-700">{error}</div>);
  if (!comanda) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-amber-600">Detalle de comanda</p>
          <h2 className="mt-2 text-3xl font-black text-slate-900">Pedido #{comanda.id_pedido}</h2>
        </div>

        <button type="button" onClick={() => navigate('/cocinero/comandas')} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Volver a comandas</button>
      </div>

      {mensaje && <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">{mensaje.text}</div>}

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Estado</p>
            <h3 className={`mt-2 inline-flex rounded-full px-4 py-2 text-sm font-semibold ${estadosConfig[comanda.estado]?.bg || 'bg-slate-100'} ${estadosConfig[comanda.estado]?.text || 'text-slate-800'}`}>{estadosConfig[comanda.estado]?.label || comanda.estado}</h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Sala</p>
              <p className="mt-2 font-semibold text-slate-900">{comanda.sala}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Mesa</p>
              <p className="mt-2 font-semibold text-slate-900">{comanda.mesa}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Fecha / Hora</p>
              <p className="mt-2 font-semibold text-slate-900">{formatearFecha(`${comanda.fecha} ${comanda.hora}`)}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Origen</p>
              <p className="mt-2 font-semibold text-slate-900">{origenMap[comanda.origen] || comanda.origen}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Cliente</p>
            <p className="mt-3 text-lg font-semibold text-slate-900">{renderCliente()}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Mesero responsable</p>
            <p className="mt-3 text-lg font-semibold text-slate-900">{meseroResponsable || 'No asignado'}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Fecha creación</p>
            <p className="mt-3 text-slate-900">{formatearFecha(comanda.creada_en || comanda.created_at)}</p>
          </div>

          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Fecha actualización</p>
            <p className="mt-3 text-slate-900">{formatearFecha(comanda.actualizada_en || comanda.updated_at)}</p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-slate-50 p-5">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Observaciones generales</p>
          <p className="mt-3 text-slate-700">{comanda.observaciones || 'Sin observaciones'}</p>
        </div>

        <div className="mt-6 overflow-x-auto rounded-3xl bg-white p-4 shadow-sm">
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-sm uppercase tracking-[0.35em] text-slate-500">
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Cantidad</th>
                <th className="px-4 py-3">Precio unitario</th>
                <th className="px-4 py-3">Subtotal</th>
                <th className="px-4 py-3">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {comanda.productos?.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-4 text-slate-900">{item.producto_nombre}</td>
                  <td className="px-4 py-4 text-slate-700">{item.cantidad}</td>
                  <td className="px-4 py-4 text-slate-700">${item.precio_unitario}</td>
                  <td className="px-4 py-4 text-slate-900 font-semibold">${item.subtotal}</td>
                  <td className="px-4 py-4 text-slate-600">{item.observaciones || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="rounded-3xl bg-slate-50 p-5 text-slate-700">
            <p className="text-sm uppercase tracking-[0.35em]">Total</p>
            <p className="mt-2 text-3xl font-black text-slate-900">${comanda.total}</p>
          </div>

          {['pendiente', 'confirmado'].includes(comanda.estado) && (
            <button onClick={handleAccion} disabled={accionLoading} className="rounded-2xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60">{accionLoading ? 'Procesando...' : 'Iniciar preparación'}</button>
          )}

          {comanda.estado === 'en_preparacion' && (
            <button onClick={handleAccion} disabled={accionLoading} className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60">{accionLoading ? 'Procesando...' : 'Marcar como lista'}</button>
          )}

          {comanda.estado === 'lista' && <div className="rounded-3xl bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-900">Lista para recoger</div>}

          {['cancelado', 'entregada'].includes(comanda.estado) && <div className="rounded-3xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700">Sin acciones disponibles</div>}
        </div>
      </div>
    </div>
  );
};

export default DetalleComanda;
