import { useEffect, useState } from "react";

import {
    obtenerMisNotificaciones,
    marcarLeido,
    contarNoLeidas
} from "../../services/notificacionesService";

const MisNotificaciones = () => {

    const [notificaciones, setNotificaciones] = useState([]);

    const cargarNotificaciones = async () => {

        try {

            const data = await obtenerMisNotificaciones();

            // Formatear fecha y mantener orden
            const parsed = data.map(n => ({
                ...n,
                fecha_fmt: n.fecha ? new Date(n.fecha).toLocaleString() : ''
            }));

            setNotificaciones(parsed);

            // Marcar como leídas las no leídas y actualizar contador global
            const toMark = parsed.filter(x => !x.leido).map(x => marcarLeido(x.id));
            if (toMark.length > 0) {
                try {
                    await Promise.all(toMark);
                    const cnt = await contarNoLeidas();
                    window.dispatchEvent(new CustomEvent('notificaciones:update', { detail: { count: cnt.count || 0 } }));
                    // actualizar estado local
                    setNotificaciones(prev => prev.map(p => ({ ...p, leido: true })));
                } catch (e) {
                    console.error('Error marcando notificaciones leidas', e);
                }
            }

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

    return (

        <div className="min-h-screen bg-slate-50 p-6">

            <div className="max-w-5xl mx-auto">

                <div className="mb-8">

                    <h1 className="text-3xl font-bold text-slate-800">
                        Mis Notificaciones
                    </h1>

                    <p className="text-slate-500 mt-2">
                        Consulta las notificaciones de tus reservas.
                    </p>

                </div>

                <div className="grid gap-5">

                    {notificaciones.length === 0 && (

                        <div className="bg-white rounded-2xl shadow p-6">

                                <p className="text-slate-500">
                                No tienes notificaciones.
                            </p>

                        </div>
                    )}

                    {notificaciones.map((n) => (

                        <div
                            key={n.id}
                            className="bg-white rounded-2xl shadow border border-slate-200 p-6"
                        >

                            <div className="flex justify-between items-start">

                                <div>

                                    <h2 className={`text-lg ${n.leido ? 'font-normal' : 'font-semibold'} text-slate-800`}>
                                        {n.tipo}
                                    </h2>

                                    <p className="text-slate-600 mt-2">
                                        {n.mensaje}
                                    </p>

                                    <p className="text-slate-400 text-sm mt-3">
                                        {n.fecha_fmt || n.fecha}
                                    </p>

                                </div>

                                {!n.leido ? (
                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                                        Nueva
                                    </span>
                                ) : (
                                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm">Leída</span>
                                )}

                            </div>

                        </div>
                    ))}

                </div>

            </div>

        </div>
    );
};

export default MisNotificaciones;