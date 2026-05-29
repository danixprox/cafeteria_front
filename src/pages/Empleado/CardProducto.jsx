import React, { useState } from 'react';

const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const CardProducto = ({ producto, cantidadEnCarrito, onAgregar }) => {
  const [cantidad, setCantidad] = useState(1);
  const [error, setError] = useState('');

  // stock_disponible viene del backend (stock - stock_reservado); fallback a stock
  const stockBase = producto.stock_disponible ?? producto.stock;
  const stockRestante = stockBase - cantidadEnCarrito;
  const agotado = stockRestante <= 0;

  const handleAgregar = () => {
    if (agotado) return;
    if (cantidad <= 0) {
      setError('Ingresa una cantidad válida');
      return;
    }
    if (cantidad > stockRestante) {
      setError(`Máximo disponible: ${stockRestante}`);
      setTimeout(() => setError(''), 3000);
      return;
    }
    onAgregar(producto, cantidad);
    setCantidad(1);
    setError('');
  };

  const cambiarCantidad = (val) => {
    const v = Math.min(stockRestante, Math.max(1, val));
    setCantidad(v);
    setError('');
  };

  return (
    <div className={`rounded-3xl border p-4 transition-all ${
      agotado
        ? 'border-slate-200 bg-slate-50 opacity-55'
        : 'border-slate-200 bg-white hover:border-amber-300 hover:shadow-sm'
    }`}>
      {/* Imagen + info */}
      <div className="flex gap-3">
        {producto.imagen ? (
          <img
            src={`${BACKEND}${producto.imagen}`}
            alt={producto.nombre}
            className="h-16 w-16 flex-shrink-0 rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
            ☕
          </div>
        )}
        <div className="min-w-0 flex-1">
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
            {producto.categoria_nombre}
          </span>
          <p className="mt-1 text-sm font-bold leading-tight text-slate-900">{producto.nombre}</p>
          <p className="text-sm font-semibold text-amber-700">
            Bs. {parseFloat(producto.precio).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Stock y controles */}
      <div className="mt-3">
        <p className={`mb-2 text-xs font-semibold ${
          agotado
            ? 'text-red-600'
            : stockRestante <= 3
            ? 'text-amber-600'
            : 'text-emerald-600'
        }`}>
          {agotado
            ? `Máximo en carrito (stock: ${producto.stock})`
            : `Stock disponible: ${stockRestante}`}
        </p>

        {!agotado && (
          <div className="flex items-center gap-2">
            <div className="flex overflow-hidden rounded-xl border border-slate-200">
              <button
                onClick={() => cambiarCantidad(cantidad - 1)}
                className="px-2.5 py-1 text-sm font-bold text-slate-600 transition hover:bg-slate-100"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                max={stockRestante}
                value={cantidad}
                onChange={e => cambiarCantidad(parseInt(e.target.value) || 1)}
                className="w-10 border-none py-1 text-center text-sm text-slate-900 outline-none"
              />
              <button
                onClick={() => cambiarCantidad(cantidad + 1)}
                className="px-2.5 py-1 text-sm font-bold text-slate-600 transition hover:bg-slate-100"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAgregar}
              className="flex-1 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-amber-700"
            >
              Agregar
            </button>
          </div>
        )}

        {cantidadEnCarrito > 0 && (
          <p className="mt-1 text-xs text-blue-600 font-medium">
            {cantidadEnCarrito} en el pedido
          </p>
        )}

        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
};

export default CardProducto;
