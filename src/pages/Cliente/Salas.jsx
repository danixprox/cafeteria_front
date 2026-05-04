import React, { useEffect, useState } from 'react';
import { salasService } from '../../services/salasService';
import { useNavigate } from 'react-router-dom';

const Salas = () => {
    const [salas, setSalas] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        salasService.getAll()
            .then(res => setSalas(res.data.filter(sala => sala.habilitada)))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-10 text-center text-gray-500">Cargando salas...</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Salas Temáticas Disponibles</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {salas.map(sala => (
                    <div key={sala.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        {sala.imagen ? (
                            <img src={sala.imagen} alt={sala.nombre} className="w-full h-48 object-cover" />
                        ) : (
                            <div className="w-full h-48 bg-indigo-100 flex items-center justify-center text-indigo-400">
                                Sin imagen
                            </div>
                        )}
                        <div className="p-5">
                            <h2 className="text-xl font-semibold mb-2">{sala.nombre}</h2>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{sala.descripcion}</p>
                            <div className="flex justify-between items-center mt-4">
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                    Capacidad max: {sala.capacidad_total}
                                </span>
                                <button 
                                    onClick={() => navigate(`/cliente/salas/${sala.id}`)}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium transition"
                                >
                                    Ver disponibilidad
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {salas.length === 0 && (
                <div className="text-center text-gray-500 mt-10">
                    No hay salas disponibles en este momento.
                </div>
            )}
        </div>
    );
};

export default Salas;
