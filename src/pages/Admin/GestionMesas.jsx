import React, { useEffect, useState, useRef } from 'react';
import { salasService } from '../../services/salasService';
import { mesasService } from '../../services/mesasService';

const GestionMesas = ({ idSala, onVolver }) => {
    const [sala, setSala] = useState(null);
    const [mesas, setMesas] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Referencia al contenedor del plano y estado para Drag & Drop
    const planoRef = useRef(null);
    const [draggingId, setDraggingId] = useState(null);

    const [formMesa, setFormMesa] = useState({
        nombre: '',
        capacidad: 2
    });
    const [errorValidacion, setErrorValidacion] = useState(null);

    const capacidadUsada = mesas.reduce((sum, mesa) => sum + mesa.capacidad, 0);
    const capacidadDisponible = sala ? Math.max(0, sala.capacidad_total - capacidadUsada) : 0;

    const validarCapacidadMesa = (capacidadMesa, capacidadDisponibleTotal, capacidadMaxima) => {
        const cap = parseInt(capacidadMesa, 10);
        if (isNaN(cap) || cap <= 0) {
            return "La capacidad debe ser mayor que 0.";
        }
        if (cap > capacidadMaxima && capacidadMaxima > 0) {
            return "La capacidad de la mesa no puede superar la capacidad máxima permitida.";
        }
        if (cap > capacidadDisponibleTotal) {
            return "La capacidad de esta mesa supera la capacidad disponible de la sala.";
        }
        if (cap % 2 !== 0) {
            return "La capacidad de la mesa debe ser un número par.";
        }
        return null;
    };

    useEffect(() => {
        if (sala) {
            const capMax = sala.capacidad_total > 0 ? sala.capacidad_total : Infinity;
            setErrorValidacion(validarCapacidadMesa(formMesa.capacidad, capacidadDisponible, capMax));
        }
    }, [formMesa.capacidad, sala, capacidadDisponible]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idSala]);

    const handleCrearMesa = async (e) => {
        e.preventDefault();
        if (errorValidacion) {
            alert(errorValidacion);
            return;
        }
        try {
            // Se asume posición central inicial (50, 50)
            await mesasService.create({ 
                ...formMesa, 
                sala: idSala,
                posicion_x: 50,
                posicion_y: 50,
                estado: 'disponible'
            });
            setFormMesa({ nombre: '', capacidad: 2 });
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

    const handleCambiarEstado = async (id, nuevoEstado) => {
        try {
            await mesasService.patch(id, { estado: nuevoEstado });
            setMesas(prev => prev.map(m => m.id === id ? { ...m, estado: nuevoEstado } : m));
            // alert('Estado actualizado correctamente'); // Opción para feedback rápido
        } catch (error) {
            alert(error.response?.data?.error || 'Error al actualizar el estado');
            cargarDatos(); // re-fetch si falla
        }
    };

    // --- LÓGICA DE DRAG & DROP ---
    const handlePointerDown = (e, id) => {
        e.preventDefault();
        setDraggingId(id);
        e.target.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!draggingId || !planoRef.current) return;
        
        const rect = planoRef.current.getBoundingClientRect();
        
        let pctX = ((e.clientX - rect.left) / rect.width) * 100;
        let pctY = ((e.clientY - rect.top) / rect.height) * 100;
        
        pctX = Math.max(0, Math.min(100, pctX));
        pctY = Math.max(0, Math.min(100, pctY));
        
        setMesas(prev => prev.map(m => 
            m.id === draggingId 
                ? { ...m, posicion_x: Math.round(pctX), posicion_y: Math.round(pctY) } 
                : m
        ));
    };

    const handlePointerUp = async (e) => {
        if (!draggingId) return;
        
        const mesaArrastrada = mesas.find(m => m.id === draggingId);
        setDraggingId(null);
        e.target.releasePointerCapture(e.pointerId);
        
        if (mesaArrastrada) {
            try {
                await mesasService.patch(mesaArrastrada.id, {
                    posicion_x: mesaArrastrada.posicion_x,
                    posicion_y: mesaArrastrada.posicion_y
                });
            } catch (error) {
                console.error("Error al guardar la posición de la mesa", error);
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
                    <p className="text-gray-500 text-sm mt-1">Arrastra las mesas en el plano para reubicarlas libremente.</p>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex justify-between text-sm shadow-sm">
                    <div className="text-center">
                        <p className="text-gray-500 font-medium">Capacidad Total</p>
                        <p className="text-xl font-bold text-indigo-900">{sala?.capacidad_total || 0}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-gray-500 font-medium">Capacidad Usada</p>
                        <p className="text-xl font-bold text-amber-600">{capacidadUsada}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-gray-500 font-medium">Disponible</p>
                        <p className={`text-xl font-bold ${capacidadDisponible === 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {capacidadDisponible}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleCrearMesa} className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h3 className="font-bold text-lg mb-4">Añadir nueva mesa</h3>
                    
                    {capacidadDisponible === 0 && sala?.capacidad_total > 0 ? (
                        <div className="p-3 bg-red-100 text-red-700 text-sm rounded font-medium border border-red-200 mb-4">
                            La sala ya alcanzó su capacidad total. No se pueden registrar más mesas.
                        </div>
                    ) : (
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
                                <label className="block text-sm font-medium text-gray-700">Capacidad (pax)</label>
                                <input 
                                    required type="number" min="2" step="2"
                                    value={formMesa.capacidad} onChange={e => setFormMesa({...formMesa, capacidad: e.target.value})}
                                    className={`mt-1 w-full border rounded p-2 text-sm ${errorValidacion ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                                />
                                {errorValidacion && <p className="text-red-500 text-xs mt-1 font-semibold">{errorValidacion}</p>}
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={!!errorValidacion}
                                className={`w-full font-bold py-2 rounded transition ${errorValidacion ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                            >
                                Guardar Mesa
                            </button>
                        </div>
                    )}
                </form>

                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                        {mesas.map(mesa => (
                            <li key={mesa.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                <div>
                                    <p className="font-bold text-sm">{mesa.nombre}</p>
                                    <p className="text-xs text-gray-500">Capacidad: {mesa.capacidad} pax</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <select 
                                        value={mesa.estado || 'disponible'}
                                        onChange={(e) => handleCambiarEstado(mesa.id, e.target.value)}
                                        className="text-xs border rounded p-1"
                                    >
                                        <option value="disponible">Disponible</option>
                                        <option value="ocupada">Ocupada</option>
                                        <option value="reservada">Reservada</option>
                                    </select>
                                    <button 
                                        onClick={() => handleEliminarMesa(mesa.id)}
                                        className="text-red-500 text-xs font-bold hover:text-red-700"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </li>
                        ))}
                        {mesas.length === 0 && <li className="p-4 text-center text-sm text-gray-500">No hay mesas. Crea una para empezar.</li>}
                    </ul>
                </div>

                <div className="pt-4 border-t border-gray-200 mt-6">
                    <button 
                        onClick={onVolver}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-200 flex items-center justify-center gap-2"
                    >
                        <span>💾</span> Finalizar y Guardar Cambios
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-2">Los cambios se guardan automáticamente, usa este botón para terminar.</p>
                </div>
            </div>

            <div className="col-span-2">
                <div 
                    ref={planoRef}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    className="bg-slate-50 border rounded-lg shadow-inner h-[600px] relative w-full overflow-hidden select-none touch-none"
                >
                    <div className="absolute top-4 left-4 flex gap-4 bg-white/80 p-2 rounded shadow text-xs font-bold z-20 pointer-events-none">
                        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded-full inline-block"></span> Disponible</div>
                        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-500 rounded-full inline-block"></span> Reservada</div>
                        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded-full inline-block"></span> Ocupada</div>
                    </div>
                    <h3 className="absolute top-4 w-full text-center font-bold text-gray-400 uppercase tracking-widest pointer-events-none">Vista previa del plano</h3>
                    {mesas.map(mesa => {
                        let bgColor = 'bg-emerald-500'; // disponible
                        if (mesa.estado === 'ocupada') bgColor = 'bg-red-500';
                        if (mesa.estado === 'reservada') bgColor = 'bg-amber-500';

                        return (
                        <div 
                            key={mesa.id}
                            onPointerDown={(e) => handlePointerDown(e, mesa.id)}
                            className={`absolute ${bgColor} text-white flex flex-col items-center justify-center rounded-lg border-2 border-white shadow-lg 
                                ${draggingId === mesa.id ? 'cursor-grabbing scale-105 ring-4 ring-blue-300 z-10' : 'cursor-grab hover:opacity-90'}
                                transition-all duration-200`}
                            style={{
                                left: `${mesa.posicion_x}%`,
                                top: `${mesa.posicion_y}%`,
                                width: '80px',
                                height: '80px',
                                transform: 'translate(-50%, -50%)',
                                touchAction: 'none'
                            }}
                        >
                            <span className="font-bold pointer-events-none">{mesa.nombre}</span>
                            <span className="text-xs pointer-events-none">{mesa.capacidad} pax</span>
                        </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default GestionMesas;
