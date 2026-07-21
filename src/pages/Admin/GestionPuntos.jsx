import React, { useEffect, useState } from 'react';
import { puntosService } from '../../services/puntosService';

const GestionPuntos = () => {
  const [data, setData] = useState({ configuracion: { puntos_por_bs: 1, activo: true }, movimientos: [] });
  const [mensaje, setMensaje] = useState('');

  const cargar = async () => {
    const res = await puntosService.admin();
    setData(res.data);
  };

  useEffect(() => { cargar().catch(() => setMensaje('No se pudo cargar el programa de puntos.')); }, []);

  const guardar = async () => {
    await puntosService.configurar(data.configuracion);
    setMensaje('Configuración actualizada.');
    cargar();
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-amber-700">CU33</p>
        <h2 className="text-xl font-black text-slate-900">Programa de Puntos</h2>
      </div>
      {mensaje && <div className="rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800">{mensaje}</div>}
      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 md:grid-cols-3">
        <input type="number" min="1" value={data.configuracion?.puntos_por_bs || 1} onChange={(e) => setData({ ...data, configuracion: { ...data.configuracion, puntos_por_bs: Number(e.target.value) } })} className="rounded border p-2" />
        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={!!data.configuracion?.activo} onChange={(e) => setData({ ...data, configuracion: { ...data.configuracion, activo: e.target.checked } })} /> Programa activo</label>
        <button onClick={guardar} className="rounded bg-emerald-600 px-4 py-2 font-bold text-white">Guardar</button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50 text-sm text-slate-500"><tr><th className="p-4">Tipo</th><th>Puntos</th><th>Saldo</th><th>Detalle</th><th>Fecha</th></tr></thead>
          <tbody>
            {(data.movimientos || []).map((m) => <tr key={m.id} className="border-t"><td className="p-4">{m.tipo}</td><td>{m.puntos}</td><td>{m.saldo_resultante}</td><td>{m.descripcion || m.producto_nombre || m.pedido_codigo}</td><td>{new Date(m.created_at).toLocaleString('es-BO')}</td></tr>)}
            {(!data.movimientos || data.movimientos.length === 0) && <tr><td colSpan="5" className="p-6 text-center text-slate-500">Sin movimientos registrados.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionPuntos;
