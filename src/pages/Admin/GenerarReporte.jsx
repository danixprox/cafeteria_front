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
  'Ventas e ingresos',
  'Reservas',
  'Preordenes',
  'Ocupacion de salas',
  'Inventario critico'
];

const filtrosIniciales = {
  tipo: 'Ventas e ingresos',
  fechaInicio: '2026-06-01',
  fechaFin: '2026-06-21',
  estado: 'Confirmado',
  metodo: 'Todos',
  umbral: '8',
  agruparPor: 'Dia'
};

const resumenEstatico = [
  {
    title: 'Ventas e ingresos',
    value: 'Bs 18.420,50',
    detail: '+14,2% frente a la semana anterior',
    icon: WalletCards,
    tone: 'indigo'
  },
  {
    title: 'Ocupacion de salas',
    value: '76%',
    detail: 'Sala Jardin lidera con 88%',
    icon: Utensils,
    tone: 'green'
  },
  {
    title: 'Inventario critico',
    value: '12',
    detail: 'Productos bajo el umbral minimo',
    icon: PackageSearch,
    tone: 'orange'
  },
  {
    title: 'Preordenes',
    value: '43',
    detail: '31 listas para preparar',
    icon: CheckCircle2,
    tone: 'purple'
  },
  {
    title: 'Reservas totales',
    value: '128',
    detail: '+9 reservas confirmadas hoy',
    icon: CalendarDays,
    tone: 'blue'
  },
  {
    title: 'Ticket promedio',
    value: 'Bs 86,40',
    detail: 'Promedio por pedido pagado',
    icon: TrendingUp,
    tone: 'red'
  }
];

const resumenDinamico = [
  { title: 'Ingresos confirmados', value: 'Bs 9.850,00', detail: 'Filtro aplicado: confirmados', icon: WalletCards, tone: 'indigo' },
  { title: 'Ventas reales', value: '116', detail: 'Pedidos pagados en el periodo', icon: BarChart3, tone: 'green' },
  { title: 'Reservas filtradas', value: '54', detail: 'Reservas entre fechas', icon: CalendarDays, tone: 'blue' },
  { title: 'Inventario critico', value: '8', detail: 'Stock menor o igual a 8', icon: PackageSearch, tone: 'orange' }
];

const resumenVoz = [
  { title: 'Reservas canceladas', value: '18', detail: 'Semana actual', icon: CalendarDays, tone: 'red' },
  { title: 'Reservas confirmadas', value: '64', detail: 'Listas para atencion', icon: CheckCircle2, tone: 'green' },
  { title: 'Ocupacion promedio', value: '71%', detail: 'Salas tematicas activas', icon: Utensils, tone: 'indigo' },
  { title: 'Tasa de cancelacion', value: '12,8%', detail: '-2,1% vs semana pasada', icon: TrendingUp, tone: 'orange' }
];

const charts = {
  reservasEstado: [
    { label: 'Confirmadas', value: 64 },
    { label: 'Pendientes', value: 31 },
    { label: 'Canceladas', value: 18 },
    { label: 'Finalizadas', value: 15 }
  ],
  ocupacionSala: [
    { label: 'Sala Jardin', value: 88 },
    { label: 'Sala Familiar', value: 74 },
    { label: 'Terraza', value: 69 },
    { label: 'Sala Ejecutiva', value: 58 }
  ],
  inventarioCategoria: [
    { label: 'Bebidas', value: 5 },
    { label: 'Panaderia', value: 4 },
    { label: 'Insumos cocina', value: 3 },
    { label: 'Postres', value: 2 }
  ],
  ingresosDia: [
    { label: 'Lun', value: 2180 },
    { label: 'Mar', value: 2540 },
    { label: 'Mie', value: 1990 },
    { label: 'Jue', value: 3120 },
    { label: 'Vie', value: 3790 },
    { label: 'Sab', value: 4250 },
    { label: 'Dom', value: 2550 }
  ],
  ventasProducto: [
    { label: 'Silpancho', value: 42 },
    { label: 'Cafe juanita', value: 38 },
    { label: 'Pique macho', value: 27 },
    { label: 'Jugo natural', value: 24 },
    { label: 'Torta casera', value: 18 }
  ],
  pagosMetodo: [
    { label: 'QR', value: 48 },
    { label: 'Tarjeta', value: 31 },
    { label: 'Efectivo', value: 27 },
    { label: 'Stripe', value: 10 }
  ]
};

const tablaEstatico = [
  ['21/06/2026', 'Venta', 'Almuerzo familiar - Sala Jardin', 'Pagado', 'QR', '324,00'],
  ['21/06/2026', 'Reserva', 'Mesa 8 - Terraza', 'Confirmada', 'Tarjeta', '80,00'],
  ['20/06/2026', 'Preorden', 'Cafe Juanita x 6', 'Lista', 'Efectivo', '132,00'],
  ['20/06/2026', 'Inventario', 'Leche deslactosada', 'Critico', '-', '0,00'],
  ['19/06/2026', 'Venta', 'Cena ejecutiva', 'Pagado', 'Tarjeta', '486,50'],
  ['19/06/2026', 'Reserva', 'Sala Familiar', 'Cancelada', 'QR', '0,00']
];

const tablaDinamico = [
  ['21/06/2026', 'Silpancho', 'Platos principales', '18', 'QR', 'Pagado', '810,00'],
  ['21/06/2026', 'Cafe Juanita', 'Bebidas calientes', '26', 'Tarjeta', 'Pagado', '572,00'],
  ['20/06/2026', 'Reserva terraza', 'Reservas', '7', 'QR', 'Confirmado', '560,00'],
  ['20/06/2026', 'Torta casera', 'Postres', '14', 'Efectivo', 'Pagado', '350,00'],
  ['19/06/2026', 'Pique macho', 'Platos principales', '11', 'Tarjeta', 'Pagado', '715,00']
];

const tablaVoz = [
  ['21/06/2026', 'Maria Fernanda', 'Sala Jardin', 'Cancelada', 'Cruce de horario', 'Bs 0,00'],
  ['20/06/2026', 'Luis Rojas', 'Terraza', 'Cancelada', 'Cliente no asistio', 'Bs 0,00'],
  ['19/06/2026', 'Camila Soto', 'Sala Familiar', 'Cancelada', 'Solicitud telefonica', 'Bs 0,00'],
  ['18/06/2026', 'Ruben Vargas', 'Sala Ejecutiva', 'Cancelada', 'Pago no confirmado', 'Bs 0,00']
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
  Pagado: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  Confirmada: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  Confirmado: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  Lista: 'bg-purple-50 text-purple-700 ring-purple-100',
  Critico: 'bg-orange-50 text-orange-700 ring-orange-100',
  Cancelada: 'bg-rose-50 text-rose-700 ring-rose-100'
};

const normalizeBackendCards = (payload) => {
  const tarjetas = payload?.tarjetas;
  if (!tarjetas || typeof tarjetas !== 'object') return null;
  return [
    { title: 'Ventas e ingresos', value: `Bs ${Number(tarjetas.ingresos_confirmados || 0).toLocaleString('es-BO')}`, detail: 'Ingresos confirmados', icon: WalletCards, tone: 'indigo' },
    { title: 'Ocupacion de salas', value: `${Number(tarjetas.ocupacion_promedio || 0).toLocaleString('es-BO')}%`, detail: 'Ocupacion promedio', icon: Utensils, tone: 'green' },
    { title: 'Inventario critico', value: `${tarjetas.productos_criticos || 0}`, detail: 'Productos bajo umbral', icon: PackageSearch, tone: 'orange' },
    { title: 'Preordenes', value: `${tarjetas.preordenes_activas || 0}`, detail: 'Preordenes activas', icon: CheckCircle2, tone: 'purple' },
    { title: 'Reservas totales', value: `${tarjetas.reservas_totales || 0}`, detail: 'Reservas registradas', icon: CalendarDays, tone: 'blue' },
    { title: 'Ventas reales', value: `${tarjetas.ventas_reales || 0}`, detail: 'Pedidos pagados', icon: TrendingUp, tone: 'red' }
  ];
};

const maxValue = (data) => Math.max(...data.map((item) => item.value), 1);

const ChartCard = ({ title, subtitle, data, variant = 'bar' }) => {
  const max = maxValue(data);

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

      {variant === 'line' ? (
        <div className="mt-6 flex h-48 items-end gap-3 border-b border-l border-slate-100 px-2 pb-3">
          {data.map((item) => (
            <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="relative flex h-36 w-full items-end justify-center">
                <div
                  className="w-full max-w-10 rounded-t-xl bg-gradient-to-t from-indigo-600 to-cyan-400 shadow-sm"
                  style={{ height: `${Math.max((item.value / max) * 100, 8)}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {data.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-slate-600">{item.label}</span>
                <span className="font-bold text-slate-900">{item.value.toLocaleString('es-BO')}</span>
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
            <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">{value}</p>
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
        Datos actualizados
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
          {rows.map((row, rowIndex) => (
            <tr key={`${title}-${rowIndex}`} className="hover:bg-slate-50">
              {row.map((cell, cellIndex) => {
                const isEstado = headers[cellIndex]?.toLowerCase().includes('estado');
                return (
                  <td key={`${title}-${rowIndex}-${cellIndex}`} className="px-5 py-4 text-slate-600">
                    {isEstado ? (
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${badgeClasses[cell] || 'bg-slate-100 text-slate-700 ring-slate-200'}`}>
                        {cell}
                      </span>
                    ) : (
                      <span className={cellIndex === row.length - 1 ? 'font-bold text-slate-900' : ''}>{cell}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
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
      {options.map((option) => <option key={option}>{option}</option>)}
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
  const [textoVoz, setTextoVoz] = useState('Muestrame las reservas canceladas de la semana');
  const [escuchando, setEscuchando] = useState(false);
  const [filtros, setFiltros] = useState(filtrosIniciales);

  const tarjetasEstaticas = useMemo(
    () => normalizeBackendCards(reporteEstatico) || resumenEstatico,
    [reporteEstatico]
  );

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
      if (!silencioso) setError('No se pudo conectar con el backend. Se muestran datos de maqueta del CU25.');
      console.error('[GenerarReporte] reporte estatico:', err);
    } finally {
      if (!silencioso) setLoading(false);
    }
  };

  const cargarReporteDinamico = async () => {
    limpiarFeedback();
    setLoading(true);
    try {
      await getReporteDinamico({
        tipo: filtros.tipo,
        fecha_inicio: filtros.fechaInicio,
        fecha_fin: filtros.fechaFin,
        estado: filtros.estado,
        metodo_pago: filtros.metodo,
        umbral_stock: filtros.umbral,
        agrupar_por: filtros.agruparPor
      });
      setMensaje('Reporte dinamico generado con los filtros seleccionados.');
    } catch (err) {
      setError('No se pudo conectar con el backend. La interfaz conserva datos de ejemplo.');
      console.error('[GenerarReporte] reporte dinamico:', err);
    } finally {
      setLoading(false);
    }
  };

  const interpretarVoz = async () => {
    limpiarFeedback();
    setLoading(true);
    try {
      await generarReporteVoz({ texto: textoVoz });
      setMensaje('La IA interpreto la solicitud y genero el reporte.');
    } catch (err) {
      setMensaje('Solicitud interpretada en modo maqueta.');
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
              <ChartCard title="Reservas por estado" subtitle="Distribucion semanal de reservas" data={charts.reservasEstado} />
              <ChartCard title="Ocupacion por sala" subtitle="Porcentaje promedio por ambiente" data={charts.ocupacionSala} />
              <ChartCard title="Inventario critico por categoria" subtitle="Productos bajo umbral minimo" data={charts.inventarioCategoria} />
              <ChartCard title="Ingresos por dia" subtitle="Ingresos confirmados en Bs" data={charts.ingresosDia} variant="line" />
              <ChartCard title="Ventas por producto" subtitle="Productos mas vendidos" data={charts.ventasProducto} />
            </div>
            <DetailTable
              title="Tabla de detalle"
              subtitle="Movimientos principales del reporte estatico"
              headers={['Fecha', 'Tipo', 'Concepto', 'Estado', 'Metodo', 'Total (Bs)']}
              rows={tablaEstatico}
            />
            <footer className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs font-semibold text-slate-500 shadow-sm">
              Los datos se actualizan cada 5 minutos. Ultima actualizacion: 21/06/2026 17:55
            </footer>
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
                <Field label="Estado">
                  <SelectField value={filtros.estado} onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })} options={['Todos', 'Confirmado', 'Pendiente', 'Pagado', 'Cancelado']} />
                </Field>
                <Field label="Metodo de pago">
                  <SelectField value={filtros.metodo} onChange={(e) => setFiltros({ ...filtros, metodo: e.target.value })} options={['Todos', 'QR', 'Tarjeta', 'Efectivo', 'Stripe']} />
                </Field>
                <Field label="Umbral inventario">
                  <input type="number" value={filtros.umbral} onChange={(e) => setFiltros({ ...filtros, umbral: e.target.value })} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
                </Field>
                <Field label="Agrupar por">
                  <SelectField value={filtros.agruparPor} onChange={(e) => setFiltros({ ...filtros, agruparPor: e.target.value })} options={['Dia', 'Semana', 'Mes', 'Estado', 'Metodo de pago', 'Sala']} />
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

            <SummaryGrid cards={resumenDinamico} />
            <div className="grid gap-6 xl:grid-cols-3">
              <ChartCard title="Ventas por producto" subtitle="Resultado segun filtros" data={charts.ventasProducto} />
              <ChartCard title="Ingresos por dia" subtitle="Tendencia del periodo" data={charts.ingresosDia} variant="line" />
              <ChartCard title="Pagos por metodo" subtitle="Distribucion de cobros" data={charts.pagosMetodo} />
            </div>
            <DetailTable
              title="Tabla dinamica"
              subtitle="Datos filtrados por periodo, estado y metodo de pago"
              headers={['Fecha', 'Producto / Concepto', 'Categoria', 'Cantidad', 'Metodo de pago', 'Estado', 'Total (Bs)']}
              rows={tablaDinamico}
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
                    placeholder="Muestrame las reservas canceladas de la semana"
                  />
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                    <span className="rounded-full bg-slate-100 px-3 py-1">Muestrame las ventas de hoy por metodo de pago</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">Inventario critico menor a 5</span>
                  </div>
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
                    <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                      <div><dt className="text-slate-400">Tipo</dt><dd className="font-bold">Reservas</dd></div>
                      <div><dt className="text-slate-400">Agrupar por</dt><dd className="font-bold">Estado</dd></div>
                      <div><dt className="text-slate-400">Fecha inicio</dt><dd className="font-bold">15/06/2026</dd></div>
                      <div><dt className="text-slate-400">Fecha fin</dt><dd className="font-bold">21/06/2026</dd></div>
                      <div className="col-span-2"><dt className="text-slate-400">Confianza</dt><dd className="font-bold text-emerald-700">94%</dd></div>
                    </dl>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-4 text-sm font-bold text-indigo-900">
              Encontre 18 reservas canceladas esta semana.
            </section>

            <SummaryGrid cards={resumenVoz} />
            <div className="grid gap-6 xl:grid-cols-2">
              <ChartCard title="Reservas por estado" subtitle="Interpretacion de la solicitud por voz" data={charts.reservasEstado} />
              <ChartCard title="Ocupacion por sala" subtitle="Contexto relacionado con las reservas" data={charts.ocupacionSala} />
            </div>
            <DetailTable
              title="Detalle de reservas canceladas"
              subtitle="Reservas detectadas por la interpretacion IA"
              headers={['Fecha', 'Cliente', 'Sala', 'Estado', 'Motivo', 'Total']}
              rows={tablaVoz}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerarReporte;
