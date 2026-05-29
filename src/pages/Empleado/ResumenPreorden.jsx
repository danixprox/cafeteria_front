import React from 'react';

const ResumenPreorden = ({
  carrito,
  notas,
  onNotasChange,
  onActualizarCantidad,
  onEliminar,
  onConfirmar,
  confirmando,
  mesa,
  sala,
}) => {
  const items = Object.values(carrito);
  const total = items.reduce(
    (sum, item) => sum + parseFloat(item.producto.precio) * item.cantidad,
    0
  );

  return (
    <div className="sticky top-4 flex flex-col gap-4 rounded-3xl border border-amber-200 bg-amber-50 p-5">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
          Preorden
        </p>
        <h3 className="mt-1 text-lg font-bold text-slate-900">Resumen</h3>
        {sala && mesa && (
          <p className="text-xs text-slate-500">
            {sala.nombre} — {mesa.nombre}
          </p>
        )}
        <p className="mt-1 text-xs text-amber-700 font-medium">
          El stock quedará reservado hasta que confirmes o canceles.
        </p>
      </div>

      {/* Líneas del carrito */}
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">
          No hay productos seleccionados
        </p>
      ) : (
        <div className="space-y-3 overflow-y-auto max-h-[38vh]">
          {items.map(item => (
            <div
              key={item.producto.id}
              className="rounded-2xl border border-amber-200 bg-white p-3"
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
                <div className="flex overflow-hidden rounded-lg border border-amber-200">
                  <button
                    onClick={() => onActualizarCantidad(item.producto.id, item.cantidad - 1)}
                    className="px-2 py-0.5 text-xs font-bold text-slate-600 transition hover:bg-amber-100"
                  >
                    −
                  </button>
                  <span className="px-2 text-xs font-semibold text-slate-800">
                    {item.cantidad}
                  </span>
                  <button
                    onClick={() => onActualizarCantidad(item.producto.id, item.cantidad + 1)}
                    className="px-2 py-0.5 text-xs font-bold text-slate-600 transition hover:bg-amber-100"
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
      )}

      {/* Notas opcionales */}
      <div>
        <label className="text-xs font-semibold text-slate-600">Notas (opcional)</label>
        <textarea
          value={notas}
          onChange={e => onNotasChange(e.target.value)}
          placeholder="Ej: cliente llega a las 7pm, alergia a maní..."
          rows={2}
          className="mt-1 w-full resize-none rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200"
        />
      </div>

      {/* Total y confirmar */}
      <div className="mt-auto border-t border-amber-200 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-600">Total estimado</span>
          <span className="text-xl font-black text-slate-900">
            Bs. {total.toFixed(2)}
          </span>
        </div>

        <button
          onClick={onConfirmar}
          disabled={items.length === 0 || confirmando}
          className={`mt-4 w-full rounded-2xl py-3 text-sm font-bold transition ${
            items.length === 0 || confirmando
              ? 'cursor-not-allowed bg-slate-200 text-slate-400'
              : 'bg-amber-600 text-white shadow-lg shadow-amber-200 hover:bg-amber-700'
          }`}
        >
          {confirmando ? 'Apartando...' : 'Apartar Preorden'}
        </button>
      </div>
    </div>
  );
};

export default ResumenPreorden;
