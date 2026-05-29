import React, { useMemo } from 'react';
import CardProducto from './CardProducto';

const CatalogoProductos = ({ productos, carrito, onAgregarAlCarrito }) => {
  const porCategoria = useMemo(() => {
    return productos.reduce((acc, p) => {
      const cat = p.categoria_nombre || 'Sin categoría';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(p);
      return acc;
    }, {});
  }, [productos]);

  if (Object.keys(porCategoria).length === 0) {
    return (
      <p className="py-10 text-center text-slate-400">
        No hay productos disponibles en este momento.
      </p>
    );
  }

  return (
    <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-1">
      {Object.entries(porCategoria).map(([categoria, prods]) => (
        <div key={categoria}>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-amber-700">
            {categoria}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {prods.map(p => (
              <CardProducto
                key={p.id}
                producto={p}
                cantidadEnCarrito={carrito[p.id]?.cantidad || 0}
                onAgregar={onAgregarAlCarrito}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CatalogoProductos;
