import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservasService } from '../../services/reservasService';

const MisReservas = () => {
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const cargarReservas = () => {
        setLoading(true);
        reservasService.getMisReservas()
            .then(res => setReservas(res.data))
            .catch(err => {
                console.error(err);
                alert('Error al cargar reservas');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        cargarReservas();
    }, []);

    const handleCancelar = async (id, reserva) => {
        if(window.confirm('¿Estás seguro de cancelar esta reserva?')) {
            try {
                await reservasService.cancelar(id);
                alert('Reserva cancelada exitosamente');
                cargarReservas();
            } catch (error) {
                alert(error.response?.data?.error || error.response?.data?.mensaje || 'Error al cancelar');
            }
        }
    };

    const getEstadoBadge = (estado) => {
        const config = {
            'pendiente': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳' },
            'confirmada': { bg: 'bg-blue-100', text: 'text-blue-800', icon: '✓' },
            'en_curso': { bg: 'bg-green-100', text: 'text-green-800', icon: '▶' },
            'finalizada': { bg: 'bg-gray-100', text: 'text-gray-800', icon: '✓✓' },
            'cancelada': { bg: 'bg-red-100', text: 'text-red-800', icon: '✗' },
            'liberada': { bg: 'bg-purple-100', text: 'text-purple-800', icon: '◇' },
            'no_asistio': { bg: 'bg-red-100', text: 'text-red-800', icon: '✗' },
        };
        const c = config[estado] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: '?' };
        return c;
    };

    const puedeSerCancelada = (estado) => {
        return ['pendiente', 'confirmada'].includes(estado);
    };

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) return (
        <div className="p-10 text-center text-slate-500 font-bold min-h-screen flex items-center justify-center">
            <div className="text-lg">Cargando tus reservas...</div>
        </div>
    );

    const activas = reservas.filter(
        r => !['cancelada', 'finalizada', 'no_asistio'].includes(r.estado)
    );

    const historial = reservas.filter(
        r => ['cancelada', 'finalizada', 'no_asistio'].includes(r.estado)
    );


    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen bg-slate-50">
            <div className="mb-8">
                <h1 className="text-4xl font-black text-slate-800 mb-2">Mis Reservas</h1>
                <p className="text-slate-600">Visualiza y gestiona todas tus reservas de salas</p>
            </div>

            {reservas.length === 0 ? (
                <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-slate-200">
                    <p className="text-slate-500 text-lg font-semibold mb-4">Aún no tienes reservas registradas.</p>
                    <button
                        onClick={() => navigate('/cliente/salas')}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
                    >
                        Explorar Salas
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activas.map(reserva => {
                        const badge = getEstadoBadge(reserva.estado);
                        const puedeCancel = puedeSerCancelada(reserva.estado);
                        
                        return (
                            <div key={reserva.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition">
                                <div className={`${badge.bg} ${badge.text} px-6 py-4 flex justify-between items-start`}>
                                    <div>
                                        <h3 className="font-bold text-lg">{reserva.sala_nombre}</h3>
                                        <p className="text-sm opacity-90">Mesa: {reserva.mesa_nombre}</p>
                                    </div>
                                    <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-xs font-bold uppercase whitespace-nowrap`}>
                                        {badge.icon} {reserva.estado.replace('_', ' ')}
                                    </span>
                                </div>
                                
                                <div className="p-6">
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-slate-50 rounded-lg p-3">
                                            <p className="text-xs text-slate-600 font-bold uppercase mb-1">Fecha</p>
                                            <p className="font-bold text-slate-800">{formatearFecha(reserva.fecha)}</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-3">
                                            <p className="text-xs text-slate-600 font-bold uppercase mb-1">Horario</p>
                                            <p className="font-bold text-slate-800">
                                                {reserva.hora_inicio?.substring(0, 5)} - {reserva.hora_fin?.substring(0, 5)}
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-3">
                                            <p className="text-xs text-slate-600 font-bold uppercase mb-1">Personas</p>
                                            <p className="font-bold text-slate-800">{reserva.cantidad_personas} 👥</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-3">
                                            <p className="text-xs text-slate-600 font-bold uppercase mb-1">Creada</p>
                                            <p className="font-bold text-slate-800 text-sm">{new Date(reserva.creada_en).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    {puedeCancel && (
                                        <button 
                                            onClick={() => handleCancelar(reserva.id, reserva)}
                                            className="w-full text-red-600 hover:bg-red-50 py-3 rounded-lg border-2 border-red-200 transition font-bold hover:border-red-300"
                                        >
                                            ✗ Cancelar Reserva
                                        </button>
                                    )}
                                    {!puedeCancel && (
                                        <div className="text-center py-3 text-slate-500 font-semibold text-sm">
                                            No se puede cancelar en este estado
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                        );
                    })}
                </div>
                
            )}
        </div>
    );
};

export default MisReservas;
