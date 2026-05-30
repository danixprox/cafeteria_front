import CardPedido from './CardPedido';

const PanelPedidos = ({ pedidos, cargando, onRecargar }) => (
  <section className="rounded-[2rem] bg-white p-8 shadow-lg ring-1 ring-slate-200">

    {/* Cabecera */}
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-amber-700">Mesero</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Pedidos</h2>
        <p className="mt-1 text-sm text-slate-500">
          Pedidos directos registrados desde esta sesión.
        </p>
      </div>
      <button
        onClick={onRecargar}
        disabled={cargando}
        className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
      >
        <span className={cargando ? 'animate-spin' : ''}>↻</span>
        Actualizar
      </button>
    </div>

    {/* Contenido */}
    {cargando ? (
      <div className="py-16 text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
        <p className="text-sm text-slate-400">Cargando pedidos...</p>
      </div>
    ) : pedidos.length === 0 ? (
      <div className="py-16 text-center">
        <p className="text-4xl mb-3">📑</p>
        <p className="text-slate-500 font-medium">No hay pedidos registrados por el momento.</p>
        <p className="mt-2 text-sm text-slate-400">
          Aquí se visualizarán los pedidos confirmados desde "Tomar pedidos".
        </p>
      </div>
    ) : (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {pedidos.map(p => (
          <CardPedido key={p.id} pedido={p} />
        ))}
      </div>
    )}
  </section>
);

export default PanelPedidos;
