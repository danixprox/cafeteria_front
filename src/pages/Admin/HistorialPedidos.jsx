import React, { useEffect, useRef, useState } from 'react';
import { Eye } from 'lucide-react';
import { obtenerDetallePedido, obtenerHistorialPedidos, obtenerSugerenciasClientes } from '../../services/historialPedidosService';

const Badge = ({ estado }) => {
  const map = {
    pendiente: 'bg-slate-100 text-slate-700',
    confirmado: 'bg-amber-100 text-amber-700',
    en_preparacion: 'bg-indigo-100 text-indigo-700',
    lista: 'bg-emerald-100 text-emerald-700',
    entregada: 'bg-emerald-100 text-emerald-700',
    cancelado: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${map[estado] || 'bg-slate-100 text-slate-700'}`}>
      {estado}
    </span>
  );
};

const OrigenBadge = ({ origen }) => (
  <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
    {origen || 'Sin origen'}
  </span>
);

const MeseroText = ({ value }) => (
  <span className={value === 'Sin mesero asignado' ? 'text-slate-400' : 'text-slate-900'}>
    {value || 'Sin mesero asignado'}
  </span>
);

const AdminHistorialPedidos = () => {
  const [filtros, setFiltros] = useState({ fecha: '', estado: '', cliente: '', cliente_id: null });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [sugerencias, setSugerencias] = useState([]);
  const [sugerenciasVisible, setSugerenciasVisible] = useState(false);
  const debounceRef = useRef(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [count, setCount] = useState(0);

  const buscar = async (p = 1, ps = pageSize) => {
    setLoading(true);
    try {
      const params = {};
      if (filtros.fecha) params.fecha = filtros.fecha;
      if (filtros.estado) params.estado = filtros.estado;
      if (filtros.cliente_id) params.cliente = filtros.cliente_id;

      const data = await obtenerHistorialPedidos({ ...params, page: p, page_size: ps });
      setResults(Array.isArray(data.results) ? data.results : data.results || []);
      setCount(data.count || 0);
      setPage(data.page || p);
      setPageSize(data.page_size || ps);
    } catch (err) {
      console.error(err);
      alert('Error al obtener historial');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscar(1, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verDetalle = async (id) => {
    try {
      const d = await obtenerDetallePedido(id);
      setDetalle(d);
    } catch (err) {
      console.error(err);
      alert('Error al obtener detalle');
    }
  };

  const handleClienteChange = (e) => {
    const val = e.target.value;
    setFiltros({ ...filtros, cliente: val, cliente_id: null });

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val) {
      setSugerencias([]);
      setSugerenciasVisible(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const s = await obtenerSugerenciasClientes(val);
        setSugerencias(Array.isArray(s) ? s : []);
        setSugerenciasVisible(true);
      } catch {
        setSugerencias([]);
        setSugerenciasVisible(false);
      }
    }, 300);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Historial de Pedidos</h2>
        <button onClick={() => buscar()} className="rounded-full bg-amber-500 px-4 py-2 text-white">Buscar</button>
      </div>

      <div className="flex flex-wrap gap-2 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <input type="date" value={filtros.fecha} onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value })} className="rounded-2xl border px-3 py-2" />
        <select value={filtros.estado} onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })} className="rounded-2xl border px-3 py-2">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="confirmado">Confirmado</option>
          <option value="en_preparacion">En preparacion</option>
          <option value="lista">Lista</option>
          <option value="entregada">Entregada</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <div className="relative">
          <input placeholder="Cliente (nombre)" value={filtros.cliente} onChange={handleClienteChange} className="rounded-2xl border px-3 py-2" />

          {sugerenciasVisible && (
            <div className="absolute z-20 mt-1 max-h-40 w-full overflow-auto rounded-lg border bg-white shadow-md">
              {sugerencias.length === 0 ? (
                <div className="p-2 text-sm text-slate-500">Sin coincidencias</div>
              ) : (
                sugerencias.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setFiltros({ ...filtros, cliente: s.nombre, cliente_id: s.id });
                      setSugerenciasVisible(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50"
                  >
                    {s.nombre}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {loading && <p>Cargando...</p>}

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Numero</th>
              <th className="px-6 py-3">Cliente / origen</th>
              <th className="px-6 py-3">Ubicacion</th>
              <th className="px-6 py-3">Atendido por</th>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-5 text-center text-slate-500">No hay pedidos que coincidan.</td>
              </tr>
            ) : (
              results.map((r) => (
                <tr key={r.id} className="border-t hover:bg-slate-50">
                  <td className="px-6 py-4">{r.id}</td>
                  <td className="px-6 py-4">{r.numero_pedido}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{r.cliente || 'Cliente en mesa'}</div>
                    <OrigenBadge origen={r.origen} />
                  </td>
                  <td className="px-6 py-4">{r.ubicacion || '-'}</td>
                  <td className="px-6 py-4"><MeseroText value={r.atendido_por} /></td>
                  <td className="px-6 py-4">{r.fecha}</td>
                  <td className="px-6 py-4"><Badge estado={r.estado} /></td>
                  <td className="px-6 py-4">{r.total}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => verDetalle(r.id)} className="rounded-full bg-slate-100 px-3 py-2 text-sm">
                      <Eye size={16} /> Ver detalle
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-slate-600">Mostrando {results.length} de {count} pedidos</div>
        <div className="space-x-2">
          <button disabled={page <= 1} onClick={() => buscar(page - 1)} className="rounded bg-slate-100 px-3 py-1">Anterior</button>
          <button disabled={(page * pageSize) >= count} onClick={() => buscar(page + 1)} className="rounded bg-slate-100 px-3 py-1">Siguiente</button>
        </div>
      </div>

      {detalle && (
        <div className="fixed right-6 top-20 w-96 rounded-2xl border bg-white p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Detalle pedido {detalle.numero_pedido}</h3>
            <button onClick={() => setDetalle(null)} className="text-slate-500">Cerrar</button>
          </div>
          <div className="mb-2">
            <p className="text-sm text-slate-600">Cliente</p>
            <p className="font-semibold text-slate-900">{detalle.cliente || 'Cliente en mesa'}</p>
            <OrigenBadge origen={detalle.origen} />
          </div>
          <p className="text-sm text-slate-600">Ubicacion: {detalle.ubicacion || '-'}</p>
          <p className="text-sm text-slate-600">Atendido por: {detalle.atendido_por || 'Sin mesero asignado'}</p>
          <p className="text-sm text-slate-600">Fecha: {detalle.fecha}</p>
          <p className="text-sm text-slate-600">Estado: <Badge estado={detalle.estado} /></p>
          <div className="mt-3 space-y-2">
            {detalle.detalle.map((it, idx) => (
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
