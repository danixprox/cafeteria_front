import React from 'react';

const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const dispBadge = {
  disponible:    'bg-emerald-100 text-emerald-700',
  no_disponible: 'bg-slate-100 text-slate-600',
  mantenimiento: 'bg-orange-100 text-orange-700',
  reservada:     'bg-amber-100 text-amber-700',
};

const SelectorSalas = ({ salas, onSeleccionar }) => {
  const salasHabilitadas = salas.filter(s => s.habilitada);

  if (salasHabilitadas.length === 0) {
    return (
      <p className="py-10 text-center text-slate-400">
        No hay salas habilitadas disponibles.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {salasHabilitadas.map(sala => (
        <button
          key={sala.id}
          onClick={() => onSeleccionar(sala)}
          className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left transition-all hover:border-amber-400 hover:bg-amber-50 hover:shadow-md group"
        >
          {sala.imagen_principal && (
            <div className="mb-3 overflow-hidden rounded-2xl">
              <img
                src={`${BACKEND}${sala.imagen_principal}`}
                alt={sala.nombre}
                className="h-28 w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          )}
          <p className="text-lg font-bold text-slate-900">{sala.nombre}</p>
          <p className="mt-0.5 text-sm text-slate-500">{sala.tematica}</p>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${dispBadge[sala.disponibilidad] || 'bg-slate-100 text-slate-600'}`}>
              {sala.disponibilidad?.replace('_', ' ')}
            </span>
            <span className="text-xs text-slate-400">Cap. {sala.capacidad_total}</span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default SelectorSalas;
