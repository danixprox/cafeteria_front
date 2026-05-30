const ESTADO_CFG = {
  programada: {
    label: 'Programada',
    badge: 'bg-slate-100 text-slate-600',
    dot:   'bg-slate-400',
    ring:  'ring-slate-200',
    bg:    'bg-slate-50',
  },
  apartada: {
    label: 'Apartada',
    badge: 'bg-amber-100 text-amber-700',
    dot:   'bg-amber-500',
    ring:  'ring-amber-200',
    bg:    'bg-amber-50',
  },
  con_pedido: {
    label: 'Confirmado',
    badge: 'bg-amber-100 text-amber-700',
    dot:   'bg-amber-500',
    ring:  'ring-amber-200',
    bg:    'bg-amber-50',
  },
  sin_stock: {
    label: 'Sin stock',
    badge: 'bg-orange-100 text-orange-700',
    dot:   'bg-orange-500',
    ring:  'ring-orange-300',
    bg:    'bg-orange-50',
  },
  cancelada: {
    label: 'Cancelada',
    badge: 'bg-red-100 text-red-600',
    dot:   'bg-red-400',
    ring:  'ring-red-200',
    bg:    'bg-red-50',
  },
  entregada: {
    label: 'Entregada',
    badge: 'bg-emerald-100 text-emerald-700',
    dot:   'bg-emerald-500',
    ring:  'ring-emerald-200',
    bg:    'bg-emerald-50',
  },
};

const fmtHora  = (h) => (h ? h.slice(0, 5) : '—');
const fmtFecha = (f) => {
  if (!f) return '—';
  const [y, m, d] = f.split('-');
  return `${d}/${m}/${y}`;
};

const CardPreorden = ({ preorden }) => {
  const cfg = ESTADO_CFG[preorden.estado] || ESTADO_CFG.programada;

  return (
    <div className={`rounded-3xl ring-1 ${cfg.ring} ${cfg.bg} flex flex-col overflow-hidden`}>

      {/* Cabecera */}
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
        <div>
          <p className="text-lg font-bold text-slate-900 leading-tight">
            {preorden.cliente_nombre || 'Cliente'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Preorden #{preorden.id}</p>
        </div>
        <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shrink-0 ${cfg.badge}`}>
          <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      </div>

      {/* Datos de reserva */}
      <div className="mx-5 mb-3 rounded-2xl bg-white/70 px-4 py-3 ring-1 ring-slate-200/60">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Reserva</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          <div>
            <p className="text-xs text-slate-400">Sala</p>
            <p className="font-semibold text-slate-800">{preorden.sala_nombre || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Mesa</p>
            <p className="font-semibold text-slate-800">{preorden.mesa_nombre || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Fecha</p>
            <p className="font-semibold text-slate-800">{fmtFecha(preorden.reserva_fecha)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Horario</p>
            <p className="font-semibold text-slate-800">
              {fmtHora(preorden.reserva_hora_inicio)} – {fmtHora(preorden.reserva_hora_fin)}
            </p>
          </div>
        </div>
      </div>

      {/* Productos */}
      <div className="px-5 mb-3">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Productos</p>
        <div className="space-y-2">
          {preorden.detalles?.map(d => (
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
                <p className="font-semibold text-slate-900">Bs. {parseFloat(d.subtotal).toFixed(2)}</p>
                <p className="text-xs text-slate-400">Bs. {parseFloat(d.precio_unitario).toFixed(2)} c/u</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notas */}
      {preorden.notas && (
        <div className="mx-5 mb-3 rounded-2xl bg-white/60 px-4 py-2">
          <p className="text-xs text-slate-500 italic">"{preorden.notas}"</p>
        </div>
      )}

      {/* Total */}
      <div className="mx-5 mb-5 flex items-center justify-between border-t border-slate-200/60 pt-3">
        <span className="text-sm font-semibold text-slate-500">Total estimado</span>
        <span className="text-xl font-black text-slate-900">
          Bs. {parseFloat(preorden.total).toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default CardPreorden;
