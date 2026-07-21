import React, { useEffect, useState } from 'react';
import { cuponesService } from '../../services/cuponesService';

const inicial = { codigo: '', descripcion: '', tipo_descuento: 'porcentaje', valor_descuento: '', fecha_vencimiento: '', limite_usos: 1, activo: true };

const GestionCupones = () => {
  const [cupones, setCupones] = useState([]);
  const [form, setForm] = useState(inicial);
  const [editando, setEditando] = useState(null);
  const [mostrar, setMostrar] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const cargar = async () => {
    const res = await cuponesService.getAll();
    setCupones(Array.isArray(res.data) ? res.data : res.data.results || []);
  };

  useEffect(() => { cargar().catch(() => setMensaje('No se pudieron cargar los cupones.')); }, []);

  const guardar = async (e) => {
    e.preventDefault();
    const data = { ...form, codigo: form.codigo.toUpperCase().trim(), valor_descuento: Number(form.valor_descuento), limite_usos: Number(form.limite_usos || 1), fecha_vencimiento: form.fecha_vencimiento || null };
    if (editando) await cuponesService.update(editando, data);
    else await cuponesService.create(data);
    setForm(inicial); setEditando(null); setMostrar(false); setMensaje('Cupón guardado correctamente.'); cargar();
  };

  const editar = (c) => {
    setForm({ ...c, fecha_vencimiento: c.fecha_vencimiento || '' });
    setEditando(c.id);
    setMostrar(true);
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar cupón?')) return;
    await cuponesService.delete(id);
    cargar();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-amber-700">CU31</p>
          <h2 className="text-xl font-black text-slate-900">Gestión de Cupones</h2>
        </div>
        <button onClick={() => { setMostrar(!mostrar); setEditando(null); setForm(inicial); }} className="rounded-lg bg-indigo-600 px-4 py-2 font-bold text-white">{mostrar ? 'Cancelar' : '+ Nuevo Cupón'}</button>
      </div>
      {mensaje && <div className="rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800">{mensaje}</div>}
      {mostrar && (
        <form onSubmit={guardar} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 md:grid-cols-3">
          <input required placeholder="Código" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} className="rounded border p-2" />
          <select value={form.tipo_descuento} onChange={(e) => setForm({ ...form, tipo_descuento: e.target.value })} className="rounded border p-2">
            <option value="porcentaje">Porcentaje</option>
            <option value="monto_fijo">Monto fijo</option>
          </select>
          <input required type="number" min="0" step="0.01" placeholder="Valor" value={form.valor_descuento} onChange={(e) => setForm({ ...form, valor_descuento: e.target.value })} className="rounded border p-2" />
          <input type="date" value={form.fecha_vencimiento} onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })} className="rounded border p-2" />
          <input type="number" min="1" value={form.limite_usos} onChange={(e) => setForm({ ...form, limite_usos: e.target.value })} className="rounded border p-2" />
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} /> Activo</label>
          <input placeholder="Descripción" value={form.descripcion || ''} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="rounded border p-2 md:col-span-3" />
          <button className="rounded bg-emerald-600 px-4 py-2 font-bold text-white md:col-span-3">Guardar Cupón</button>
        </form>
      )}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50 text-sm text-slate-500"><tr><th className="p-4">Código</th><th>Descuento</th><th>Uso</th><th>Estado</th><th className="text-right pr-4">Acciones</th></tr></thead>
          <tbody>
            {cupones.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-4 font-black">{c.codigo}</td>
                <td>{c.tipo_descuento === 'porcentaje' ? `${c.valor_descuento}%` : `Bs ${c.valor_descuento}`}</td>
                <td>{c.usos_actuales}/{c.limite_usos}</td>
                <td>{c.activo ? 'Activo' : 'Inactivo'}</td>
                <td className="space-x-3 p-4 text-right"><button onClick={() => editar(c)} className="font-bold text-indigo-600">Editar</button><button onClick={() => eliminar(c.id)} className="font-bold text-red-600">Eliminar</button></td>
              </tr>
            ))}
            {cupones.length === 0 && <tr><td colSpan="5" className="p-6 text-center text-slate-500">No hay cupones registrados.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionCupones;
