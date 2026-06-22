import React, { useEffect, useState } from 'react';
import { reservasService } from '../../services/reservasService';

// ── Badge de estado ───────────────────────────────────────────────────────────

const BADGE = {
  pendiente:  'bg-yellow-100 text-yellow-800',
  confirmada: 'bg-blue-100 text-blue-800',
  en_curso:   'bg-green-100 text-green-800',
  finalizada: 'bg-gray-200 text-gray-700',
  cancelada:  'bg-red-100 text-red-800',
  no_asistio: 'bg-orange-100 text-orange-800',
};

const LABEL = {
  pendiente:  'Pendiente',
  confirmada: 'Confirmada',
  en_curso:   'En curso',
  finalizada: 'Finalizada',
  cancelada:  'Cancelada',
  no_asistio: 'No asistió',
};

// ── Componente ────────────────────────────────────────────────────────────────

const GestionReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [msg, setMsg]           = useState({ tipo: '', texto: '' });

  function mostrarMsg(tipo, texto) {
    setMsg({ tipo, texto });
    setTimeout(() => setMsg({ tipo: '', texto: '' }), 6000);
  }

  // ── Cargar reservas ──────────────────────────────────────────────────────
  const cargarReservas = () => {
    setLoading(true);
    reservasService.getAll()
      .then(res => {
        setReservas(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => {
        console.error('[GestionReservas] Error al cargar:', err.response || err);
        mostrarMsg('error', `Error al cargar reservas: ${err.response?.status || err.message}`);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const cargaInicial = setTimeout(cargarReservas, 0);
    const intervalo = setInterval(cargarReservas, 30000);
    return () => {
      clearTimeout(cargaInicial);
      clearInterval(intervalo);
    };
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  // ── Feedback ─────────────────────────────────────────────────────────────
  const armarMsg = (data, accion) => {
    let texto = data?.mensaje || `${accion} correctamente.`;
    if (data?.preorden_cancelada)
      texto += ` Preorden #${data.preorden_id} cancelada automáticamente.`;
    else if (data?.preorden_procesada)
      texto += ` Preorden #${data.preorden_id} convertida en pedido #${data.pedido_id}.`;
    else if (data?.faltantes?.length)
      texto += ` ⚠ Sin stock: ${data.faltantes.join(' | ')}`;
    else if (data?.preorden_aviso)
      texto += ` ${data.preorden_aviso}`;
    return texto;
  };

  // ── Acciones ──────────────────────────────────────────────────────────────

  const handleConfirmar = async (id) => {
    try {
      const res = await reservasService.confirmar(id);
      mostrarMsg('exito', armarMsg(res.data, 'Reserva confirmada'));
      cargarReservas();
    } catch (err) {
      mostrarMsg('error', err.response?.data?.error || 'Error al confirmar la reserva.');
    }
  };

  const handleCheckin = async (id) => {
    try {
      const res = await reservasService.confirmarLlegada(id);
      mostrarMsg('exito', armarMsg(res.data, 'Check-in realizado'));
      cargarReservas();
    } catch (err) {
      mostrarMsg('error', err.response?.data?.error || 'Error al hacer check-in.');
    }
  };

  const handleFinalizar = async (id) => {
    try {
      const res = await reservasService.finalizar(id);
      mostrarMsg('exito', armarMsg(res.data, 'Reserva finalizada'));
      cargarReservas();
    } catch (err) {
      mostrarMsg('error', err.response?.data?.error || 'Error al finalizar la reserva.');
    }
  };

  const handleCancelar = async (id) => {
    if (!window.confirm('¿Seguro que deseas cancelar esta reserva?')) return;
    try {
      const res = await reservasService.cancelar(id);
      mostrarMsg('exito', armarMsg(res.data, 'Reserva cancelada'));
      cargarReservas();
    } catch (err) {
      mostrarMsg('error', err.response?.data?.error || 'Error al cancelar la reserva.');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-10 text-center text-slate-500 font-bold">
        Cargando reservas...
      </div>
    );
  }

  return (
    <div className="w-full">

      {/* Cabecera */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-slate-800">Gestión de Reservas</h2>
        <button
          onClick={cargarReservas}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
        >
          ↻ Actualizar
        </button>
      </div>

      {/* Feedback */}
      {msg.texto && (
        <div className={`mb-4 rounded-xl border px-4 py-3 text-sm font-semibold ${
          msg.tipo === 'exito'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-red-200 bg-red-50 text-red-700'
        }`}>
          {msg.tipo === 'exito' ? '✓' : '✗'} {msg.texto}
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Cliente</th>
              <th className="p-4 text-left">Sala</th>
              <th className="p-4 text-left">Mesa</th>
              <th className="p-4 text-left">Fecha</th>
              <th className="p-4 text-left">Hora</th>
              <th className="p-4 text-left">Estado</th>
              <th className="p-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  No hay reservas registradas.
                </td>
              </tr>
            ) : (
              reservas.map((r) => (
                <tr key={r.id} className="border-b hover:bg-slate-50 transition">
                  <td className="p-4 font-semibold">{r.cliente_nombre}</td>
                  <td className="p-4">{r.sala_nombre}</td>
                  <td className="p-4">{r.mesa_nombre}</td>
                  <td className="p-4">{r.fecha}</td>
                  <td className="p-4">{r.hora_inicio?.slice(0, 5)}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${BADGE[r.estado] || 'bg-gray-100 text-gray-700'}`}>
                      {LABEL[r.estado] || r.estado}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">

                      {/* pendiente: Confirmar + Cancelar */}
                      {r.estado === 'pendiente' && (
                        <>
                          <button
                            onClick={() => handleConfirmar(r.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-bold"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => handleCancelar(r.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-bold"
                          >
                            Cancelar
                          </button>
                        </>
                      )}

                      {/* confirmada: Check-in + Cancelar */}
                      {r.estado === 'confirmada' && (
                        <>
                          <button
                            onClick={() => handleCheckin(r.id)}
                            disabled={!r.puede_hacer_checkin}
                            title={r.mensaje_checkin || ''}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-sm font-bold"
                          >
                            Check-in
                          </button>
                          <button
                            onClick={() => handleCancelar(r.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-bold"
                          >
                            Cancelar
                          </button>
                          {!r.puede_hacer_checkin && r.mensaje_checkin && (
                            <span className="basis-full text-xs font-semibold text-amber-700">
                              {r.mensaje_checkin}
                            </span>
                          )}
                        </>
                      )}

                      {/* en_curso: solo Finalizar */}
                      {r.estado === 'en_curso' && (
                        <button
                          onClick={() => handleFinalizar(r.id)}
                          className="bg-slate-700 hover:bg-slate-800 text-white px-3 py-2 rounded-lg text-sm font-bold"
                        >
                          Finalizar
                        </button>
                      )}

                      {/* finalizada / cancelada: sin acciones */}

                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default GestionReservas;
