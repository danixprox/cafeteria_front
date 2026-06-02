import { useEffect, useState } from "react";

import {
    obtenerNotificaciones,
    enviarNotificacion
} from "../../services/notificacionesService";
import { reservasService } from '../../services/reservasService';

const GestionNotificaciones = () => {

    const [notificaciones, setNotificaciones] = useState([]);
    const [reservas, setReservas] = useState([]);
    const [selectedReserva, setSelectedReserva] = useState(null);
    const [tipoEnvio, setTipoEnvio] = useState('recordatorio');
    const [mensajeEnvio, setMensajeEnvio] = useState('');

    const cargarNotificaciones = async () => {

        try {

            const data = await obtenerNotificaciones();

            setNotificaciones(data);

        } catch (error) {

            console.error(error);
        }
    };

    useEffect(() => {

        const cargar = async () => {

            await cargarNotificaciones();
        };

        cargar();

    }, []);

    useEffect(() => {
        const cargarReservas = async () => {
            try {
                const res = await reservasService.getAll();
                // filtrar reservas confirmadas y pendientes
                const rows = res.data || [];
                const filtradas = rows.filter(r => ['pendiente','confirmada'].includes(r.estado));
                setReservas(filtradas);
            } catch (e) {
                console.error('Error cargando reservas', e);
            }
        };
        cargarReservas();
    }, []);

    const handleEnviar = async () => {
        if (!selectedReserva) return alert('Seleccione una reserva para enviar');
        const payload = {
            reserva_id: selectedReserva,
            tipo: tipoEnvio,
            mensaje: mensajeEnvio || `Notificación manual (${tipoEnvio})`
        };
        try {
            await enviarNotificacion(payload);
            cargarNotificaciones();
            alert('Notificación enviada');
        } catch (e) {
            console.error(e);
            alert('Error al enviar notificación');
        }
    };

    return (

        <div className="p-6">

                <div className="flex items-center justify-between mb-8">

                <div>

                    <h1 className="text-3xl font-bold text-slate-800">
                        Gestión de Notificaciones
                    </h1>

                    <p className="text-slate-500 mt-2">
                        Historial de notificaciones enviadas.
                    </p>

                </div>

            </div>

            <div className="grid gap-5">

                <div className="bg-white rounded-xl shadow p-6">
                    <h3 className="text-lg font-semibold">Enviar notificación manual</h3>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <select className="p-2 border rounded" value={selectedReserva || ''} onChange={e => setSelectedReserva(e.target.value)}>
                            <option value="">-- Seleccione reserva --</option>
                            {reservas.map(r => {
                                const nombre = r.cliente_nombre || r.cliente?.id_usuario?.nombre || r.cliente?.nombre || `Cliente #${r.cliente}` || 'Cliente';
                                const mesa = r.mesa_nombre || r.mesa?.nombre || 'Mesa';
                                const sala = r.sala_nombre || r.sala?.nombre || 'Sala';
                                const fecha = r.fecha ? `${r.fecha} ${r.hora_inicio || ''}` : '';
                                return (
                                    <option key={r.id} value={r.id}>
                                        {`#${r.id} — ${nombre} — ${sala} / ${mesa} — ${fecha}`}
                                    </option>
                                );
                            })}
                        </select>
                        <select className="p-2 border rounded" value={tipoEnvio} onChange={e => setTipoEnvio(e.target.value)}>
                            <option value="recordatorio">Recordatorio</option>
                            <option value="confirmacion">Confirmación</option>
                            <option value="cancelacion">Cancelación</option>
                            <option value="modificacion">Modificación</option>
                        </select>
                        <input className="p-2 border rounded" placeholder="Mensaje (opcional)" value={mensajeEnvio} onChange={e => setMensajeEnvio(e.target.value)} />
                    </div>
                    <div className="mt-3">
                        <button onClick={handleEnviar} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Enviar</button>
                    </div>
                </div>


                {notificaciones.length === 0 && (

                    <div className="bg-white rounded-xl shadow p-6">

                        <p className="text-slate-500">
                            No existen notificaciones.
                        </p>

                    </div>
                )}

                {notificaciones.map((n) => (

                    <div
                        key={n.id}
                        className="bg-white rounded-2xl shadow border border-slate-200 p-6"
                    >

                        <div className="flex items-center justify-between">

                            <div>

                                <h2 className="text-xl font-semibold text-slate-800">
                                    {n.cliente}
                                </h2>

                                <p className="text-slate-500 mt-2">
                                    Tipo: {n.tipo}
                                </p>

                                <p className="text-slate-600 mt-1">
                                    {n.mensaje}
                                </p>

                                <p className="text-slate-400 text-sm mt-2">
                                    {n.fecha ? new Date(n.fecha).toLocaleString() : ''}
                                </p>

                            </div>

                            <div>

                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                                    Enviada
                                </span>

                            </div>

                        </div>

                    </div>
                ))}

            </div>

        </div>
    );
};

export default GestionNotificaciones;