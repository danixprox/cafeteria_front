import { useState, useEffect, useCallback } from 'react';
import preordenesService from '../../services/preordenesService';
import CardPreorden from './CardPreorden';

const PanelPreordenes = () => {
  const [preordenes, setPreordenes] = useState([]);
  const [cargando, setCargando]     = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError]           = useState('');

  const mostrarError = (msg) => { setError(msg); setTimeout(() => setError(''), 5000); };

  // Solo mostrar preórdenes aún no convertidas en pedido
  const ESTADOS_VISIBLES = ['programada', 'apartada'];

  const cargarPreordenes = useCallback(async (silencioso = false) => {
    if (!silencioso) setCargando(true);
    else setActualizando(true);
    try {
      const res = await preordenesService.getHoy();
      const todas = Array.isArray(res.data) ? res.data : [];
      setPreordenes(todas.filter(p => ESTADOS_VISIBLES.includes(p.estado)));
      setError('');
    } catch (err) {
      if (err.response?.status !== 403) {
        mostrarError('Error al cargar las preórdenes');
      }
      setPreordenes([]);
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { cargarPreordenes(); }, [cargarPreordenes]);

  return (
    <section className="rounded-[2rem] bg-white p-8 shadow-lg ring-1 ring-slate-200">

      {/* Cabecera */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">Reservas de hoy</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Preórdenes</h2>
          <p className="mt-1 text-sm text-slate-500">
            Productos apartados por clientes con reserva para hoy.
            Visibles a partir de las <strong>3:00 PM</strong>.
          </p>
        </div>
        <button
          onClick={() => cargarPreordenes(true)}
          disabled={actualizando}
          className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
        >
          <span className={actualizando ? 'animate-spin' : ''}>↻</span>
          Actualizar
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Contenido */}
      {cargando ? (
        <div className="py-16 text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
          <p className="text-sm text-slate-400">Cargando preórdenes...</p>
        </div>
      ) : preordenes.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-slate-500 font-medium">No hay preórdenes apartadas para hoy.</p>
          <p className="mt-2 text-sm text-slate-400">
            Las preórdenes aparecen aquí cuando los clientes las crean al reservar.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {preordenes.map(p => (
            <CardPreorden key={p.id} preorden={p} />
          ))}
        </div>
      )}
    </section>
  );
};

export default PanelPreordenes;
