import React, { useState, useRef } from 'react';
import { History, Eye } from 'lucide-react';
import { obtenerHistorialPedidos, obtenerDetallePedido } from '../../services/historialPedidosService';
import { obtenerSugerenciasClientes } from '../../services/historialPedidosService';

const Badge = ({ estado }) => {
  const map = {
    pendiente: 'bg-slate-100 text-slate-700',
    confirmado: 'bg-amber-100 text-amber-700',
    en_preparacion: 'bg-indigo-100 text-indigo-700',
    lista: 'bg-emerald-100 text-emerald-700',
    entregada: 'bg-emerald-100 text-emerald-700',
    cancelado: 'bg-red-100 text-red-700',
  };
  return <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${map[estado]||'bg-slate-100 text-slate-700'}`}>{estado}</span>;
};

const AdminHistorialPedidos = () => {
  const [filtros, setFiltros] = useState({ fecha_inicio: '', fecha_fin: '', estado: '', cliente: '' });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [sugerencias, setSugerencias] = useState([]);
  const [sugerenciasVisible, setSugerenciasVisible] = useState(false);
  const debounceRef = useRef(null);

  const buscar = async () => {
    setLoading(true);
    try {
      const data = await obtenerHistorialPedidos(filtros);
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert('Error al obtener historial');
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = async (id) => {
    try {
      const d = await obtenerDetallePedido(id);
      setDetalle(d);
    } catch (err) {
      console.error(err);
      alert('Error al obtener detalle');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Historial de Pedidos</h2>
        <button onClick={buscar} className="rounded-full bg-amber-500 px-4 py-2 text-white">Buscar</button>
      </div>

      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 flex gap-2 flex-wrap">
        <input type="date" value={filtros.fecha_inicio} onChange={(e)=>setFiltros({...filtros, fecha_inicio: e.target.value})} className="border rounded-2xl px-3 py-2" />
        <input type="date" value={filtros.fecha_fin} onChange={(e)=>setFiltros({...filtros, fecha_fin: e.target.value})} className="border rounded-2xl px-3 py-2" />
        <select value={filtros.estado} onChange={(e)=>setFiltros({...filtros, estado: e.target.value})} className="border rounded-2xl px-3 py-2">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="confirmado">Confirmado</option>
          <option value="en_preparacion">En preparación</option>
          <option value="lista">Lista</option>
          <option value="entregada">Entregada</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <div className="relative">
          <input placeholder="Cliente (nombre)" value={filtros.cliente} onChange={async (e)=>{
              const val = e.target.value;
              setFiltros({...filtros, cliente: val});
              // Debounce
              if (debounceRef.current) clearTimeout(debounceRef.current);
              if (!val) { setSugerencias([]); setSugerenciasVisible(false); return; }
              debounceRef.current = setTimeout(async ()=>{
                try {
                  const s = await obtenerSugerenciasClientes(val);
                  setSugerencias(Array.isArray(s)?s:[]);
                  setSugerenciasVisible(true);
                } catch (err) {
                  setSugerencias([]);
                  setSugerenciasVisible(false);
                }
              }, 300);
            }} className="border rounded-2xl px-3 py-2" />

          {sugerenciasVisible && (
            <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-md max-h-40 overflow-auto">
              {sugerencias.length === 0 ? (
                <div className="p-2 text-sm text-slate-500">Sin coincidencias</div>
              ) : (
                sugerencias.map(s => (
                  <button key={s.id} onClick={()=>{ setFiltros({...filtros, cliente: s.nombre}); setSugerenciasVisible(false); }} className="w-full text-left px-3 py-2 hover:bg-slate-50">{s.nombre}</button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {loading && <p>Cargando...</p>}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Número</th>
              <th className="px-6 py-3">Cliente</th>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-5 text-center text-slate-500">No hay pedidos que coincidan.</td>
              </tr>
            ) : (
              results.map((r)=> (
                <tr key={r.id} className="border-t hover:bg-slate-50">
                  <td className="px-6 py-4">{r.id}</td>
                  <td className="px-6 py-4">{r.numero_pedido}</td>
                  <td className="px-6 py-4">{r.cliente}</td>
                  <td className="px-6 py-4">{r.fecha}</td>
                  <td className="px-6 py-4"><Badge estado={r.estado} /></td>
                  <td className="px-6 py-4">{r.total}</td>
                  <td className="px-6 py-4"><button onClick={()=>verDetalle(r.id)} className="rounded-full bg-slate-100 px-3 py-2 text-sm"><Eye size={16}/> Ver detalle</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {detalle && (
        <div className="fixed right-6 top-20 w-96 bg-white rounded-2xl shadow-lg border p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Detalle pedido {detalle.numero_pedido}</h3>
            <button onClick={()=>setDetalle(null)} className="text-slate-500">Cerrar</button>
          </div>
          <p className="text-sm text-slate-600">Cliente: {detalle.cliente}</p>
          <p className="text-sm text-slate-600">Fecha: {detalle.fecha}</p>
          <p className="text-sm text-slate-600">Estado: <Badge estado={detalle.estado} /></p>
          <div className="mt-3 space-y-2">
            {detalle.detalle.map((it,idx)=> (
              <div key={idx} className="flex justify-between">
                <div>
                  <div className="text-sm font-medium">{it.producto}</div>
                  <div className="text-xs text-slate-500">{it.cantidad} x {it.precio_unitario}</div>
                </div>
                <div className="text-sm font-semibold">{it.subtotal}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-right font-bold">Total: {detalle.total}</div>
        </div>
      )}
    </div>
  );
};

export default AdminHistorialPedidos;
