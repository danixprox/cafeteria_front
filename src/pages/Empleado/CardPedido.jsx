import { useState } from 'react';
import pedidosService from '../../services/pedidosService';

const ESTADO_CFG = {
  pendiente:      { label: 'Pendiente',       badge: 'bg-slate-100 text-slate-600',     dot: 'bg-slate-400'    },
  confirmado:     { label: 'Confirmado',      badge: 'bg-amber-100 text-amber-700',     dot: 'bg-amber-500'    },
  con_pedido:     { label: 'Confirmado',      badge: 'bg-amber-100 text-amber-700',     dot: 'bg-amber-500'    },
  en_preparacion: { label: 'En preparación', badge: 'bg-blue-100 text-blue-700',       dot: 'bg-blue-500'     },
  lista:          { label: 'Lista',           badge: 'bg-violet-100 text-violet-700',   dot: 'bg-violet-500'   },
  entregada:      { label: 'Entregada',       badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500'  },
  cancelado:      { label: 'Cancelado',       badge: 'bg-red-100 text-red-600',         dot: 'bg-red-400'      },
};

const CardPedido = ({ pedido, onRecargar }) => {
  const [accionCargando, setAccionCargando] = useState(false);
  const [estadoLocal, setEstadoLocal] = useState(pedido.estado);
  const cfg          = ESTADO_CFG[estadoLocal] || ESTADO_CFG.confirmado;
  const desdePreorden = Boolean(pedido.reserva_id);

  const mostrarBotonEntregado = estadoLocal === 'lista';
  const mostrarBotonCancelar = estadoLocal === 'pendiente' || estadoLocal === 'confirmado';

  return (
    <div className="rounded-3xl ring-1 ring-slate-200 bg-white flex flex-col overflow-hidden shadow-sm">

      {/* Cabecera */}
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
        <div>
          <p className="text-lg font-bold text-slate-900 leading-tight">
            {pedido.sala_nombre || '—'}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <p className="text-xs text-slate-400">Pedido #{pedido.id}</p>
            {desdePreorden && (
              <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-xs font-semibold text-indigo-600">
                Via Preorden
              </span>
            )}
          </div>
        </div>
        <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shrink-0 ${cfg.badge}`}>
          <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      </div>

      {/* Sala / Mesa */}
      <div className="mx-5 mb-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200/60">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Ubicación</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          <div>
            <p className="text-xs text-slate-400">Sala</p>
            <p className="font-semibold text-slate-800">{pedido.sala_nombre || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Mesa</p>
            <p className="font-semibold text-slate-800">{pedido.mesa_nombre || '—'}</p>
          </div>
        </div>
      </div>

      <div className="mx-5 mb-3 rounded-2xl bg-amber-50 px-4 py-3 ring-1 ring-amber-100">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Cliente</p>
        <p className="mt-1 font-semibold text-slate-900">{pedido.cliente_nombre || 'Cliente presencial'}</p>
      </div>

      {/* Productos */}
      <div className="px-5 mb-3">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Productos</p>
        <div className="space-y-2">
          {pedido.detalles?.map(d => (
            <div key={d.id} className="flex items-start justify-between gap-3 text-sm">
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-slate-800">{d.cantidad}×</span>
                {' '}
                <span className="text-slate-700">{d.producto_nombre}</span>
                {d.producto_categoria && (
                  <span className="ml-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                    {d.producto_categoria}
                  </span>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-slate-900">
                  Bs. {parseFloat(d.subtotal).toFixed(2)}
                </p>
                <p className="text-xs text-slate-400">
                  Bs. {parseFloat(d.precio_unitario).toFixed(2)} c/u
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notas */}
      {pedido.notas && (
        <div className="mx-5 mb-3 rounded-2xl bg-slate-50/60 px-4 py-2">
          <p className="text-xs text-slate-500 italic">"{pedido.notas}"</p>
        </div>
      )}

      {/* Total */}
      <div className="mx-5 mb-5 mt-auto flex items-center justify-between border-t border-slate-200/60 pt-3">
        <span className="text-sm font-semibold text-slate-500">Total</span>
        <span className="text-xl font-black text-slate-900">
          Bs. {parseFloat(pedido.total).toFixed(2)}
        </span>
      </div>

        {(mostrarBotonEntregado || mostrarBotonCancelar) && (
          <div className="mx-5 mb-5 flex flex-wrap gap-3">
            {mostrarBotonEntregado && (
              <button
                type="button"
                disabled={accionCargando}
                onClick={async () => {
                  setAccionCargando(true);
                  try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                      alert('No autenticado. Inicia sesión.');
                      return;
                    }
                    await pedidosService.marcarEntregado(pedido.id);
                    // actualizar estado localmente para feedback inmediato
                    setEstadoLocal('entregada');
                    // intentar recargar la lista superior
                    onRecargar?.();
                  } catch (err) {
                    const msg = err.response?.data?.error || err.message || 'Error al marcar entregado';
                    alert(msg);
                  } finally {
                    setAccionCargando(false);
                  }
                }}
                className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50 ${estadoLocal==='entregada' ? 'bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                {estadoLocal==='entregada' ? 'Entregado' : 'Marcar entregado'}
              </button>
            )}

            {mostrarBotonCancelar && (
              <button
                type="button"
                disabled={accionCargando}
                onClick={async () => {
                  setAccionCargando(true);
                  try {
                    await pedidosService.cancelarPedido(pedido.id);
                    onRecargar?.();
                  } finally {
                    setAccionCargando(false);
                  }
                }}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                Cancelar pedido
              </button>
            )}
          </div>
        )}
    </div>
  );
};

export default CardPedido;
