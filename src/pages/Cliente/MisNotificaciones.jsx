import { useEffect, useState } from "react";

import {
    obtenerMisNotificaciones
} from "../../services/notificacionesService";

const MisNotificaciones = () => {

    const [notificaciones, setNotificaciones] = useState([]);

    const cargarNotificaciones = async () => {

        try {

            const data = await obtenerMisNotificaciones();

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

                                    <h2 className="text-lg font-semibold text-slate-800">
                                        {n.tipo}
                                    </h2>

                                    <p className="text-slate-600 mt-2">
                                        {n.mensaje}
                                    </p>

                                    <p className="text-slate-400 text-sm mt-3">
                                        {n.fecha}
                                    </p>

                                </div>

                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                                    Nueva
                                </span>

                            </div>

                        </div>
                    ))}

                </div>

            </div>

        </div>
    );
};

export default MisNotificaciones;