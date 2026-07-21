import React, { useEffect, useMemo, useState } from 'react';
import { combosService } from '../../services/combosService';
import { productosService } from '../../services/productosService';

const inicial = { nombre: '', descripcion: '', precio_especial: '', estado: true, fecha_inicio: '', fecha_fin: '', detalles: [] };

const GestionCombos = () => {
  const [combos, setCombos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState(inicial);
  const [editando, setEditando] = useState(null);
  const [mostrar, setMostrar] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const cargar = async () => {
    const [comboRes, prodRes] = await Promise.all([combosService.getAll(), productosService.getAll()]);
    setCombos(Array.isArray(comboRes.data) ? comboRes.data : comboRes.data.results || []);
    setProductos(Array.isArray(prodRes.data) ? prodRes.data : prodRes.data.results || []);
  };

  useEffect(() => { cargar().catch(() => setMensaje('No se pudieron cargar los combos.')); }, []);

  const precioNormal = useMemo(() => form.detalles.reduce((acc, d) => {
    const p = productos.find((item) => item.id === Number(d.producto));
    return acc + (p ? Number(p.precio) * Number(d.cantidad || 1) : 0);
  }, 0), [form.detalles, productos]);

  const setDetalle = (producto, cantidad) => {
    const id = Number(producto);
    setForm((prev) => {
      const otros = prev.detalles.filter((d) => Number(d.producto) !== id);
      return { ...prev, detalles: cantidad > 0 ? [...otros, { producto: id, cantidad: Number(cantidad) }] : otros };
    });
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (form.detalles.length < 2) { setMensaje('Selecciona al menos dos productos.'); return; }
    const data = { ...form, precio_especial: Number(form.precio_especial), fecha_inicio: form.fecha_inicio || null, fecha_fin: form.fecha_fin || null };
    if (editando) await combosService.update(editando, data);
    else await combosService.create(data);
    setForm(inicial); setEditando(null); setMostrar(false); setMensaje('Combo guardado correctamente.'); cargar();
  };

  const editar = (combo) => {
    setForm({ ...combo, fecha_inicio: combo.fecha_inicio || '', fecha_fin: combo.fecha_fin || '', detalles: combo.detalles.map((d) => ({ producto: d.producto, cantidad: d.cantidad })) });
    setEditando(combo.id);
    setMostrar(true);
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar combo?')) return;
    await combosService.delete(id);
    cargar();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-amber-700">CU32</p>
          <h2 className="text-xl font-black text-slate-900">Gestión de Combos</h2>
        </div>
        <button onClick={() => { setMostrar(!mostrar); setEditando(null); setForm(inicial); }} className="rounded-lg bg-indigo-600 px-4 py-2 font-bold text-white">{mostrar ? 'Cancelar' : '+ Nuevo Combo'}</button>
      </div>
      {mensaje && <div className="rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800">{mensaje}</div>}
      {mostrar && (
        <form onSubmit={guardar} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <input required placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="rounded border p-2" />
            <input required type="number" min="0" step="0.01" placeholder="Precio especial" value={form.precio_especial} onChange={(e) => setForm({ ...form, precio_especial: e.target.value })} className="rounded border p-2" />
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.checked })} /> Activo</label>
            <input type="date" value={form.fecha_inicio} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} className="rounded border p-2" />
            <input type="date" value={form.fecha_fin} onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })} className="rounded border p-2" />
            <input placeholder="Descripción" value={form.descripcion || ''} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="rounded border p-2" />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {productos.map((p) => {
              const det = form.detalles.find((d) => Number(d.producto) === p.id);
              return <label key={p.id} className="flex items-center justify-between gap-3 rounded border border-slate-200 p-3 text-sm"><span>{p.nombre} <b>Bs {p.precio}</b></span><input type="number" min="0" value={det?.cantidad || 0} onChange={(e) => setDetalle(p.id, e.target.value)} className="w-20 rounded border p-1" /></label>;
            })}
          </div>
          <div className="flex items-center justify-between"><span className="font-bold text-slate-700">Precio normal: Bs {precioNormal.toFixed(2)}</span><button className="rounded bg-emerald-600 px-4 py-2 font-bold text-white">Guardar Combo</button></div>
        </form>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {combos.map((combo) => (
          <article key={combo.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3"><div><h3 className="font-black text-slate-900">{combo.nombre}</h3><p className="text-sm text-slate-500">{combo.descripcion}</p></div><span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">Bs {combo.precio_especial}</span></div>
            <p className="mt-3 text-sm text-slate-600">Normal Bs {Number(combo.precio_normal).toFixed(2)} · Ahorro Bs {Number(combo.ahorro).toFixed(2)} · Stock {combo.stock_disponible}</p>
            <p className="mt-2 text-sm text-slate-500">{combo.detalles.map((d) => `${d.cantidad} x ${d.producto_nombre}`).join(' + ')}</p>
            <div className="mt-4 space-x-3 text-right"><button onClick={() => editar(combo)} className="font-bold text-indigo-600">Editar</button><button onClick={() => eliminar(combo.id)} className="font-bold text-red-600">Eliminar</button></div>
          </article>
        ))}
        {combos.length === 0 && <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500 md:col-span-2">No hay combos registrados.</div>}
      </div>
    </div>
  );
};

export default GestionCombos;
