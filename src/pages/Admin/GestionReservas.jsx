import React, { useEffect, useState } from 'react';
import { reservasService } from '../../services/reservasService';

const GestionReservas = () => {

    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);

    const cargarReservas = () => {

        setLoading(true);

        reservasService.getAll()
            .then(res => setReservas(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        cargarReservas();
    }, []);

    // =========================
    // CONFIRMAR RESERVA
    // =========================
    const handleConfirmar = async (id) => {

        try {

            await reservasService.confirmar(id);

            alert('Reserva confirmada correctamente');

            cargarReservas();

        } catch (error) {

            alert(
                error.response?.data?.error ||
                'Error al confirmar reserva'
            );
        }
    };

    // =========================
    // CHECK-IN
    // =========================
    const handleCheckin = async (id) => {

        try {

            await reservasService.confirmarLlegada(id);

            alert('Check-in realizado correctamente');

            cargarReservas();

        } catch (error) {

            alert(
                error.response?.data?.error ||
                'Error en check-in'
            );
        }
    };

    // =========================
    // FINALIZAR
    // =========================
    const handleFinalizar = async (id) => {

        try {

            await reservasService.finalizar(id);

            alert('Reserva finalizada');

            cargarReservas();

        } catch (error) {

            alert(
                error.response?.data?.error ||
                'Error al finalizar'
            );
        }
    };

    // =========================
    // CANCELAR
    // =========================
    const handleCancelar = async (id) => {

        const confirmar = window.confirm(
            '¿Seguro que deseas cancelar esta reserva?'
        );

        if (!confirmar) return;

        try {

            await reservasService.cancelar(id);

            alert('Reserva cancelada');

            cargarReservas();

        } catch (error) {

            alert(
                error.response?.data?.error ||
                'Error al cancelar'
            );
        }
    };

    // =========================
    // BADGES ESTADOS
    // =========================
    const getBadgeEstado = (estado) => {

        const estilos = {

            pendiente: 'bg-yellow-100 text-yellow-800',

            confirmada: 'bg-blue-100 text-blue-800',

            en_curso: 'bg-green-100 text-green-800',

            finalizada: 'bg-gray-200 text-gray-700',

            cancelada: 'bg-red-100 text-red-800',

            no_asistio: 'bg-orange-100 text-orange-800'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${estilos[estado]}`}>
                {estado}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="p-10 text-center text-slate-500 font-bold">
                Cargando reservas...
            </div>
        );
    }

    return (

        <div className="w-full">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">

                <h2 className="text-2xl font-black text-slate-800">
                    Gestión de Reservas
                </h2>

            </div>

            {/* TABLA */}
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

                        {reservas.map((reserva) => (

                            <tr
                                key={reserva.id}
                                className="border-b hover:bg-slate-50 transition"
                            >

                                <td className="p-4 font-semibold">
                                    {reserva.cliente_nombre}
                                </td>

                                <td className="p-4">
                                    {reserva.sala_nombre}
                                </td>

                                <td className="p-4">
                                    {reserva.mesa_nombre}
                                </td>

                                <td className="p-4">
                                    {reserva.fecha}
                                </td>

                                <td className="p-4">
                                    {reserva.hora_inicio}
                                </td>

                                <td className="p-4">
                                    {getBadgeEstado(reserva.estado)}
                                </td>

                                <td className="p-4 flex flex-wrap gap-2">

                                    {/* PENDIENTE */}
                                    {reserva.estado === 'pendiente' && (

                                        <>
                                            <button
                                                onClick={() => handleConfirmar(reserva.id)}
                                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-bold"
                                            >
                                                Confirmar
                                            </button>

                                            <button
                                                onClick={() => handleCancelar(reserva.id)}
                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-bold"
                                            >
                                                Cancelar
                                            </button>
                                        </>
                                    )}

                                    {/* CONFIRMADA */}
                                    {reserva.estado === 'confirmada' && (

                                        <>
                                            <button
                                                onClick={() => handleCheckin(reserva.id)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-bold"
                                            >
                                                Check-in
                                            </button>

                                            <button
                                                onClick={() => handleCancelar(reserva.id)}
                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-bold"
                                            >
                                                Cancelar
                                            </button>
                                        </>
                                    )}

                                    {/* EN CURSO */}
                                    {reserva.estado === 'en_curso' && (

                                        <button
                                            onClick={() => handleFinalizar(reserva.id)}
                                            className="bg-slate-700 hover:bg-slate-800 text-white px-3 py-2 rounded-lg text-sm font-bold"
                                        >
                                            Finalizar
                                        </button>
                                    )}

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
};

export default GestionReservas;