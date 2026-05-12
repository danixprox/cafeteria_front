import { useEffect, useState } from "react";

import {
    obtenerPendientes,
    realizarCheckin,
    marcarNoAsistio
} from "../../services/asistenciaService";

const ControlAsistencia = () => {

    const [reservas, setReservas] = useState([]);

    const cargarReservas = async () => {

        try {

            const data = await obtenerPendientes();

            setReservas(data);

        } catch (error) {

            console.error(error);
        }
    };

   useEffect(() => {

    const cargar = async () => {

        await cargarReservas();
    };

    cargar();

}, []);

    const handleCheckin = async (id) => {

        await realizarCheckin(id);

        cargarReservas();
    };

    const handleNoAsistio = async (id) => {

        await marcarNoAsistio(id);

        cargarReservas();
    };

    return (

        <div className="p-6">

            <div className="mb-8">

                <h1 className="text-3xl font-bold text-slate-800">
                    Control de Asistencia
                </h1>

                <p className="text-slate-500 mt-2">
                    Gestiona check-in e inasistencias de reservas.
                </p>

            </div>

            <div className="grid gap-5">

                {reservas.length === 0 && (

                    <div className="bg-white rounded-xl shadow p-6">

                        <p className="text-slate-500">
                            No existen reservas pendientes.
                        </p>

                    </div>
                )}

                {reservas.map((r) => (

                    <div
                        key={r.id}
                        className="bg-white rounded-2xl shadow border border-slate-200 p-6"
                    >

                        <div className="flex items-center justify-between">

                            <div>

                                <h2 className="text-xl font-semibold text-slate-800">
                                    {r.cliente}
                                </h2>

                                <p className="text-slate-500 mt-1">
                                    Sala: {r.sala}
                                </p>

                                <p className="text-slate-500">
                                    Mesa: {r.mesa}
                                </p>

                                <p className="text-slate-500">
                                    Fecha: {r.fecha}
                                </p>

                                <p className="text-slate-500">
                                    Hora: {r.hora_inicio}
                                </p>

                            </div>

                            <div className="flex gap-3">

                                <button
                                    onClick={() => handleCheckin(r.id)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition"
                                >
                                    Check-In
                                </button>

                                <button
                                    onClick={() => handleNoAsistio(r.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg transition"
                                >
                                    No Asistió
                                </button>

                            </div>

                        </div>

                    </div>
                ))}

            </div>

        </div>
    );
};

export default ControlAsistencia;