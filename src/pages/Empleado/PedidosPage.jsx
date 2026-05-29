import React, { useState } from 'react';
import PanelPedidosNormales from './PanelPedidosNormales';
import PanelPreordenes from './PanelPreordenes';

const TABS = [
  { id: 'normales',   label: 'Pedidos normales', icon: '🧾' },
  { id: 'preordenes', label: 'Preórdenes',        icon: '📋' },
];

const PedidosPage = () => {
  const [tab, setTab] = useState('normales');

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

      {tab === 'normales'   && <PanelPedidosNormales />}
      {tab === 'preordenes' && <PanelPreordenes />}
    </div>
  );
};

export default PedidosPage;
