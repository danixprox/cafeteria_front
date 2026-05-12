import { useEffect, useState } from "react";

import {
    obtenerNotificaciones,
    enviarNotificacion
} from "../../services/notificacionesService";

const GestionNotificaciones = () => {

    const [notificaciones, setNotificaciones] = useState([]);

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

    const handleEnviar = async () => {

        await enviarNotificacion();

        cargarNotificaciones();
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

                <button
                    onClick={handleEnviar}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition"
                >
                    Enviar Notificación
                </button>

            </div>

            <div className="grid gap-5">

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
                                    {n.fecha}
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