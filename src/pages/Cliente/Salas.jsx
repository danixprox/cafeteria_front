import React, { useEffect, useState } from 'react';
import { salasService } from '../../services/salasService';
import { useNavigate } from 'react-router-dom';

const Salas = () => {
    const [salas, setSalas] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        salasService.getAll()
            .then(res => setSalas(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:8000${imagePath}`;
    };

    const handleImageError = (e) => {
        e.target.src = 'https://via.placeholder.com/600x400?text=Imagen+No+Disponible';
    };

    // Determinar el estado real para el badge: prioriza habilitada sobre disponibilidad
    const getEstadoReal = (sala) => {
        if (sala.habilitada === false) return 'no_disponible';
        return sala.disponibilidad || 'disponible';
    };

    const getBadgeDisponibilidad = (estado) => {
        const badges = {
            'disponible': 'bg-green-100 text-green-800',
            'no_disponible': 'bg-red-100 text-red-800',
            'mantenimiento': 'bg-yellow-100 text-yellow-800',
            'reservada': 'bg-blue-100 text-blue-800'
        };
        const text = {
            'disponible': 'Disponible',
            'no_disponible': 'No disponible',
            'mantenimiento': 'En mantenimiento',
            'reservada': 'Reservada'
        };
        return <span className={`px-3 py-1 rounded-full text-xs font-black uppercase shadow-sm ${badges[estado] || 'bg-gray-100'}`}>{text[estado] || estado}</span>;
    };

    if (loading) return <div className="p-10 text-center text-slate-500 font-bold">Cargando catálogo de salas...</div>;

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2 text-center tracking-tight">Catálogo de Salas</h1>
            <p className="text-center text-slate-600 mb-10 max-w-2xl mx-auto">Explora nuestras salas temáticas y elige el ambiente perfecto para tu próxima visita. Reserva tu mesa con antelación.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {salas.map(sala => {
                        const estadoReal = getEstadoReal(sala);
                        const estaDisponible = sala.habilitada !== false && estadoReal === 'disponible';
                        return (
                        <div key={sala.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300">
                            {/* Imagen Principal */}
                            <div className="h-56 bg-slate-200 relative overflow-hidden">
                                {sala.imagen_principal ? (
                                    <img src={getImageUrl(sala.imagen_principal)} onError={handleImageError} alt={sala.nombre} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold bg-slate-100">Sin foto</div>
                                )}
                                <div className="absolute top-4 right-4">
                                    {getBadgeDisponibilidad(estadoReal)}
                                </div>
                            </div>

                            {/* Detalles */}
                            <div className="p-6 flex flex-col flex-1">
                                <h2 className="text-2xl font-black text-slate-800 mb-1">{sala.nombre}</h2>
                                <p className="text-indigo-600 font-bold text-sm uppercase tracking-wider mb-3">
                                    {sala.tematica || 'General'}
                                </p>
                                
                                <p className="text-slate-600 text-sm mb-5 line-clamp-3 flex-1">
                                    {sala.descripcion || 'Una excelente opción para tu reserva.'}
                                </p>
                                
                                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 mb-5">
                                    <div className="text-center w-full">
                                        <p className="text-xs text-slate-500 font-bold uppercase mb-1">Capacidad Total</p>
                                        <p className="font-black text-slate-800">{sala.capacidad_total} <span className="text-sm font-normal text-slate-600">personas</span></p>
                                    </div>
                                </div>

                                {/* Botón */}
                                <button 
                                    onClick={() => navigate(`/cliente/salas/${sala.id}`)}
                                    disabled={!estaDisponible}
                                    className={`w-full py-3 rounded-xl font-bold transition flex justify-center items-center gap-2 ${
                                        estaDisponible
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm' 
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    }`}
                                >
                                    {estaDisponible ? 'Ver Detalles y Reservar' : estadoReal === 'mantenimiento' ? 'En Mantenimiento' : 'No Disponible'}
                                </button>
                            </div>
                        </div>
                        );
                    })}
            </div>

            {salas.length === 0 && (
                <div className="text-center bg-white p-10 rounded-2xl shadow-sm border border-slate-200 max-w-md mx-auto mt-10">
                    <span className="text-4xl mb-4 block">😔</span>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No hay salas</h3>
                    <p className="text-slate-600">En este momento no hay salas habilitadas para reserva.</p>
                </div>
            )}
        </div>
    );
};

export default Salas;
