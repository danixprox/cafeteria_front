import { useEffect, useState } from 'react';
import api from '../../services/axiosClient';

const todayISO = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const money = (value) => `Bs. ${Number(value || 0).toFixed(2)}`;

const CierreCaja = () => {
  const [fecha, setFecha] = useState(todayISO());
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [cierre, setCierre] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const crearFiltros = () => {
    if (fechaInicio || fechaFin) {
      return {
        fecha_inicio: fechaInicio || fecha,
        fecha_fin: fechaFin || fechaInicio || fecha,
      };
    }
    return { fecha };
  };

  const cargarCierre = async (filtrosConsulta = crearFiltros()) => {
    setLoading(true);
    setError('');
    setMensaje('');
    setCierre(null);
    try {
      const res = await api.get('/finanzas/cierre-caja/', { params: filtrosConsulta });
      setCierre(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || err.message || 'Error al consultar el cierre de caja.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCierre();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCerrarCaja = async () => {
    if (!cierre?.comprobantes?.length) {
      setError('No hay comprobantes para cerrar en este periodo.');
      return;
    }

    if (!window.confirm('Confirmas el cierre de caja para el periodo seleccionado?')) return;

    setLoading(true);
    setError('');
    setMensaje('');
    try {
      const res = await api.post('/finanzas/cierre-caja/cerrar/', crearFiltros());
      setCierre(res.data.cierre);
      setMensaje(`${res.data.comprobantes_cerrados} comprobante(s) marcados como cerrados.`);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || err.message || 'Error al cerrar caja.');
    } finally {
      setLoading(false);
    }
  };

  const porMetodo = cierre?.por_metodo || [];
  const comprobantes = cierre?.comprobantes || [];

  return (
    <section className="space-y-6">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #cierre-caja-print-area,
          #cierre-caja-print-area * { visibility: visible !important; }
          #cierre-caja-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
          }
          .cierre-caja-actions { display: none !important; }
        }
      `}</style>

      <div className="cierre-caja-actions flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900">CIERRE DE CAJA</h2>
          <p className="text-sm text-slate-500">
            Consulta pagos exitosos ya emitidos como comprobantes. No genera ventas ni pagos nuevos.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
          <label className="text-sm font-semibold text-slate-600">
            Fecha
            <input
              type="date"
              value={fecha}
              onChange={(event) => {
                setFecha(event.target.value);
                setFechaInicio('');
                setFechaFin('');
              }}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
            />
          </label>
          <label className="text-sm font-semibold text-slate-600">
            Desde
            <input
              type="date"
              value={fechaInicio}
              onChange={(event) => setFechaInicio(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
            />
          </label>
          <label className="text-sm font-semibold text-slate-600">
            Hasta
            <input
              type="date"
              value={fechaFin}
              onChange={(event) => setFechaFin(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
            />
          </label>
          <button
            type="button"
            onClick={() => cargarCierre()}
            disabled={loading}
            className="self-end rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            Buscar
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}
      {mensaje && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {mensaje}
        </div>
      )}

      <div id="cierre-caja-print-area" className="space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900">Resumen del periodo</h3>
              <p className="text-sm text-slate-500">
                {cierre?.fecha_inicio || fecha} a {cierre?.fecha_fin || fecha}
              </p>
            </div>
            <span className={`w-fit rounded-full px-4 py-2 text-xs font-black ${cierre?.caja_cerrada ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {cierre?.caja_cerrada ? 'Caja cerrada' : 'Caja abierta'}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            <div className="rounded-xl bg-slate-900 p-4 text-white">
              <p className="text-xs font-bold uppercase text-slate-300">Total Ventas</p>
              <p className="mt-2 text-2xl font-black">{money(cierre?.total_general)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <p className="text-xs font-bold uppercase text-slate-500">Comprobantes</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{cierre?.cantidad_comprobantes || 0}</p>
            </div>
            {porMetodo.map((item) => (
              <div key={item.metodo} className="rounded-xl bg-blue-50 p-4 ring-1 ring-blue-100">
                <p className="text-xs font-bold uppercase text-blue-700">{item.metodo}</p>
                <p className="mt-2 text-xl font-black text-blue-900">{money(item.total)}</p>
                <p className="text-xs font-semibold text-blue-700">{item.cantidad} comprobantes</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl font-black text-slate-900">Detalle de comprobantes</h3>
            <div className="cierre-caja-actions flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
              >
                Generar Reporte PDF
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
              >
                Imprimir
              </button>
              <button
                type="button"
                onClick={handleCerrarCaja}
                disabled={loading || cierre?.caja_cerrada}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                Cerrar Caja
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                <tr>
                  <th className="px-4 py-3">N° Comprobante</th>
                  <th className="px-4 py-3">Hora</th>
                  <th className="px-4 py-3">Mesa</th>
                  <th className="px-4 py-3">Sala</th>
                  <th className="px-4 py-3">Cliente / Mesero</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Metodo</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
                      Cargando cierre de caja...
                    </td>
                  </tr>
                ) : comprobantes.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
                      No hay comprobantes emitidos en este periodo.
                    </td>
                  </tr>
                ) : (
                  comprobantes.map((item) => (
                    <tr key={item.id_pago} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">{item.numero_comprobante}</td>
                      <td className="px-4 py-3">{item.hora}</td>
                      <td className="px-4 py-3">{item.mesa}</td>
                      <td className="px-4 py-3">{item.sala}</td>
                      <td className="px-4 py-3">{item.cliente_mesero}</td>
                      <td className="px-4 py-3">{item.tipo}</td>
                      <td className="px-4 py-3">{item.metodo_pago}</td>
                      <td className="px-4 py-3 text-right font-black">{money(item.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CierreCaja;
