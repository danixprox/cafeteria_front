import React, { useEffect, useState } from 'react';
import { salasService } from '../../services/salasService';
import { mesasService } from '../../services/mesasService';

const GestionMesas = ({ idSala, onVolver }) => {
    const [sala, setSala] = useState(null);
    const [mesas, setMesas] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formMesa, setFormMesa] = useState({
        nombre: '',
        capacidad: 2,
        posicion_x: 50,
        posicion_y: 50
    });

    const cargarDatos = () => {
        setLoading(true);
        Promise.all([
            salasService.getById(idSala),
            salasService.getMesas(idSala)
        ])
        .then(([salaRes, mesasRes]) => {
            setSala(salaRes.data);
            setMesas(mesasRes.data);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (idSala) {
            cargarDatos();
        }
    }, [idSala]);

    const handleCrearMesa = async (e) => {
        e.preventDefault();
        try {
            await mesasService.create({ ...formMesa, sala: idSala });
            setFormMesa({ nombre: '', capacidad: 2, posicion_x: 50, posicion_y: 50 });
            cargarDatos();
        } catch (error) {
            alert('Error al crear mesa');
        }
    };

    const handleEliminarMesa = async (id) => {
        if(window.confirm('¿Seguro que deseas eliminar esta mesa?')) {
            try {
                await mesasService.delete(id);
                cargarDatos();
            } catch (error) {
                alert(error.response?.data?.error || 'Error al eliminar mesa');
            }
        }
    };

    if (loading) return <div className="p-10 text-center">Cargando mesas...</div>;

    return (
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="col-span-1 space-y-6">
                <div>
                    <button onClick={onVolver} className="text-indigo-600 mb-4 font-bold hover:underline flex items-center gap-1">
                        &larr; Volver a salas
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">Mesas - {sala?.nombre}</h2>
                    <p className="text-gray-500 text-sm mt-1">Configura las coordenadas X e Y para ubicarlas en el plano.</p>
                </div>

                <form onSubmit={handleCrearMesa} className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h3 className="font-bold text-lg mb-4">Añadir nueva mesa</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre / Número</label>
                            <input 
                                required type="text" 
                                value={formMesa.nombre} onChange={e => setFormMesa({...formMesa, nombre: e.target.value})}
                                className="mt-1 w-full border border-gray-300 rounded p-2 text-sm" placeholder="Mesa 1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Capacidad</label>
                            <input 
                                required type="number" min="1"
                                value={formMesa.capacidad} onChange={e => setFormMesa({...formMesa, capacidad: e.target.value})}
                                className="mt-1 w-full border border-gray-300 rounded p-2 text-sm"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Posición X (%)</label>
                                <input 
                                    required type="number" min="0" max="100"
                                    value={formMesa.posicion_x} onChange={e => setFormMesa({...formMesa, posicion_x: e.target.value})}
                                    className="mt-1 w-full border border-gray-300 rounded p-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Posición Y (%)</label>
                                <input 
                                    required type="number" min="0" max="100"
                                    value={formMesa.posicion_y} onChange={e => setFormMesa({...formMesa, posicion_y: e.target.value})}
                                    className="mt-1 w-full border border-gray-300 rounded p-2 text-sm"
                                />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 rounded hover:bg-indigo-700 transition">
                            Guardar Mesa
                        </button>
                    </div>
                </form>

                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                        {mesas.map(mesa => (
                            <li key={mesa.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                <div>
                                    <p className="font-bold text-sm">{mesa.nombre} <span className="text-xs font-normal text-gray-500">({mesa.capacidad} pax)</span></p>
                                    <p className="text-xs text-gray-400">X: {mesa.posicion_x}% | Y: {mesa.posicion_y}%</p>
                                </div>
                                <button 
                                    onClick={() => handleEliminarMesa(mesa.id)}
                                    className="text-red-500 text-sm font-bold hover:text-red-700"
                                >
                                    Eliminar
                                </button>
                            </li>
                        ))}
                        {mesas.length === 0 && <li className="p-4 text-center text-sm text-gray-500">No hay mesas.</li>}
                    </ul>
                </div>
            </div>

            <div className="col-span-2">
                <div className="bg-slate-50 border rounded-lg shadow-inner h-[600px] relative w-full overflow-hidden">
                    <h3 className="absolute top-4 w-full text-center font-bold text-gray-400 uppercase tracking-widest pointer-events-none">Vista previa del plano</h3>
                    {mesas.map(mesa => (
                        <div 
                            key={mesa.id}
                            className="absolute bg-blue-500 text-white flex flex-col items-center justify-center rounded-lg border-2 border-white shadow-lg"
                            style={{
                                left: `${mesa.posicion_x}%`,
                                top: `${mesa.posicion_y}%`,
                                width: '80px',
                                height: '80px',
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            <span className="font-bold">{mesa.nombre}</span>
                            <span className="text-xs">{mesa.capacidad} pax</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GestionMesas;
