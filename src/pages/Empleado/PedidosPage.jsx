import { useState, useEffect, useCallback } from 'react';
import PanelPedidosNormales from './PanelPedidosNormales';
import PanelPedidos from './PanelPedidos';
import PanelPreordenes from './PanelPreordenes';
import pedidosService from '../../services/pedidosService';

const TABS = [
  { id: 'normales',   label: 'Tomar pedidos', icon: '🧾' },
  { id: 'pedidos',    label: 'Pedidos',        icon: '📑' },
  { id: 'preordenes', label: 'Preórdenes',     icon: '📋' },
];

const PedidosPage = () => {
  const [tab, setTab]                   = useState('normales');
  const [pedidos, setPedidos]           = useState([]);
  const [cargandoPedidos, setCargando]  = useState(false);

  const cargarPedidos = useCallback(async () => {
    setCargando(true);
    try {
      const res = await pedidosService.getAll();
      const todos = Array.isArray(res.data) ? res.data : [];
      // Incluye pedidos directos (sin reserva) Y pedidos de check-in (con reserva)
      setPedidos(todos.sort((a, b) => b.id - a.id));
    } catch {
      // fallo silencioso: la lista queda vacía
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarPedidos(); }, [cargarPedidos]);

  return (
    <div className="space-y-6">
      {/* Barra de pestañas */}
      <div className="flex w-fit gap-1 rounded-2xl bg-slate-100 p-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
              tab === t.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'normales'   && (
        <PanelPedidosNormales onPedidoCreado={cargarPedidos} />
      )}
      {tab === 'pedidos'    && (
        <PanelPedidos
          pedidos={pedidos}
          cargando={cargandoPedidos}
          onRecargar={cargarPedidos}
        />
      )}
      {tab === 'preordenes' && <PanelPreordenes />}
    </div>
  );
};

export default PedidosPage;
