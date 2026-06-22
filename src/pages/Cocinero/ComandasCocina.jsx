import React, { useEffect, useState } from 'react';
import cocinaService from '../../services/cocinaService';
import NotificacionesOperativasPanel from '../../components/NotificacionesOperativasPanel';
import useNotificacionesOperativas from '../../hooks/useNotificacionesOperativas';

const estadosConfig = {
  pendiente: { label: 'Pendiente', bg: 'bg-amber-100', text: 'text-amber-800' },
  confirmado: { label: 'Confirmado', bg: 'bg-amber-100', text: 'text-amber-800' },
  en_preparacion: { label: 'En preparación', bg: 'bg-sky-100', text: 'text-sky-800' },
  lista: { label: 'Lista', bg: 'bg-emerald-100', text: 'text-emerald-800' },
  cancelado: { label: 'Cancelada', bg: 'bg-red-100', text: 'text-red-800' },
  entregada: { label: 'Entregada', bg: 'bg-violet-100', text: 'text-violet-800' },
};

const origenMap = { pedido_normal: 'Pedido normal', preorden: 'Preorden' };

const filtros = [
  { id: 'todas', label: 'Todas' },
  { id: 'pendientes', label: 'Pendientes' },
  { id: 'en_preparacion', label: 'En preparación' },
  { id: 'listas', label: 'Listas' },
];

const formatearFecha = (fecha) =>
  new Date(fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

const getErrorMessage = (error) => {
  if (!error.response) return 'No se pudo conectar con el servidor.';
  if (error.response.status === 401) return 'Tu sesión expiró. Vuelve a iniciar sesión.';
  if (error.response.status === 403) return 'No tienes permiso para realizar esta acción.';
  if (error.response.status === 404) return 'No se encontró la comanda solicitada.';
  if (error.response.status === 500) return 'Ocurrió un error en el servidor. Intenta nuevamente.';
  return error.response.data?.error || 'Ocurrió un error.';
};

const ComandasCocina = () => {
  const [comandas, setComandas] = useState([]);
  const [selectedComanda, setSelectedComanda] = useState(null);
  const [filtro, setFiltro] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [accionLoading, setAccionLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState('');
  const notificaciones = useNotificacionesOperativas();

  const cargarComandas = async (selectedId = null) => {
    setLoading(true);
    setError('');
    setMensaje(null);
    try {
      const response = await cocinaService.obtenerComandas();
      const lista = response.data || [];
      setComandas(lista);

      const nuevaSeleccion = lista.find((item) => item.id_pedido === selectedId) || lista[0] || null;
      setSelectedComanda(nuevaSeleccion);
    } catch (err) {
      const texto = getErrorMessage(err);
      if (err.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
        return;
      }
      setError(texto);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarComandas();
  }, []);

  const mostrarBoton = (estado) => {
    if (estado === 'pendiente' || estado === 'confirmado') return 'iniciar';
    if (estado === 'en_preparacion') return 'lista';
    return null;
  };

  const handleAccion = async (id, estado) => {
    const accion = mostrarBoton(estado);
    if (!accion) return;
    setAccionLoading(true);
    setMensaje(null);
    setError('');
    try {
      const response = accion === 'iniciar' ? await cocinaService.iniciarPreparacion(id) : await cocinaService.marcarComoLista(id);
      const successText = response.data?.message || (accion === 'iniciar' ? 'La comanda pasó a En preparación.' : 'La comanda fue marcada como Lista.');
      setMensaje({ type: 'success', text: successText });
      await cargarComandas(id);
      await notificaciones.cargar();
    } catch (err) {
      const texto = getErrorMessage(err);
      setError(texto);
    } finally {
      setAccionLoading(false);
    }
  };

  const listaFiltrada = comandas.filter((comanda) => {
    if (filtro === 'todas') return true;
    if (filtro === 'pendientes') return ['pendiente', 'confirmado'].includes(comanda.estado);
    if (filtro === 'en_preparacion') return comanda.estado === 'en_preparacion';
    if (filtro === 'listas') return comanda.estado === 'lista';
    return true;
  });

  const resumen = {
    total: comandas.length,
    pendientes: comandas.filter((item) => ['pendiente', 'confirmado'].includes(item.estado)).length,
    enPreparacion: comandas.filter((item) => item.estado === 'en_preparacion').length,
    listas: comandas.filter((item) => item.estado === 'lista').length,
  };

  return (
    <div className="space-y-6">
      <header className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-amber-600">Comandas de cocina</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">Pedidos enviados a cocina para su preparación</h2>
          </div>
          <button onClick={() => cargarComandas(selectedComanda?.id_pedido)} disabled={loading} className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Total</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{resumen.total}</p>
          </div>
          <div className="rounded-3xl bg-amber-50 p-5">
            <p className="text-sm uppercase tracking-[0.35em] text-amber-700">Pendientes</p>
            <p className="mt-3 text-3xl font-black text-amber-900">{resumen.pendientes}</p>
          </div>
          <div className="rounded-3xl bg-sky-50 p-5">
            <p className="text-sm uppercase tracking-[0.35em] text-sky-700">En preparación</p>
            <p className="mt-3 text-3xl font-black text-sky-900">{resumen.enPreparacion}</p>
          </div>
          <div className="rounded-3xl bg-emerald-50 p-5">
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-700">Listas</p>
            <p className="mt-3 text-3xl font-black text-emerald-900">{resumen.listas}</p>
          </div>
        </div>
      </header>

      {mensaje && <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">{mensaje.text}</div>}

      {error && <div className="rounded-[2rem] border border-red-200 bg-red-50 p-5 text-red-900">{error}</div>}

      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-3">
          {filtros.map((item) => (
            <button key={item.id} onClick={() => setFiltro(item.id)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filtro === item.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.7fr_1.05fr_0.9fr]">
        <NotificacionesOperativasPanel
          notificaciones={notificaciones.notificaciones}
          noLeidas={notificaciones.noLeidas}
          cargando={notificaciones.cargando}
          onActualizar={notificaciones.cargar}
          onLeer={notificaciones.marcarLeida}
          titulo="Entrada de cocina"
          descripcion="Nuevos pedidos enviados por check-in o por el mesero."
        />
        <section className="space-y-4">
          {loading ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm text-slate-500">Cargando comandas...</div>
          ) : listaFiltrada.length === 0 ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm text-slate-500">No hay comandas disponibles en este momento.</div>
          ) : (
            listaFiltrada.map((comanda) => {
              const activo = selectedComanda?.id_pedido === comanda.id_pedido;
              const estadoMeta = estadosConfig[comanda.estado] || estadosConfig.pendiente;

              return (
                <button key={comanda.id_pedido} onClick={() => setSelectedComanda(comanda)} className={`w-full rounded-[2rem] border p-5 text-left transition shadow-sm ${activo ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white hover:shadow-lg'}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Pedido #{comanda.id_pedido}</p>
                      <h3 className="mt-2 text-xl font-black text-slate-900">{origenMap[comanda.origen] || comanda.origen}</h3>
                    </div>

                    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${estadoMeta.bg} ${estadoMeta.text}`}>{estadoMeta.label}</span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl bg-amber-50 p-4 sm:col-span-2">
                      <p className="text-xs uppercase tracking-[0.35em] text-amber-600">Cliente</p>
                      <p className="mt-2 font-semibold text-slate-900">{comanda.cliente?.nombre || 'Cliente presencial'}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Sala</p>
                      <p className="mt-2 font-semibold text-slate-900">{comanda.sala}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Mesa</p>
                      <p className="mt-2 font-semibold text-slate-900">{comanda.mesa}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Fecha</p>
                      <p className="mt-2 font-semibold text-slate-900">{formatearFecha(comanda.fecha)}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Hora</p>
                      <p className="mt-2 font-semibold text-slate-900">{comanda.hora?.substring(0, 5)}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-600">{comanda.productos?.length || 0} producto(s)</p>
                    <p className="text-lg font-black text-slate-900">${comanda.total}</p>
                  </div>
                </button>
              );
            })
          )}
        </section>

        <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          {selectedComanda ? (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Pedido #{selectedComanda.id_pedido}</p>
                  <h3 className="mt-2 text-2xl font-black text-slate-900">{origenMap[selectedComanda.origen] || selectedComanda.origen}</h3>
                </div>
                <span className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${estadosConfig[selectedComanda.estado]?.bg || 'bg-slate-100'} ${estadosConfig[selectedComanda.estado]?.text || 'text-slate-800'}`}>{estadosConfig[selectedComanda.estado]?.label || selectedComanda.estado}</span>
              </div>

              <div className="mt-6 grid gap-4">
                <div className="rounded-3xl bg-amber-50 p-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-amber-600">Cliente</p>
                  <p className="mt-2 font-semibold text-slate-900">{selectedComanda.cliente?.nombre || 'Cliente presencial'}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Sala / Mesa</p>
                  <p className="mt-2 font-semibold text-slate-900">{selectedComanda.sala} · {selectedComanda.mesa}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Fecha y hora</p>
                  <p className="mt-2 font-semibold text-slate-900">{formatearFecha(selectedComanda.fecha)} · {selectedComanda.hora?.substring(0, 5)}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Total</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">${selectedComanda.total}</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Observaciones</p>
                <p className="mt-3 text-slate-700">{selectedComanda.observaciones || 'Sin observaciones'}</p>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Productos</p>
                  <ul className="mt-4 space-y-3">
                    {selectedComanda.productos?.map((item) => (
                      <li key={item.id} className="rounded-3xl bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">{item.producto_nombre}</p>
                            <p className="text-sm text-slate-500">Cantidad: {item.cantidad}</p>
                          </div>
                          <p className="font-semibold text-slate-900">${item.subtotal}</p>
                        </div>
                        {item.observaciones && <p className="mt-3 text-sm text-slate-500">{item.observaciones}</p>}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-3">
                  {['pendiente', 'confirmado'].includes(selectedComanda.estado) && (
                    <button onClick={() => handleAccion(selectedComanda.id_pedido, selectedComanda.estado)} disabled={accionLoading} className="w-full rounded-2xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60">
                      {accionLoading ? 'Procesando...' : 'Iniciar preparación'}
                    </button>
                  )}

                  {selectedComanda.estado === 'en_preparacion' && (
                    <button onClick={() => handleAccion(selectedComanda.id_pedido, selectedComanda.estado)} disabled={accionLoading} className="w-full rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60">
                      {accionLoading ? 'Procesando...' : 'Marcar como lista'}
                    </button>
                  )}

                  {selectedComanda.estado === 'lista' && (
                    <div className="rounded-3xl bg-emerald-50 p-4 text-center font-semibold text-emerald-900">Lista para recoger</div>
                  )}

                  {['cancelado', 'entregada'].includes(selectedComanda.estado) && (
                    <div className="rounded-3xl bg-slate-50 p-4 text-center font-semibold text-slate-700">Sin acciones disponibles</div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex min-h-[360px] items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">Selecciona una comanda para ver su detalle.</div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default ComandasCocina;
