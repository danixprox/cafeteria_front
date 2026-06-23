import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  Download,
  FileBarChart,
  Filter,
  LineChart,
  Mic,
  PackageSearch,
  RefreshCcw,
  Sparkles,
  TrendingUp,
  Utensils,
  WalletCards
} from 'lucide-react';
import {
  generarReporteVoz,
  getReporteDinamico,
  getReporteEstatico
} from '../../services/reportesService';

const tabs = [
  { id: 'estatico', label: 'Reporte estatico', icon: FileBarChart },
  { id: 'dinamico', label: 'Reporte dinamico', icon: Filter },
  { id: 'voz', label: 'Reporte por voz IA', icon: Sparkles }
];

const tiposReporte = [
  { label: 'Ingresos', value: 'ingresos' },
  { label: 'Ventas', value: 'ventas' },
  { label: 'Reservas', value: 'reservas' },
  { label: 'Preordenes', value: 'preordenes' },
  { label: 'Ocupacion de salas', value: 'ocupacion' },
  { label: 'Inventario critico', value: 'inventario' }
];

const agrupaciones = [
  { label: 'Dia', value: 'dia' },
  { label: 'Producto', value: 'producto' },
  { label: 'Estado', value: 'estado' },
  { label: 'Metodo de pago', value: 'metodo' },
  { label: 'Sala', value: 'sala' },
  { label: 'Stock', value: 'stock' }
];

const getInitialFilters = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const toDateInput = (date) => date.toISOString().slice(0, 10);

  return {
    tipo: 'ventas',
    fechaInicio: toDateInput(firstDay),
    fechaFin: toDateInput(today),
    umbral: '5',
    agruparPor: 'producto'
  };
};

const emptyCards = [
  { title: 'Ingresos confirmados', value: '0', detail: 'Ingresos confirmados', icon: WalletCards, tone: 'indigo' },
  { title: 'Ventas reales', value: '0', detail: 'Pedidos no cancelados', icon: TrendingUp, tone: 'green' },
  { title: 'Reservas totales', value: '0', detail: 'Reservas registradas', icon: CalendarDays, tone: 'blue' },
  { title: 'Preordenes activas', value: '0', detail: 'Demanda anticipada', icon: CheckCircle2, tone: 'purple' },
  { title: 'Ocupacion promedio', value: '0', detail: 'Ocupacion actual', icon: Utensils, tone: 'orange' },
  { title: 'Inventario critico', value: '0', detail: 'Productos bajo umbral', icon: PackageSearch, tone: 'red' }
];

const dynamicCardConfig = [
  ['ingresos_confirmados', 'Ingresos confirmados', WalletCards, 'indigo'],
  ['cantidad_pagos', 'Pagos confirmados', CreditCard, 'blue'],
  ['cantidad_pedidos', 'Pedidos', BarChart3, 'green'],
  ['total_vendido', 'Total vendido', TrendingUp, 'indigo'],
  ['reservas', 'Reservas', CalendarDays, 'blue'],
  ['reservas_activas', 'Reservas activas', CheckCircle2, 'green'],
  ['preordenes', 'Preordenes', CheckCircle2, 'purple'],
  ['demanda_anticipada', 'Demanda anticipada', PackageSearch, 'orange'],
  ['convertidas_a_pedido', 'Convertidas a pedido', BarChart3, 'green'],
  ['total_demanda_anticipada', 'Total demanda anticipada', WalletCards, 'indigo'],
  ['ocupacion_promedio', 'Ocupacion promedio', Utensils, 'orange'],
  ['productos_criticos', 'Productos criticos', PackageSearch, 'red']
];

const toneClasses = {
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  blue: 'bg-blue-50 text-blue-700 ring-blue-100',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  orange: 'bg-orange-50 text-orange-700 ring-orange-100',
  purple: 'bg-purple-50 text-purple-700 ring-purple-100',
  red: 'bg-rose-50 text-rose-700 ring-rose-100'
};

const badgeClasses = {
  pagado: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  confirmada: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  confirmado: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  pendiente: 'bg-amber-50 text-amber-700 ring-amber-100',
  exitosa: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  exitoso: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  cancelada: 'bg-rose-50 text-rose-700 ring-rose-100',
  cancelado: 'bg-rose-50 text-rose-700 ring-rose-100',
  critico: 'bg-orange-50 text-orange-700 ring-orange-100'
};

const formatNumber = (value) => Number(value || 0).toLocaleString('es-BO');
const formatMoney = (value) => `Bs ${Number(value || 0).toLocaleString('es-BO', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})}`;
const formatPercent = (value) => `${formatNumber(value)}%`;
const titleize = (value) => String(value || '').replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const hasValue = (value) => value !== undefined && value !== null && value !== '';

const formatMetricValue = (key, value) => {
  if (key.includes('ingresos') || key.includes('total_vendido') || key.includes('total_demanda')) {
    return formatMoney(value);
  }
  if (key.includes('ocupacion')) return formatPercent(value);
  return formatNumber(value);
};

const normalizeBackendCards = (payload) => {
  const tarjetas = payload?.tarjetas;
  if (!tarjetas || typeof tarjetas !== 'object') return emptyCards;

  return [
    { title: 'Ingresos confirmados', value: formatMoney(tarjetas.ingresos_confirmados), detail: 'Ingresos confirmados', icon: WalletCards, tone: 'indigo' },
    { title: 'Ventas reales', value: formatNumber(tarjetas.ventas_reales), detail: 'Pedidos no cancelados', icon: TrendingUp, tone: 'green' },
    { title: 'Reservas totales', value: formatNumber(tarjetas.reservas_totales), detail: 'Reservas registradas', icon: CalendarDays, tone: 'blue' },
    { title: 'Preordenes activas', value: formatNumber(tarjetas.preordenes_activas), detail: 'Demanda anticipada', icon: CheckCircle2, tone: 'purple' },
    { title: 'Ocupacion promedio', value: formatPercent(tarjetas.ocupacion_promedio), detail: 'Ocupacion actual', icon: Utensils, tone: 'orange' },
    { title: 'Inventario critico', value: formatNumber(tarjetas.productos_criticos), detail: 'Productos bajo umbral', icon: PackageSearch, tone: 'red' }
  ];
};

const normalizeDynamicCards = (payload) => {
  const totales = payload?.totales;
  if (!totales || typeof totales !== 'object') return emptyCards.slice(0, 4);

  const cards = dynamicCardConfig
    .filter(([key]) => Object.prototype.hasOwnProperty.call(totales, key))
    .map(([key, title, icon, tone]) => ({
      title,
      value: formatMetricValue(key, totales[key]),
      detail: title,
      icon,
      tone
    }));

  return cards.length ? cards : emptyCards.slice(0, 4);
};

const normalizeChartSeries = (series = [], labelKey = 'label', valueKey = 'value') => (
  Array.isArray(series)
    ? series
      .map((item) => ({
        label: String(item?.[labelKey] ?? item?.label ?? ''),
        value: Number(item?.[valueKey] ?? item?.value ?? 0)
      }))
      .filter((item) => item.label && Number.isFinite(item.value))
    : []
);

const chartFromRows = (rows = [], labelKey, valueKey) => normalizeChartSeries(rows, labelKey, valueKey);

const normalizeRows = (rows = [], columns = []) => (
  Array.isArray(rows)
    ? rows.map((row) => (
      Array.isArray(row)
        ? row.map((cell) => hasValue(cell) ? String(cell) : '-')
        : columns.map((column) => hasValue(row?.[column]) ? String(row[column]) : '-')
    ))
    : []
);

const normalizeColumns = (columns = []) => (
  Array.isArray(columns) && columns.length ? columns.map(titleize) : []
);

const maxValue = (data) => Math.max(...data.map((item) => Number(item.value) || 0), 1);

const ChartCard = ({ title, subtitle, data, variant = 'bar' }) => {
  const hasData = Array.isArray(data) && data.length > 0;
  const max = hasData ? maxValue(data) : 1;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        {variant === 'line' ? (
          <LineChart className="h-5 w-5 text-indigo-500" />
        ) : (
          <BarChart3 className="h-5 w-5 text-indigo-500" />
        )}
      </div>

      {!hasData ? (
        <div className="mt-5 flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm font-bold text-slate-500">
          No hay datos para graficar
        </div>
      ) : variant === 'line' ? (
        <div className="mt-6 flex h-48 items-end gap-3 border-b border-l border-slate-100 px-2 pb-3">
          {data.map((item) => (
            <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="relative flex h-36 w-full items-end justify-center">
                <div
                  className="w-full max-w-10 rounded-t-xl bg-gradient-to-t from-indigo-600 to-cyan-400 shadow-sm"
                  style={{ height: `${Math.max((item.value / max) * 100, 8)}%` }}
                />
              </div>
              <span className="max-w-full truncate text-xs font-semibold text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {data.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                <span className="truncate font-semibold text-slate-600">{item.label}</span>
                <span className="font-bold text-slate-900">{formatNumber(item.value)}</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-indigo-600 to-blue-500"
                  style={{ width: `${Math.max((item.value / max) * 100, 6)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

const SummaryGrid = ({ cards }) => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    {cards.map(({ title, value, detail, icon: Icon, tone }) => (
      <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-500">{title}</p>
            <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">{value || '0'}</p>
            <p className="mt-2 text-sm text-slate-500">{detail}</p>
          </div>
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${toneClasses[tone]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </article>
    ))}
  </div>
);

const DetailTable = ({ title, subtitle, headers, rows }) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      </div>
      <span className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
        <Clock3 className="h-3.5 w-3.5" />
        Datos del backend
      </span>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-5 py-3 font-bold">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length ? rows.map((row, rowIndex) => (
            <tr key={`${title}-${rowIndex}`} className="hover:bg-slate-50">
              {row.map((cell, cellIndex) => {
                const isEstado = headers[cellIndex]?.toLowerCase().includes('estado');
                const badgeKey = String(cell).toLowerCase();
                return (
                  <td key={`${title}-${rowIndex}-${cellIndex}`} className="px-5 py-4 text-slate-600">
                    {isEstado ? (
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${badgeClasses[badgeKey] || 'bg-slate-100 text-slate-700 ring-slate-200'}`}>
                        {cell}
                      </span>
                    ) : (
                      <span className={cellIndex === row.length - 1 ? 'font-bold text-slate-900' : ''}>{cell}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          )) : (
            <tr>
              <td colSpan={headers.length || 1} className="px-5 py-10 text-center text-sm font-bold text-slate-500">
                No hay registros para mostrar
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </section>
);

const Field = ({ label, children }) => (
  <label className="space-y-2">
    <span className="text-xs font-bold uppercase text-slate-500">{label}</span>
    {children}
  </label>
);

const SelectField = ({ value, onChange, options }) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
    >
      {options.map((option) => (
        <option key={option.value || option} value={option.value || option}>
          {option.label || option}
        </option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
  </div>
);

const GenerarReporte = () => {
  const [modoActivo, setModoActivo] = useState('estatico');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [reporteEstatico, setReporteEstatico] = useState(null);
  const [reporteDinamico, setReporteDinamico] = useState(null);
  const [reporteVoz, setReporteVoz] = useState(null);
  const [textoVoz, setTextoVoz] = useState('');
  const [escuchando, setEscuchando] = useState(false);
  const [filtros, setFiltros] = useState(getInitialFilters);

  const tarjetasEstaticas = useMemo(() => normalizeBackendCards(reporteEstatico), [reporteEstatico]);
  const tarjetasDinamicas = useMemo(() => normalizeDynamicCards(reporteDinamico), [reporteDinamico]);
  const tarjetasVoz = useMemo(() => normalizeDynamicCards(reporteVoz?.reporte), [reporteVoz]);

  const chartsEstaticos = useMemo(() => {
    const graficos = reporteEstatico?.graficos || {};
    return {
      reservasEstado: chartFromRows(graficos.reservas_por_estado, 'estado', 'cantidad'),
      ocupacionSala: chartFromRows(graficos.ocupacion_por_sala, 'sala', 'ocupacion_periodo'),
      ingresosDia: chartFromRows(graficos.ingresos_por_dia, 'fecha', 'total'),
      ventasProducto: chartFromRows(graficos.ventas_por_producto, 'producto', 'cantidad')
    };
  }, [reporteEstatico]);

  const tablaInventario = useMemo(() => {
    const rows = reporteEstatico?.tablas?.inventario_critico || [];
    const columns = ['producto', 'categoria', 'stock', 'stock_reservado', 'stock_disponible', 'umbral'];
    return {
      headers: normalizeColumns(columns),
      rows: normalizeRows(rows, columns)
    };
  }, [reporteEstatico]);

  const tablaDinamica = useMemo(() => {
    const columns = reporteDinamico?.columnas || [];
    return {
      headers: normalizeColumns(columns),
      rows: normalizeRows(reporteDinamico?.filas, columns)
    };
  }, [reporteDinamico]);

  const tablaVoz = useMemo(() => {
    const columns = reporteVoz?.reporte?.columnas || [];
    return {
      headers: normalizeColumns(columns),
      rows: normalizeRows(reporteVoz?.reporte?.filas, columns)
    };
  }, [reporteVoz]);

  useEffect(() => {
    cargarReporteEstatico(true);
  }, []);

  const limpiarFeedback = () => {
    setMensaje('');
    setError('');
  };

  const cargarReporteEstatico = async (silencioso = false) => {
    limpiarFeedback();
    if (!silencioso) setLoading(true);
    try {
      const response = await getReporteEstatico();
      setReporteEstatico(response.data || null);
      if (!silencioso) setMensaje('Reporte estatico actualizado correctamente.');
    } catch (err) {
      setReporteEstatico(null);
      if (!silencioso) setError('No se pudo conectar con el backend.');
      console.error('[GenerarReporte] reporte estatico:', err);
    } finally {
      if (!silencioso) setLoading(false);
    }
  };

  const cargarReporteDinamico = async () => {
    limpiarFeedback();
    setLoading(true);
    try {
      const response = await getReporteDinamico({
        tipo: filtros.tipo,
        fecha_inicio: filtros.fechaInicio,
        fecha_fin: filtros.fechaFin,
        umbral_stock: filtros.umbral,
        agrupar_por: filtros.agruparPor
      });
      setReporteDinamico(response.data || null);
      setMensaje('Reporte dinamico generado con los filtros seleccionados.');
    } catch (err) {
      setReporteDinamico(null);
      setError('No se pudo conectar con el backend.');
      console.error('[GenerarReporte] reporte dinamico:', err);
    } finally {
      setLoading(false);
    }
  };

  const interpretarVoz = async () => {
    limpiarFeedback();
    setLoading(true);
    try {
      const response = await generarReporteVoz({
        texto: textoVoz,
        fecha_inicio: filtros.fechaInicio,
        fecha_fin: filtros.fechaFin,
        umbral_stock: filtros.umbral
      });
      setReporteVoz(response.data || null);
      setMensaje('La IA interpreto la solicitud y genero el reporte.');
    } catch (err) {
      setReporteVoz(null);
      setError('No se pudo conectar con el backend.');
      console.error('[GenerarReporte] voz:', err);
    } finally {
      setLoading(false);
    }
  };

  const iniciarVoz = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Este navegador no soporta reconocimiento de voz. Puedes escribir la instruccion manualmente.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-BO';
    recognition.interimResults = false;
    recognition.onstart = () => setEscuchando(true);
    recognition.onend = () => setEscuchando(false);
    recognition.onerror = () => {
      setEscuchando(false);
      setError('No se pudo capturar la voz. Intenta escribir la instruccion.');
    };
    recognition.onresult = (event) => {
      const texto = event.results?.[0]?.[0]?.transcript;
      if (texto) setTextoVoz(texto);
    };
    recognition.start();
  };

  const actualizar = () => {
    if (modoActivo === 'dinamico') cargarReporteDinamico();
    else if (modoActivo === 'voz') interpretarVoz();
    else cargarReporteEstatico();
  };

  const exportar = () => {
    window.print();
    setMensaje('Vista lista para exportar o guardar como PDF.');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .reporte-cu25, .reporte-cu25 * { visibility: visible; }
          .reporte-cu25 { position: absolute; inset: 0; background: white; padding: 24px; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="reporte-cu25 space-y-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-indigo-700">
                <span className="rounded-full bg-indigo-50 px-3 py-1 ring-1 ring-indigo-100">Donde Juanita</span>
                <span className="text-slate-400">Modulo Administrador</span>
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950">Generar Reporte</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Consulta ventas, reservas, preordenes, ocupacion de salas e inventario critico.
              </p>
            </div>

            <div className="no-print flex flex-wrap gap-3">
              <button
                onClick={actualizar}
                disabled={loading}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
              >
                <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar datos
              </button>
              <button
                onClick={exportar}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
              >
                <Download className="h-4 w-4" />
                PDF Exportar reporte
              </button>
            </div>
          </div>
        </header>

        <nav className="no-print rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="grid gap-2 md:grid-cols-3">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setModoActivo(id);
                  limpiarFeedback();
                }}
                className={`flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-black transition ${
                  modoActivo === id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </nav>

        {(mensaje || error) && (
          <div className={`no-print rounded-2xl border px-4 py-3 text-sm font-semibold ${
            error
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}>
            {error || mensaje}
          </div>
        )}

        {modoActivo === 'estatico' && (
          <div className="space-y-6">
            <SummaryGrid cards={tarjetasEstaticas} />
            <div className="grid gap-6 xl:grid-cols-2">
              <ChartCard title="Reservas por estado" subtitle="Datos reales del backend" data={chartsEstaticos.reservasEstado} />
              <ChartCard title="Ocupacion por sala" subtitle="Datos reales del backend" data={chartsEstaticos.ocupacionSala} />
              <ChartCard title="Ingresos por dia" subtitle="Datos reales del backend" data={chartsEstaticos.ingresosDia} variant="line" />
              <ChartCard title="Ventas por producto" subtitle="Datos reales del backend" data={chartsEstaticos.ventasProducto} />
            </div>
            <DetailTable
              title="Inventario critico"
              subtitle="Registros reales del reporte estatico"
              headers={tablaInventario.headers}
              rows={tablaInventario.rows}
            />
          </div>
        )}

        {modoActivo === 'dinamico' && (
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
                  <Filter className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-950">Filtros del reporte dinamico</h3>
                  <p className="text-sm text-slate-500">Define el alcance del reporte antes de generarlo.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Tipo de reporte">
                  <SelectField value={filtros.tipo} onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })} options={tiposReporte} />
                </Field>
                <Field label="Fecha inicio">
                  <input type="date" value={filtros.fechaInicio} onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
                </Field>
                <Field label="Fecha fin">
                  <input type="date" value={filtros.fechaFin} onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
                </Field>
                <Field label="Umbral inventario">
                  <input type="number" value={filtros.umbral} onChange={(e) => setFiltros({ ...filtros, umbral: e.target.value })} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
                </Field>
                <Field label="Agrupar por">
                  <SelectField value={filtros.agruparPor} onChange={(e) => setFiltros({ ...filtros, agruparPor: e.target.value })} options={agrupaciones} />
                </Field>
                <button
                  onClick={cargarReporteDinamico}
                  disabled={loading}
                  className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-black text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  <BarChart3 className="h-4 w-4" />
                  Generar dinamico
                </button>
              </div>
            </section>

            <SummaryGrid cards={tarjetasDinamicas} />
            <div className="grid gap-6 xl:grid-cols-2">
              <ChartCard title="Serie del reporte" subtitle="Resultado segun filtros" data={normalizeChartSeries(reporteDinamico?.series)} />
              <ChartCard title="Tendencia del reporte" subtitle="Resultado segun filtros" data={normalizeChartSeries(reporteDinamico?.series)} variant="line" />
            </div>
            <DetailTable
              title="Tabla dinamica"
              subtitle="Datos filtrados por periodo y agrupacion"
              headers={tablaDinamica.headers}
              rows={tablaDinamica.rows}
            />
          </div>
        )}

        {modoActivo === 'voz' && (
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-950">Reporte por voz IA</h3>
                      <p className="text-sm text-slate-500">
                        Describe lo que necesitas saber y la IA interpretara tu peticion para generar el reporte.
                      </p>
                    </div>
                  </div>
                  <textarea
                    value={textoVoz}
                    onChange={(e) => setTextoVoz(e.target.value)}
                    rows={5}
                    className="mt-5 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    placeholder="Escribe la consulta para generar el reporte"
                  />
                </div>

                <div className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <button
                    onClick={iniciarVoz}
                    className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-black text-white shadow-sm transition ${escuchando ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                  >
                    <Mic className="h-4 w-4" />
                    REC Microfono
                  </button>
                  <button
                    onClick={interpretarVoz}
                    disabled={loading}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-black text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
                  >
                    <Sparkles className="h-4 w-4" />
                    Interpretar reporte
                  </button>
                  <div className="rounded-xl bg-white p-4 text-sm text-slate-600 ring-1 ring-slate-200">
                    <p className="font-black text-slate-950">Resultado interpretado</p>
                    {reporteVoz?.interpretacion ? (
                      <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                        <div><dt className="text-slate-400">Tipo</dt><dd className="font-bold">{titleize(reporteVoz.interpretacion.tipo)}</dd></div>
                        <div><dt className="text-slate-400">Agrupar por</dt><dd className="font-bold">{titleize(reporteVoz.interpretacion.agrupar_por)}</dd></div>
                        <div><dt className="text-slate-400">Fecha inicio</dt><dd className="font-bold">{reporteVoz.interpretacion.fecha_inicio || '-'}</dd></div>
                        <div><dt className="text-slate-400">Fecha fin</dt><dd className="font-bold">{reporteVoz.interpretacion.fecha_fin || '-'}</dd></div>
                        <div className="col-span-2"><dt className="text-slate-400">Confianza</dt><dd className="font-bold text-emerald-700">{formatPercent((reporteVoz.interpretacion.confianza || 0) * 100)}</dd></div>
                      </dl>
                    ) : (
                      <p className="mt-3 text-xs font-bold text-slate-500">No hay registros para mostrar</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {reporteVoz?.respuesta && (
              <section className="rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-4 text-sm font-bold text-indigo-900">
                {reporteVoz.respuesta}
              </section>
            )}

            <SummaryGrid cards={tarjetasVoz} />
            <div className="grid gap-6 xl:grid-cols-2">
              <ChartCard title="Serie del reporte por voz" subtitle="Datos reales interpretados por el backend" data={normalizeChartSeries(reporteVoz?.reporte?.series)} />
              <ChartCard title="Tendencia del reporte por voz" subtitle="Datos reales interpretados por el backend" data={normalizeChartSeries(reporteVoz?.reporte?.series)} variant="line" />
            </div>
            <DetailTable
              title="Detalle del reporte por voz"
              subtitle="Registros reales devueltos por la interpretacion IA"
              headers={tablaVoz.headers}
              rows={tablaVoz.rows}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerarReporte;
