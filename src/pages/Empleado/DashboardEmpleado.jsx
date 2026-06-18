import React, { useEffect, useState } from 'react';
import { reservasService } from '../../services/reservasService';

const DashboardEmpleado = () => {
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);

    const cargarReservas = () => {
        setLoading(true);
        reservasService.getAll()
            .then(res => {
                // Filtrar solo las de hoy que no estén canceladas, u ordenarlas
                // Para el prototipo, mostramos todas o filtramos en el backend
                setReservas(res.data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        const cargaInicial = setTimeout(cargarReservas, 0);
        const intervalo = setInterval(cargarReservas, 30000);
        return () => {
            clearTimeout(cargaInicial);
            clearInterval(intervalo);
        };
    }, []);

    const cambiarEstado = async (id, accion) => {
        try {
            await reservasService[accion](id);
            cargarReservas();
        } catch (error) {
            alert(`Error al ejecutar la acción: ${error.response?.data?.error || error.message}`);
        }
    };

    const renderBotonesAccion = (reserva) => {
        switch (reserva.estado) {
            case 'pendiente':
            case 'confirmada':
                return (
                    <div className="space-x-2">
                        <button
                            onClick={() => cambiarEstado(reserva.id, 'confirmarLlegada')}
                            disabled={!reserva.puede_hacer_checkin}
                            title={reserva.mensaje_checkin || ''}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            Confirmar Llegada
                        </button>
                        <button onClick={() => cambiarEstado(reserva.id, 'noAsistio')} className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-700">
                            No Asistió
                        </button>
                    </div>
                );
            case 'en_curso':
                return (
                    <div className="space-x-2">
                        <button onClick={() => cambiarEstado(reserva.id, 'finalizar')} className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700">
                            Finalizar (Completada)
                        </button>
                        <button onClick={() => cambiarEstado(reserva.id, 'liberar')} className="bg-purple-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-purple-700">
                            Liberar Mesa (Se fue antes)
                        </button>
                    </div>
                );
            default:
                return <span className="text-gray-400 text-sm italic">Sin acciones</span>;
        }
    };

    if (loading) return <div className="p-10 text-center">Cargando panel de recepción...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Recepción y Reservas</h1>

            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sala / Mesa</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha / Hora</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado Actual</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {reservas.map(reserva => (
                            <tr key={reserva.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-bold text-sm text-gray-900">{reserva.cliente_nombre}</div>
                                    <div className="text-xs text-gray-500">{reserva.cantidad_personas} personas</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{reserva.sala_nombre}</div>
                                    <div className="text-xs text-gray-500 font-medium">Mesa: {reserva.mesa_nombre}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-semibold text-gray-900">{reserva.fecha}</div>
                                    <div className="text-xs text-gray-500">{reserva.hora_inicio.substring(0,5)} a {reserva.hora_fin.substring(0,5)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border 
                                        ${reserva.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                                        ${reserva.estado === 'confirmada' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
                                        ${reserva.estado === 'en_curso' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                                        ${reserva.estado === 'finalizada' ? 'bg-gray-100 text-gray-800 border-gray-200' : ''}
                                        ${['cancelada', 'no_asistio'].includes(reserva.estado) ? 'bg-red-100 text-red-800 border-red-200' : ''}
                                        ${reserva.estado === 'liberada' ? 'bg-purple-100 text-purple-800 border-purple-200' : ''}
                                    `}>
                                        {reserva.estado.toUpperCase().replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {renderBotonesAccion(reserva)}
                                </td>
                            </tr>
                        ))}
                        {reservas.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                    No hay reservas registradas.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DashboardEmpleado;
