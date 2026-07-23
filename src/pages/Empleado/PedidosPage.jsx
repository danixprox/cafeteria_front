import { useCallback, useEffect, useState } from 'react';
import NotificacionesOperativasPanel from '../../Components/NotificacionesOperativasPanel';
import useNotificacionesOperativas from '../../hooks/useNotificacionesOperativas';
import pedidosService from '../../services/pedidosService';
import PanelPedidos from './PanelPedidos';
import PanelPedidosNormales from './PanelPedidosNormales';
import PanelPreordenes from './PanelPreordenes';

const TABS = [
  { id: 'normales', label: 'Tomar pedidos', icon: '🧾' },
  { id: 'pedidos', label: 'Pedidos', icon: '📑' },
  { id: 'preordenes', label: 'Preórdenes', icon: '📋' },
];

const PedidosPage = () => {
  const [tab, setTab] = useState('normales');
  const [pedidos, setPedidos] = useState([]);
  const [cargandoPedidos, setCargando] = useState(false);
  const notificaciones = useNotificacionesOperativas();

  const cargarPedidos = useCallback(async () => {
    setCargando(true);
    try {
      const res = await pedidosService.getAll();
      const todos = Array.isArray(res.data) ? res.data : [];
      setPedidos(todos.sort((a, b) => b.id - a.id));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const inicial = setTimeout(cargarPedidos, 0);
    return () => clearTimeout(inicial);
  }, [cargarPedidos]);

  const refrescarTodo = () => {
    cargarPedidos();
    notificaciones.cargar();
  };

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <NotificacionesOperativasPanel
        notificaciones={notificaciones.notificaciones}
        noLeidas={notificaciones.noLeidas}
        cargando={notificaciones.cargando}
        onActualizar={notificaciones.cargar}
        onLeer={notificaciones.marcarLeida}
        titulo="Avisos de cocina"
        descripcion="Te avisaremos aquí cuando un pedido esté listo para recoger."
      />

      <div className="min-w-0 space-y-6">
        <div className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-2xl bg-slate-100 p-1">
          {TABS.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
                tab === item.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {tab === 'normales' && <PanelPedidosNormales onPedidoCreado={refrescarTodo} />}
        {tab === 'pedidos' && (
          <PanelPedidos
            pedidos={pedidos}
            cargando={cargandoPedidos}
            onRecargar={refrescarTodo}
          />
        )}
        {tab === 'preordenes' && <PanelPreordenes />}
      </div>
    </div>
  );
};

export default PedidosPage;
