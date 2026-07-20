import React, { useEffect, useMemo, useState } from 'react';
import opinionesService from '../services/opinionesService';

const estrellas = [1, 2, 3, 4, 5];

const Estrellas = ({ value, onChange, readOnly = false }) => (
  <div className="flex items-center gap-1">
    {estrellas.map((n) => (
      <button
        key={n}
        type="button"
        onClick={() => !readOnly && onChange?.(n)}
        disabled={readOnly}
        className={`text-2xl transition ${n <= value ? 'text-amber-400' : 'text-slate-300'} ${readOnly ? 'cursor-default' : 'hover:scale-110 hover:text-amber-400'}`}
        aria-label={`${n} estrellas`}
      >
        ★
      </button>
    ))}
  </div>
);

const OpinionCard = ({ opinion, admin, onToggle }) => (
  <article className={`rounded-3xl border bg-white p-5 shadow-sm ${opinion.visible ? 'border-slate-200' : 'border-slate-200 opacity-70'}`}>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-sm font-black text-slate-900">{opinion.cliente_nombre || 'Cliente'}</p>
        <p className="text-xs text-slate-400">
          {new Date(opinion.created_at).toLocaleString('es-BO')}
          {opinion.pedido_codigo ? ` · ${opinion.pedido_codigo}` : ''}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Estrellas value={opinion.calificacion} readOnly />
        {admin && (
          <button
            type="button"
            onClick={() => onToggle?.(opinion)}
            className={`rounded-full px-3 py-1 text-xs font-bold transition ${opinion.visible ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {opinion.visible ? 'Visible' : 'Oculta'}
          </button>
        )}
      </div>
    </div>
    <p className="mt-4 text-sm leading-relaxed text-slate-600">
      {opinion.comentario || 'Sin comentario adicional.'}
    </p>
  </article>
);

const OpinionesPanel = ({ modo = 'cliente' }) => {
  const esAdmin = modo === 'admin';
  const soloLectura = modo === 'empleado';
  const [opiniones, setOpiniones] = useState([]);
  const [misOpiniones, setMisOpiniones] = useState([]);
  const [resumen, setResumen] = useState({ promedio: 0, total: 0 });
  const [puedeOpinarHoy, setPuedeOpinarHoy] = useState(true);
  const [calificacion, setCalificacion] = useState(5);
  const [comentario, setComentario] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const titulo = useMemo(() => {
    if (esAdmin) return 'Opiniones y calificaciones';
    if (soloLectura) return 'Opiniones de clientes';
    return 'Mis opiniones';
  }, [esAdmin, soloLectura]);

  const cargar = async () => {
    setCargando(true);
    try {
      const params = esAdmin || soloLectura ? {} : { mias: 1 };
      const [listaRes, miasRes] = await Promise.all([
        opinionesService.listar(params),
        esAdmin || soloLectura ? Promise.resolve(null) : opinionesService.mias(),
      ]);
      setOpiniones(listaRes.data?.results || []);
      setResumen(listaRes.data?.resumen || { promedio: 0, total: 0 });
      if (miasRes) {
        setMisOpiniones(miasRes.data?.results || []);
        setPuedeOpinarHoy(Boolean(miasRes.data?.puede_opinar_hoy));
      }
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.error || 'Error al cargar opiniones.' });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo]);

  const crearOpinion = async (e) => {
    e.preventDefault();
    if (!puedeOpinarHoy) return;
    setGuardando(true);
    setMensaje(null);
    try {
      await opinionesService.crear({ calificacion, comentario: comentario.trim() });
      setComentario('');
      setCalificacion(5);
      setMensaje({ tipo: 'exito', texto: 'Gracias, tu opinión fue registrada.' });
      await cargar();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.error || 'No se pudo registrar la opinión.' });
    } finally {
      setGuardando(false);
    }
  };

  const toggleVisible = async (opinion) => {
    try {
      const res = await opinionesService.actualizarVisibilidad(opinion.id, !opinion.visible);
      setOpiniones((prev) => prev.map((item) => item.id === opinion.id ? res.data : item));
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.error || 'No se pudo actualizar la opinión.' });
    }
  };

  const lista = esAdmin || soloLectura ? opiniones : misOpiniones;

  return (
    <section className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-4xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-amber-700">CU30</p>
              <h1 className="mt-2 text-3xl font-black text-slate-900">{titulo}</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Los clientes pueden registrar una reseña diaria con estrellas y comentario. Administración puede revisar y moderar la visibilidad.
              </p>
            </div>
            <div className="rounded-3xl bg-amber-50 px-5 py-4 text-center ring-1 ring-amber-100">
              <p className="text-4xl font-black text-amber-600">{resumen.promedio || 0}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">{resumen.total || 0} opiniones</p>
            </div>
          </div>
        </header>

        {mensaje && (
          <div className={`rounded-2xl px-4 py-3 text-sm font-semibold ${mensaje.tipo === 'exito' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-red-50 text-red-700 ring-1 ring-red-100'}`}>
            {mensaje.texto}
          </div>
        )}

        {!esAdmin && !soloLectura && (
          <form onSubmit={crearOpinion} className="rounded-4xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
              <div className="lg:w-64">
                <p className="text-sm font-black text-slate-900">Tu calificación</p>
                <div className="mt-2"><Estrellas value={calificacion} onChange={setCalificacion} /></div>
                <p className="mt-2 text-xs text-slate-400">Solo una opinión por día.</p>
              </div>
              <div className="flex-1">
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value.slice(0, 500))}
                  maxLength={500}
                  rows={4}
                  disabled={!puedeOpinarHoy || guardando}
                  placeholder={puedeOpinarHoy ? 'Cuéntanos cómo fue tu experiencia...' : 'Ya registraste una opinión hoy.'}
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-xs text-slate-400">{comentario.length}/500</span>
                  <button
                    type="submit"
                    disabled={!puedeOpinarHoy || guardando}
                    className="rounded-2xl bg-amber-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-amber-100 transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    {guardando ? 'Guardando...' : 'Publicar opinión'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        <div className="grid gap-4">
          {cargando ? (
            <p className="rounded-3xl bg-white p-8 text-center text-slate-400 ring-1 ring-slate-200">Cargando opiniones...</p>
          ) : lista.length === 0 ? (
            <p className="rounded-3xl bg-white p-8 text-center text-slate-400 ring-1 ring-slate-200">No hay opiniones registradas.</p>
          ) : (
            lista.map((opinion) => (
              <OpinionCard key={opinion.id} opinion={opinion} admin={esAdmin} onToggle={toggleVisible} />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default OpinionesPanel;
