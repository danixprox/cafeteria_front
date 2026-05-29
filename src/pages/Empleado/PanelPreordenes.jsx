import React, { useState, useEffect, useCallback } from 'react';
import preordenesService from '../../services/preordenesService';
import CardPreorden from './CardPreorden';

// 'pendiente' agrupa los estados programada + apartada (el mesero aún no actuó)
const FILTROS = [
  { id: 'todas',      label: 'Todas',      estados: null },
  { id: 'pendiente',  label: 'Pendientes', estados: ['programada', 'apartada'] },
  { id: 'sin_stock',  label: 'Sin stock',  estados: ['sin_stock'] },
  { id: 'con_pedido', label: 'Con pedido', estados: ['con_pedido'] },
  { id: 'entregada',  label: 'Entregadas', estados: ['entregada'] },
  { id: 'cancelada',  label: 'Canceladas', estados: ['cancelada'] },
];

const PanelPreordenes = () => {
  const [preordenes, setPreordenes]   = useState([]);
  const [filtro, setFiltro]           = useState('todas');
  const [cargando, setCargando]       = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError]             = useState('');
  const [exito, setExito]             = useState('');

  // ── Mensajes temporales ─────────────────────────────────────────────────
  const mostrarError = (msg) => { setError(msg); setTimeout(() => setError(''), 5000); };
  const mostrarExito = (msg) => { setExito(msg); setTimeout(() => setExito(''), 3000); };

  // ── Carga de datos ───────────────────────────────────────────────────────
  const cargarPreordenes = useCallback(async (silencioso = false) => {
    if (!silencioso) setCargando(true);
    else setActualizando(true);
    try {
      const res = await preordenesService.getAll();
      setPreordenes(Array.isArray(res.data) ? res.data : []);
      setError('');
    } catch (err) {
      // 403 es esperado antes de las 3PM — no es un error visible
      if (err.response?.status !== 403) {
        mostrarError('Error al cargar las preórdenes');
      }
      setPreordenes([]);
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, []);

  useEffect(() => { cargarPreordenes(); }, [cargarPreordenes]);

  // ── Acciones ─────────────────────────────────────────────────────────────
  const handleMarcarConPedido = async (id) => {
    try {
      await preordenesService.marcarConPedido(id);
      await cargarPreordenes(true);
      mostrarExito('Preorden marcada como "con pedido". Mesa actualizada.');
    } catch (err) {
      mostrarError(err.response?.data?.error || 'Error al procesar la preorden');
    }
  };

  const handleMarcarEntregada = async (id) => {
    try {
      await preordenesService.marcarEntregada(id);
      await cargarPreordenes(true);
      mostrarExito('Preorden marcada como entregada.');
    } catch (err) {
      mostrarError(err.response?.data?.error || 'Error al marcar como entregada');
    }
  };

  const handleCancelar = async (id) => {
    try {
      await preordenesService.cancelar(id);
      await cargarPreordenes(true);
      mostrarExito('Preorden cancelada. Stock liberado.');
    } catch (err) {
      mostrarError(err.response?.data?.error || 'Error al cancelar la preorden');
    }
  };

  // ── Filtrado ─────────────────────────────────────────────────────────────
  const filtroActual = FILTROS.find(f => f.id === filtro);
  const preordenesFiltradas = !filtroActual?.estados
    ? preordenes
    : preordenes.filter(p => filtroActual.estados.includes(p.estado));

  // ── Contadores por filtro ────────────────────────────────────────────────
  const contarFiltro = (f) => {
    if (!f.estados) return preordenes.length;
    return preordenes.filter(p => f.estados.includes(p.estado)).length;
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <section className="rounded-[2rem] bg-white p-8 shadow-lg ring-1 ring-slate-200">

      {/* ── Cabecera ── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">Reservas de hoy</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Preórdenes del día</h2>
          <p className="mt-1 text-sm text-slate-500">
            Pedidos anticipados de clientes con reserva para hoy.
            Visibles a partir de las <strong>3:00 PM</strong>.
          </p>
        </div>
        <button
          onClick={() => cargarPreordenes(true)}
          disabled={actualizando}
          className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
        >
          <span className={actualizando ? 'animate-spin' : ''}>↻</span>
          Actualizar
        </button>
      </div>

      {/* ── Mensajes ── */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {exito && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          ✓ {exito}
        </div>
      )}

      {/* ── Filtros ── */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {FILTROS.map(f => {
          const count = contarFiltro(f);
          return (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                filtro === f.id
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
              {count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-xs leading-none ${
                  filtro === f.id ? 'bg-white/30 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Contenido ── */}
      {cargando ? (
        <div className="py-16 text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
          <p className="text-sm text-slate-400">Cargando preórdenes...</p>
        </div>
      ) : preordenesFiltradas.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-slate-500 font-medium">
            {filtro === 'todas'
              ? 'No hay preórdenes para las reservas de hoy.'
              : `No hay preórdenes en "${filtroActual?.label}".`}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Las preórdenes aparecen aquí cuando los clientes las crean al reservar.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {preordenesFiltradas.map(p => (
            <CardPreorden
              key={p.id}
              preorden={p}
              onMarcarConPedido={handleMarcarConPedido}
              onMarcarEntregada={handleMarcarEntregada}
              onCancelar={handleCancelar}
            />
          ))}
        </div>
      )}

      {/* ── Nota informativa ── */}
      {!cargando && (
        <p className="mt-8 text-center text-xs text-slate-400">
          Las preórdenes son creadas por los clientes al realizar su reserva. El mesero solo las gestiona.
        </p>
      )}
    </section>
  );
};

export default PanelPreordenes;
