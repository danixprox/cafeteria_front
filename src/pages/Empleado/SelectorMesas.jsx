import React from 'react';

const estadoConfig = {
  disponible: {
    label: 'Libre',
    dot: 'bg-emerald-500',
    card: 'border-emerald-200 bg-emerald-50 hover:border-emerald-400 hover:shadow-md cursor-pointer',
    text: 'text-emerald-700',
  },
  ocupada: {
    label: 'Ocupada',
    dot: 'bg-red-500',
    card: 'border-red-200 bg-red-50 hover:border-red-300 hover:shadow-sm cursor-pointer',
    text: 'text-red-700',
  },
  reservada: {
    label: 'Reservada',
    dot: 'bg-amber-500',
    card: 'border-amber-200 bg-amber-50 opacity-60 cursor-not-allowed',
    text: 'text-amber-700',
  },
  atendida: {
    label: 'Con pedido',
    dot: 'bg-blue-500',
    card: 'border-blue-200 bg-blue-50 hover:border-blue-400 hover:shadow-md cursor-pointer',
    text: 'text-blue-700',
  },
};

const SelectorMesas = ({ mesas, sala, onSeleccionar }) => {
  const mesasActivas = mesas.filter(m => m.activa);

  if (mesasActivas.length === 0) {
    return (
      <p className="py-10 text-center text-slate-400">
        No hay mesas activas para <strong>{sala?.nombre}</strong>.
      </p>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-slate-500">
        Sala: <strong>{sala?.nombre}</strong>. Las mesas <span className="text-emerald-700 font-semibold">libres</span>,{' '}
        <span className="text-red-700 font-semibold">ocupadas</span> y{' '}
        <span className="text-blue-700 font-semibold">con pedido</span> pueden recibir un nuevo pedido.
        Las <span className="text-amber-700 font-semibold">reservadas</span> están bloqueadas.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mesasActivas.map(mesa => {
          const cfg = estadoConfig[mesa.estado] || estadoConfig.disponible;
          const clickable = mesa.estado !== 'reservada';

          return (
            <button
              key={mesa.id}
              onClick={() => clickable && onSeleccionar(mesa)}
              disabled={!clickable}
              className={`rounded-3xl border p-5 text-left transition-all ${cfg.card}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-lg font-bold text-slate-900">{mesa.nombre}</span>
                <span className={`h-3 w-3 rounded-full ${cfg.dot}`} />
              </div>
              <p className="text-sm text-slate-600">Capacidad: {mesa.capacidad} personas</p>
              <p className={`mt-2 text-xs font-semibold ${cfg.text}`}>{cfg.label}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SelectorMesas;
