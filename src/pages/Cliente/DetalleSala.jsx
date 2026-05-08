import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { salasService } from '../../services/salasService';
import { reservasService } from '../../services/reservasService';
import MapaMesas from '../../components/MapaMesas';

const DetalleSala = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [sala, setSala] = useState(null);
    const [mesas, setMesas] = useState([]);
    const [disponibilidad, setDisponibilidad] = useState([]);
    const [fecha, setFecha] = useState('');
    const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);
    const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
    const [cantidadPersonas, setCantidadPersonas] = useState(1);
    
    const [loading, setLoading] = useState(true);
    const [loadingDisponibilidad, setLoadingDisponibilidad] = useState(false);
    const [loadingReserva, setLoadingReserva] = useState(false);
    const [error, setError] = useState('');


const generarFechas = () => {
        const fechas = [];
        const hoy = new Date();

        for (let i = 0; i < 7; i++) {
            const fecha = new Date();
            fecha.setDate(hoy.getDate() + i);

            fechas.push({
                fechaISO: fecha.toISOString().split('T')[0],
                dia: fecha.toLocaleDateString('es-ES', { weekday: 'short' }),
                numero: fecha.getDate(),
                mes: fecha.toLocaleDateString('es-ES', { month: 'short' })
            });
        }
    return fechas;
};




    useEffect(() => {
        Promise.all([
            salasService.getById(id),
            salasService.getMesas(id)
        ])
        .then(([salaRes, mesasRes]) => {
            setSala(salaRes.data);
            setMesas(mesasRes.data);
        })
        .catch(err => {
            console.error(err);
            setError('Error al cargar la sala');
        })
        .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (fecha) {
            setLoadingDisponibilidad(true);
            setHorarioSeleccionado(null);
            setMesaSeleccionada(null);
            salasService.getDisponibilidad(id, fecha)
                .then(res => setDisponibilidad(res.data))
                .catch(err => {
                    setError(err.response?.data?.error || 'Error al cargar disponibilidad');
                    setDisponibilidad([]);
                })
                .finally(() => setLoadingDisponibilidad(false));
        }
    }, [fecha, id]);

    const handleReservar = async () => {
        if (!fecha || !horarioSeleccionado || !mesaSeleccionada) {
            setError('Debes seleccionar fecha, horario y una mesa en el mapa.');
            return;
        }

        const mesaObjeto = mesas.find(m => m.id === mesaSeleccionada);
        if (!mesaObjeto) {
            setError('La mesa seleccionada no existe.');
            return;
        }

        if (cantidadPersonas > mesaObjeto.capacidad) {
            setError(`La cantidad de personas excede la capacidad de la mesa (${mesaObjeto.capacidad}).`);
            return;
        }

        if (cantidadPersonas < 1) {
            setError('Debe haber al menos 1 persona en la reserva.');
            return;
        }

        setError('');
        setLoadingReserva(true);

        try {
            await reservasService.create({
                sala: id,
                mesa: mesaSeleccionada,
                fecha: fecha,
                hora_inicio: horarioSeleccionado.hora_inicio,
                hora_fin: horarioSeleccionado.hora_fin,
                cantidad_personas: parseInt(cantidadPersonas)
            });
            alert('¡Reserva confirmada con éxito!');
            navigate('/cliente/mis-reservas');
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Error al realizar la reserva';
            setError(errorMsg);
            console.error(err);
        } finally {
            setLoadingReserva(false);
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:8000${imagePath}`;
    };

    const handleImageError = (e) => {
        e.target.src = 'https://via.placeholder.com/600x400?text=Imagen+No+Disponible';
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

    if (loading) return <div className="p-10 text-center text-slate-500 font-bold">Cargando detalles de la sala...</div>;
    if (!sala) return <div className="p-10 text-center text-red-500">{error}</div>;

    const puedeReservar = sala.disponibilidad === 'disponible';
    const fechas = generarFechas();

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-slate-50">
            {/* Cabecera con Imágenes */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 bg-slate-100 p-2 h-[400px]">
                    <div className="col-span-1 md:col-span-2 lg:col-span-2 h-full rounded-2xl overflow-hidden relative">
                        {sala.imagen_principal ? (
                            <img src={getImageUrl(sala.imagen_principal)} onError={handleImageError} alt={sala.nombre} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-200 flex items-center justify-center font-bold text-slate-400">Sin Imagen Principal</div>
                        )}
                        <div className="absolute top-4 left-4">
                            {getBadgeDisponibilidad(sala.disponibilidad)}
                        </div>
                    </div>
                    <div className="hidden lg:flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                        {sala.galeria && sala.galeria.length > 0 ? (
                            sala.galeria.map(img => (
                                <img key={img.id} src={getImageUrl(img.imagen)} onError={handleImageError} alt="Galeria" className="w-full h-48 object-cover rounded-2xl" />
                            ))
                        ) : (
                            <div className="w-full h-full bg-slate-200 flex items-center justify-center rounded-2xl font-bold text-slate-400">Sin Galería</div>
                        )}
                    </div>
                </div>

                <div className="p-8">
                    <h1 className="text-4xl font-black text-slate-800 mb-2">{sala.nombre}</h1>
                    <p className="text-indigo-600 font-bold tracking-wider uppercase mb-4">{sala.tematica || 'Sin Temática'}</p>
                    <p className="text-slate-600 text-lg leading-relaxed">{sala.descripcion}</p>
                </div>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 font-bold border border-red-200">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                        <h3 className="text-lg font-bold mb-4 text-gray-800">1. Selecciona la fecha</h3>

                    <div className="grid grid-cols-4 gap-2">
                        {fechas.map((f, index) => (
                        <button
                            key={index}
                            onClick={() => setFecha(f.fechaISO)}
                            className={`p-2 rounded-xl border text-center font-bold transition ${
                                fecha === f.fechaISO
                                    ? 'bg-yellow-500 scale-105 text-black shadow-lg scale-105'
                                    : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                        >
                            <div className="text-xs uppercase">{f.dia}</div>
                            <div className="text-lg">{f.numero}</div>
                            <div className="text-xs">{f.mes}</div>
                        </button>
                    ))}
                </div>
            </div>


                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                        <h3 className="text-lg font-bold mb-4 text-gray-800">2. Selecciona el horario</h3>
                    {!fecha ? (
                        <p className="text-gray-400">Primero selecciona una fecha</p>
                    ) : loadingDisponibilidad ? (
                        <p className="text-gray-500">Cargando horarios...</p>
                    ) : disponibilidad.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                            {disponibilidad.map((bloque, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setHorarioSeleccionado(bloque);
                                    setMesaSeleccionada(null);
                            }}
                            className={`p-3 rounded-xl font-bold transition-all ${
                                horarioSeleccionado === bloque
                                ? 'bg-indigo-600 text-white scale-105 shadow-lg'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                        >
                            {bloque.hora_inicio.substring(0,5)} - {bloque.hora_fin.substring(0,5)}
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400">No hay horarios disponibles</p>
                )}
            </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-md border">
                        <h3 className="text-lg font-semibold mb-4">3. Detalles finales</h3>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad de personas *</label>
                        <input 
                            type="number" 
                            min="1" 
                            max="20"
                            className="w-full border border-gray-300 p-2.5 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={cantidadPersonas}
                            onChange={(e) => setCantidadPersonas(parseInt(e.target.value) || 1)}
                        />
                        
                        {mesaSeleccionada && (
                            <div className="bg-green-100 border border-green-300 rounded-xl p-4 mb-4 animate-pulse">
                                <p className="text-green-700 font-bold">
                                    ✅ Mesa seleccionada: {mesas.find(m => m.id === mesaSeleccionada)?.nombre}
                                </p>
                                <p className="text-sm text-green-600">
                                    Capacidad: {mesas.find(m => m.id === mesaSeleccionada)?.capacidad} personas
                                </p>
                            </div>
                        )}
                        
                        <button 
                            onClick={handleReservar}
                            disabled={!mesaSeleccionada || !horarioSeleccionado || !puedeReservar || loadingReserva}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed transition shadow-sm text-base"
                        >
                            {loadingReserva ? 'Procesando...' : (puedeReservar ? 'Confirmar Reserva' : 'Sala no disponible')}
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-md border h-full">
                        <h3 className="text-lg font-semibold mb-2">4. Selecciona tu mesa en el plano</h3>
                        <p className="text-sm text-gray-500 mb-4">Haz click sobre una mesa disponible (azul) para seleccionarla.</p>
                        
                        {!horarioSeleccionado ? (
                            <div className="flex items-center justify-center h-64 bg-gray-50 rounded border border-dashed border-gray-300 text-gray-400">
                                Debes seleccionar un horario primero
                            </div>
                        ) : (
                            <MapaMesas 
                                mesas={mesas} 
                                disponibilidad={horarioSeleccionado} 
                                mesaSeleccionada={mesaSeleccionada}
                                onSeleccionarMesa={setMesaSeleccionada}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleSala;
