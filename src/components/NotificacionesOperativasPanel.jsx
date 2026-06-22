import { Bell, CheckCheck, ChefHat, ClipboardList } from 'lucide-react';

const formatFecha = (fecha) => {
  if (!fecha) return '';
  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) return '';
  return valor.toLocaleString('es-BO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const NotificacionesOperativasPanel = ({
  notificaciones,
  noLeidas,
  cargando,
  onActualizar,
  onLeer,
  titulo = 'Avisos operativos',
  descripcion = 'Actualizaciones automáticas del servicio.',
}) => (
  <aside className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2 text-amber-700">
          <Bell size={18} />
          <p className="text-xs font-black uppercase tracking-[0.25em]">Notificaciones</p>
        </div>
        <h3 className="mt-2 text-xl font-black text-slate-900">{titulo}</h3>
        <p className="mt-1 text-sm text-slate-500">{descripcion}</p>
      </div>
      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-600">
        {noLeidas} {noLeidas === 1 ? 'nueva' : 'nuevas'}
      </span>
    </div>

    <button
      type="button"
      onClick={onActualizar}
      disabled={cargando}
      className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
    >
      {cargando ? 'Actualizando...' : 'Actualizar avisos'}
    </button>

    <div className="mt-4 max-h-[460px] space-y-3 overflow-y-auto pr-1">
      {!cargando && notificaciones.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
          <CheckCheck className="mx-auto text-emerald-500" size={28} />
          <p className="mt-3 font-semibold text-slate-700">Todo está al día</p>
          <p className="mt-1 text-xs text-slate-500">Los nuevos avisos aparecerán aquí.</p>
        </div>
      )}

      {notificaciones.map((n) => {
        const Icono = n.tipo === 'nuevo_pedido' ? ClipboardList : ChefHat;
        return (
          <button
            type="button"
            key={n.id}
            onClick={() => onLeer(n)}
            className={`w-full rounded-3xl border p-4 text-left transition ${
              n.leido
                ? 'border-slate-200 bg-white'
                : 'border-amber-200 bg-amber-50 shadow-sm'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className={`rounded-2xl p-2 ${n.leido ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'}`}>
                <Icono size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-slate-900">{n.titulo}</p>
                  {!n.leido && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />}
                </div>
                <p className="mt-1 text-sm leading-5 text-slate-600">{n.mensaje}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                  {n.pedido_id && <span>Pedido #{n.pedido_id}</span>}
                  {n.mesa && <span>· {n.mesa}</span>}
                  {formatFecha(n.fecha) && <span>· {formatFecha(n.fecha)}</span>}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  </aside>
);

export default NotificacionesOperativasPanel;
