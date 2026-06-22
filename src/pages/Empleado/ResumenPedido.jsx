import React, { useState } from 'react';

const ResumenPedido = ({
  carrito,
  onActualizarCantidad,
  onEliminar,
  onConfirmar,
  confirmando,
  mesa,
  sala,
  pedidoActivo,
  onPagar,
  pagando,
  onAplicarPromocion,
  onQuitarPromocion,
}) => {
  const [codigoPromo, setCodigoPromo] = useState('');

  const handlePromoSubmit = async (e) => {
    e.preventDefault();
    if (!codigoPromo.trim()) return;
    try {
      await onAplicarPromocion(codigoPromo.trim());
      setCodigoPromo('');
    } catch {
      return;
    }
  };
  const items = Object.values(carrito);
  const itemsConfirmados = items.filter(item => item.confirmado);
  const itemsPendientes = items.filter(item => !item.confirmado);

  const total = items.reduce(
    (sum, item) => sum + parseFloat(item.producto.precio) * item.cantidad,
    0
  );

  const totalPendientePagar = pedidoActivo ? parseFloat(pedidoActivo.total_pendiente) : 0.00;
  const tienePendientesConfirmar = itemsPendientes.length > 0;
  const puedeConfirmar = tienePendientesConfirmar && !confirmando;
  const puedePagar = items.length > 0 && !tienePendientesConfirmar && totalPendientePagar > 0 && !pagando;

  let motivoBloqueoPago = null;
  if (items.length === 0) {
    motivoBloqueoPago = "El pedido está vacío";
  } else if (tienePendientesConfirmar) {
    motivoBloqueoPago = "Confirma los productos pendientes antes de realizar el pago";
  } else if (totalPendientePagar <= 0) {
    motivoBloqueoPago = "El pedido ya está totalmente pagado";
  }

  return (
    <div className="sticky top-4 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
          Resumen del pedido
        </p>
        <h3 className="mt-1 text-lg font-bold text-slate-900">Carrito</h3>
        {sala && mesa && (
          <p className="text-xs text-slate-500">
            {sala.nombre} — {mesa.nombre}
          </p>
        )}
      </div>

      {/* Líneas del carrito */}
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">
          No hay productos seleccionados
        </p>
      ) : (
        <div className="space-y-4 overflow-y-auto max-h-[45vh] pr-1">
          {/* Pendientes de confirmar */}
          {itemsPendientes.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-600">
                Pendientes de confirmar ({itemsPendientes.length})
              </p>
              <div className="space-y-2">
                {itemsPendientes.map(item => (
                  <div
                    key={item.producto.id}
                    className="rounded-2xl border border-amber-200 bg-amber-50/30 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="flex-1 text-sm font-semibold leading-tight text-slate-900">
                        {item.producto.nombre}
                      </p>
                      <button
                        onClick={() => onEliminar(item.producto.id)}
                        className="flex-shrink-0 text-xs font-bold text-red-400 transition hover:text-red-600"
                        title="Eliminar"
                      >
                        ✕
                      </button>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      Bs. {parseFloat(item.producto.precio).toFixed(2)} × {item.cantidad}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      {/* Controles de cantidad */}
                      <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white">
                        <button
                          onClick={() => onActualizarCantidad(item.producto.id, item.cantidad - 1)}
                          className="px-2 py-0.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
                        >
                          −
                        </button>
                        <span className="px-2 text-xs font-semibold text-slate-800">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() => onActualizarCantidad(item.producto.id, item.cantidad + 1)}
                          className="px-2 py-0.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        Bs. {(parseFloat(item.producto.precio) * item.cantidad).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirmados */}
          {itemsConfirmados.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                Confirmados ({itemsConfirmados.length})
              </p>
              <div className="space-y-2">
                {itemsConfirmados.map(item => (
                  <div
                    key={item.producto.id}
                    className="rounded-2xl border border-slate-200 bg-white p-3 opacity-80"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="flex-1 text-sm font-semibold leading-tight text-slate-900">
                        {item.producto.nombre}
                      </p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        Confirmado
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      Bs. {parseFloat(item.producto.precio).toFixed(2)} × {item.cantidad}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-slate-400 italic">Bloqueado</span>
                      <p className="text-sm font-bold text-slate-900">
                        Bs. {(parseFloat(item.producto.precio) * item.cantidad).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {/* Sección de Promoción */}
      {pedidoActivo && (
        <div className="border-t border-slate-200 pt-4">
          {pedidoActivo.promocion ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 p-3.5 flex-wrap">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🏷️</span>
                <div>
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                    PROMO: {pedidoActivo.promocion_codigo}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-medium">
                    {pedidoActivo.promocion_nombre}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onQuitarPromocion}
                disabled={totalPendientePagar <= 0 || confirmando || pagando}
                className="rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-1.5 text-xs transition duration-200 flex items-center gap-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Quitar
              </button>
            </div>
          ) : (
            <form
              onSubmit={handlePromoSubmit}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Código de descuento"
                value={codigoPromo}
                onChange={(e) => setCodigoPromo(e.target.value.toUpperCase())}
                disabled={totalPendientePagar <= 0 || confirmando || pagando}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium uppercase tracking-wider text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition duration-200"
              />
              <button
                type="submit"
                disabled={!codigoPromo.trim() || totalPendientePagar <= 0 || confirmando || pagando}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 text-xs transition duration-200 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                Aplicar
              </button>
            </form>
          )}
        </div>
      )}

      {/* Totales y botones */}
      <div className="mt-auto border-t border-slate-200 pt-4 space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-medium">Subtotal general</span>
            <span className="text-sm font-semibold">Bs. {total.toFixed(2)}</span>
          </div>
          {pedidoActivo && parseFloat(pedidoActivo.descuento || 0) > 0 && (
            <>
              <div className="flex items-center justify-between text-emerald-600 font-medium">
                <span className="text-xs">Descuento</span>
                <span className="text-sm">- Bs. {parseFloat(pedidoActivo.descuento).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 font-medium">
                <span className="text-xs">Total con descuento</span>
                <span className="text-sm">Bs. {parseFloat(pedidoActivo.total).toFixed(2)}</span>
              </div>
            </>
          )}
          {pedidoActivo && parseFloat(pedidoActivo.total_pagado || 0) > 0 && (
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-xs font-medium">Total pagado</span>
              <span className="text-sm font-semibold text-emerald-600">Bs. {parseFloat(pedidoActivo.total_pagado).toFixed(2)}</span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-2">
            <span className="text-sm font-bold text-slate-800">Total por pagar</span>
            <span className="text-xl font-black text-slate-950">
              Bs. {totalPendientePagar.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Warning message if payment is blocked */}
        {motivoBloqueoPago && tienePendientesConfirmar && (
          <p className="rounded-xl bg-amber-50 p-2.5 text-center text-xs font-medium text-amber-700 border border-amber-100">
            ⚠ {motivoBloqueoPago}
          </p>
        )}

        <div className="flex flex-col gap-2">
          {/* Botón Confirmar Pedido */}
          <button
            onClick={onConfirmar}
            disabled={!puedeConfirmar}
            className={`w-full rounded-2xl py-3 text-sm font-bold transition flex items-center justify-center gap-2 ${
              !puedeConfirmar
                ? 'cursor-not-allowed bg-slate-200 text-slate-400'
                : 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700'
            }`}
          >
            {confirmando ? 'Confirmando...' : 'Confirmar Pedido'}
          </button>

          {/* Botón Pagar */}
          <button
            onClick={onPagar}
            disabled={!puedePagar}
            className={`w-full rounded-2xl py-3 text-sm font-bold transition flex items-center justify-center gap-2 ${
              !puedePagar
                ? 'cursor-not-allowed bg-slate-200 text-slate-400'
                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700'
            }`}
          >
            {pagando ? 'Procesando...' : 'Pagar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumenPedido;
