import React, { useEffect, useState } from 'react';
import { puntosService } from '../../services/puntosService';

const PuntosCliente = () => {
  const [data, setData] = useState({ saldo: 0, historial: [], productos_canjeables: [] });
  const [mensaje, setMensaje] = useState('');

  const cargar = async () => {
    const res = await puntosService.cliente();
    setData(res.data);
  };

  useEffect(() => { cargar().catch(() => setMensaje('No se pudo cargar tu programa de puntos.')); }, []);

  const canjear = async (producto) => {
    try {
      await puntosService.canjear(producto.id, 1);
      setMensaje(`Canje registrado: ${producto.nombre}.`);
      cargar();
    } catch (err) {
      setMensaje(err.response?.data?.error || 'No se pudo realizar el canje.');
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 md:p-8">
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-amber-700">CU33</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">Mis puntos</h1>
        <p className="mt-3 text-5xl font-black text-indigo-700">{data.saldo}</p>
      </div>
      {mensaje && <div className="rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800">{mensaje}</div>}
      <section>
        <h2 className="mb-3 text-xl font-black text-slate-900">Productos para canjear</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {(data.productos_canjeables || []).map((p) => (
            <article key={p.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-black text-slate-900">{p.nombre}</h3>
              <p className="text-sm text-slate-500">Stock {p.stock} · Bs {p.precio}</p>
              <p className="mt-3 text-lg font-black text-amber-700">{p.puntos} puntos</p>
              <button disabled={data.saldo < p.puntos || p.stock <= 0} onClick={() => canjear(p)} className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2 font-bold text-white disabled:bg-slate-300">Canjear</button>
            </article>
          ))}
        </div>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-xl font-black text-slate-900">Historial</h2>
        {(data.historial || []).map((m) => <div key={m.id} className="flex justify-between border-t py-3 text-sm"><span>{m.descripcion || m.tipo}</span><b>{m.puntos} pts</b></div>)}
        {(!data.historial || data.historial.length === 0) && <p className="text-slate-500">Todavía no tienes movimientos.</p>}
      </section>
    </div>
  );
};

export default PuntosCliente;
