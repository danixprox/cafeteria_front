import React, { useEffect, useState } from 'react';
import { Download, Eye } from 'lucide-react';
import { obtenerDetallePedido, obtenerHistorialPedidos } from '../../services/historialPedidosService';

const Badge = ({ estado }) => {
  const map = {
    pendiente: 'bg-slate-100 text-slate-700',
    confirmado: 'bg-amber-100 text-amber-700',
    en_preparacion: 'bg-indigo-100 text-indigo-700',
    lista: 'bg-emerald-100 text-emerald-700',
    entregada: 'bg-emerald-100 text-emerald-700',
    cancelado: 'bg-red-100 text-red-700',
  };
  return <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${map[estado] || 'bg-slate-100 text-slate-700'}`}>{estado}</span>;
};

const toNumber = (value) => Number.parseFloat(value || 0);
const hoyISO = () => new Date().toISOString().slice(0, 10);
const mesActual = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const last = new Date(y, now.getMonth() + 1, 0).getDate();
  return { inicio: `${y}-${m}-01`, fin: `${y}-${m}-${String(last).padStart(2, '0')}` };
};

const abrirPdf = (titulo, filas, detalles = []) => {
  const total = filas.reduce((acc, item) => acc + toNumber(item.total), 0);
  const rows = filas.map((p) => `
    <tr>
      <td>${p.numero_pedido}</td>
      <td>${p.fecha}</td>
      <td>${p.estado}</td>
      <td>${p.origen || '-'}</td>
      <td style="text-align:right">Bs. ${toNumber(p.total).toFixed(2)}</td>
    </tr>
  `).join('');
  const detailHtml = detalles.map((d) => `
    <section>
      <h3>${d.numero_pedido}</h3>
      <p><strong>Fecha:</strong> ${d.fecha} | <strong>Estado:</strong> ${d.estado}</p>
      <ul>
        ${d.detalle.map((it) => `<li>${it.cantidad} x ${it.producto} - Bs. ${toNumber(it.subtotal).toFixed(2)}</li>`).join('')}
      </ul>
    </section>
  `).join('');

  const win = window.open('', '_blank');
  win.document.write(`
    <html>
      <head>
        <title>${titulo}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #0f172a; }
          h1 { margin-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border-bottom: 1px solid #cbd5e1; padding: 10px; text-align: left; }
          th { background: #f1f5f9; }
          section { margin-top: 24px; page-break-inside: avoid; }
          .total { margin-top: 18px; text-align: right; font-weight: 700; }
        </style>
      </head>
      <body>
        <h1>${titulo}</h1>
        <p>Generado el ${new Date().toLocaleString()}</p>
        <table>
          <thead><tr><th>Pedido</th><th>Fecha</th><th>Resultado</th><th>Origen</th><th>Total</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p class="total">Total del extracto: Bs. ${total.toFixed(2)}</p>
        ${detailHtml}
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
};

const HistorialPedidosCliente = () => {
  const [filtros, setFiltros] = useState({ fecha: '', fecha_inicio: '', fecha_fin: '', estado: '' });
  const [results, setResults] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const buscar = async (p = 1, extra = {}) => {
    setLoading(true);
    try {
      const params = { ...filtros, ...extra, page: p, page_size: pageSize };
      const data = await obtenerHistorialPedidos(params);
      const list = data.results || [];
      setResults(Array.isArray(list) ? list : []);
      setTotal(data.count || 0);
      setPage(data.page || p);
    } catch (err) {
      console.error(err);
      alert('Error al obtener historial de pedidos');
    } finally {
      setLoading(false);
    }
  };

  const limpiar = () => {
    const limpio = { fecha: '', fecha_inicio: '', fecha_fin: '', estado: '' };
    setFiltros(limpio);
    buscar(1, limpio);
  };

  const aplicarHoy = () => {
    const f = { fecha: hoyISO(), fecha_inicio: '', fecha_fin: '' };
    setFiltros((prev) => ({ ...prev, ...f }));
    buscar(1, f);
  };

  const aplicarMes = () => {
    const mes = mesActual();
    const f = { fecha: '', fecha_inicio: mes.inicio, fecha_fin: mes.fin };
    setFiltros((prev) => ({ ...prev, ...f }));
    buscar(1, f);
  };

  useEffect(() => {
    buscar(1);
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

  const exportarListado = () => {
    if (!results.length) {
      alert('No hay pedidos para exportar.');
      return;
    }
    abrirPdf('Extracto de pedidos', results);
  };

  const exportarDetalle = async (pedido) => {
    const d = detalle?.id === pedido.id ? detalle : await obtenerDetallePedido(pedido.id);
    abrirPdf(`Detalle ${pedido.numero_pedido}`, [pedido], [d]);
  };

  const exportarUltimo = async () => {
    if (!results.length) {
      alert('No hay pedidos para exportar.');
      return;
    }
    await exportarDetalle(results[0]);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Historial de Pedidos</h2>
          <p className="text-sm text-slate-500">Extractos y pedidos anteriores.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => buscar()} className="rounded-full bg-amber-500 px-4 py-2 text-white">Buscar</button>
          <button onClick={limpiar} className="rounded-full bg-slate-100 px-4 py-2 text-slate-700">Limpiar filtros</button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
          Fecha exacta
          <input type="date" value={filtros.fecha} onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value, fecha_inicio: '', fecha_fin: '' })} className="rounded-2xl border px-3 py-2 text-base font-normal text-slate-900" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
          Desde
          <input type="date" value={filtros.fecha_inicio} onChange={(e) => setFiltros({ ...filtros, fecha: '', fecha_inicio: e.target.value })} className="rounded-2xl border px-3 py-2 text-base font-normal text-slate-900" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
          Hasta
          <input type="date" value={filtros.fecha_fin} onChange={(e) => setFiltros({ ...filtros, fecha: '', fecha_fin: e.target.value })} className="rounded-2xl border px-3 py-2 text-base font-normal text-slate-900" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
          Resultado
          <select value={filtros.estado} onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })} className="rounded-2xl border px-3 py-2 text-base font-normal text-slate-900">
            <option value="">Todos</option>
            <option value="entregada">Entregados</option>
            <option value="cancelado">Cancelados</option>
        </select>
        </label>
        <button onClick={aplicarHoy} className="rounded-full bg-slate-100 px-4 py-2 text-slate-700">Extracto de hoy</button>
        <button onClick={aplicarMes} className="rounded-full bg-slate-100 px-4 py-2 text-slate-700">Este mes</button>
        <button onClick={exportarUltimo} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-white"><Download size={16} /> Ultimo pedido</button>
        <button onClick={exportarListado} className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-white"><Download size={16} /> Exportar PDF</button>
      </div>

      {loading && <p>Cargando...</p>}

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-6 py-3">Numero</th>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3">Origen</th>
              <th className="px-6 py-3">Resultado</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-5 text-center text-slate-500">No existen pedidos para los filtros seleccionados.</td>
              </tr>
            ) : (
              results.map((r) => (
                <tr key={r.id} className="border-t hover:bg-slate-50">
                  <td className="px-6 py-4">{r.numero_pedido}</td>
                  <td className="px-6 py-4">{r.fecha}</td>
                  <td className="px-6 py-4">{r.origen || '-'}</td>
                  <td className="px-6 py-4"><Badge estado={r.estado} /></td>
                  <td className="px-6 py-4">Bs. {toNumber(r.total).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => verDetalle(r.id)} className="rounded-full bg-slate-100 px-3 py-2 text-sm"><Eye size={16} /> Ver detalle</button>
                      <button onClick={() => exportarDetalle(r)} className="rounded-full bg-emerald-50 px-3 py-2 text-sm text-emerald-700"><Download size={16} /> PDF</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-slate-600">Mostrando {results.length} de {total} resultados</div>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => buscar(page - 1)} className="rounded bg-slate-100 px-3 py-1">Anterior</button>
          <button disabled={page * pageSize >= total} onClick={() => buscar(page + 1)} className="rounded bg-slate-100 px-3 py-1">Siguiente</button>
        </div>
      </div>

      {detalle && (
        <div className="fixed right-6 top-20 w-96 rounded-2xl border bg-white p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Detalle pedido {detalle.numero_pedido}</h3>
            <button onClick={() => setDetalle(null)} className="text-slate-500">Cerrar</button>
          </div>
          <p className="text-sm text-slate-600">Fecha: {detalle.fecha}</p>
          <p className="text-sm text-slate-600">Resultado: <Badge estado={detalle.estado} /></p>
          <div className="mt-3 max-h-56 space-y-2 overflow-auto">
            {detalle.detalle.map((it) => (
              <div key={it.producto_id} className="flex justify-between">
                <div>
                  <div className="text-sm font-medium">{it.producto}</div>
                  <div className="text-xs text-slate-500">{it.cantidad} x {it.precio_unitario}</div>
                </div>
                <div className="text-sm font-semibold">{it.subtotal}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-right font-bold">Total: Bs. {toNumber(detalle.total).toFixed(2)}</div>
        </div>
      )}
    </div>
  );
};

export default HistorialPedidosCliente;
