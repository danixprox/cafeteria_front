import React, { useEffect, useState } from 'react';
import { reservasService } from '../../services/reservasService';

const MisReservas = () => {
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);

    const cargarReservas = () => {
        reservasService.getMisReservas()
            .then(res => setReservas(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        cargarReservas();
    }, []);

    const handleCancelar = async (id) => {
        if(window.confirm('¿Estás seguro de cancelar esta reserva?')) {
            try {
                await reservasService.cancelar(id);
                cargarReservas();
            } catch (error) {
                alert(error.response?.data?.error || 'Error al cancelar');
            }
        }
    };

    const getEstadoClass = (estado) => {
        const clases = {
            'pendiente': 'bg-yellow-100 text-yellow-800',
            'confirmada': 'bg-blue-100 text-blue-800',
            'en_curso': 'bg-green-100 text-green-800',
            'finalizada': 'bg-gray-100 text-gray-800',
            'cancelada': 'bg-red-100 text-red-800',
            'liberada': 'bg-purple-100 text-purple-800',
            'no_asistio': 'bg-red-100 text-red-800',
        };
        return clases[estado] || 'bg-gray-100 text-gray-800';
    };

    if (loading) return <div className="p-10 text-center">Cargando tus reservas...</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Mis Reservas</h1>

            {reservas.length === 0 ? (
                <div className="text-center p-10 bg-white rounded-lg shadow border">
                    <p className="text-gray-500">Aún no tienes reservas registradas.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reservas.map(reserva => (
                        <div key={reserva.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">{reserva.sala_nombre}</h3>
                                    <p className="text-sm text-gray-500">Mesa: {reserva.mesa_nombre}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getEstadoClass(reserva.estado)}`}>
                                    {reserva.estado.replace('_', ' ')}
                                </span>
                            </div>
                            
                            <div className="mb-4 grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded">
                                <div>
                                    <p className="text-gray-500">Fecha</p>
                                    <p className="font-semibold">{reserva.fecha}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Horario</p>
                                    <p className="font-semibold">{reserva.hora_inicio.substring(0,5)} - {reserva.hora_fin.substring(0,5)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Personas</p>
                                    <p className="font-semibold">{reserva.cantidad_personas}</p>
                                </div>
                            </div>

                            {['pendiente', 'confirmada'].includes(reserva.estado) && (
                                <button 
                                    onClick={() => handleCancelar(reserva.id)}
                                    className="w-full text-red-600 hover:bg-red-50 py-2 rounded border border-red-200 transition font-medium"
                                >
                                    Cancelar Reserva
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MisReservas;
