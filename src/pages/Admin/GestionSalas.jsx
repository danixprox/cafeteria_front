import React, { useEffect, useState } from 'react';
import { salasService } from '../../services/salasService';

const GestionSalas = ({ onVerMesas }) => {
    const [salas, setSalas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    
    // Form state
    const [nombre, setNombre] = useState('');
    const [tematica, setTematica] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [capacidadTotal, setCapacidadTotal] = useState(0);
    const [disponibilidad, setDisponibilidad] = useState('disponible');
    const [habilitada, setHabilitada] = useState(true);
    const [imagenPrincipal, setImagenPrincipal] = useState(null);
    const [galeriaNuevas, setGaleriaNuevas] = useState([]);

    // Preview state para edición
    const [previewPrincipal, setPreviewPrincipal] = useState('');
    const [galeriaExistente, setGaleriaExistente] = useState([]);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `${import.meta.env.VITE_API_URL || ''}${imagePath}`;
    };

    const handleImageError = (e) => {
        e.target.src = 'https://via.placeholder.com/600x400?text=Imagen+No+Disponible';
    };

    const cargarSalas = () => {
        setLoading(true);
        salasService.getAll()
            .then(res => setSalas(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        cargarSalas();
    }, []);

    const resetForm = () => {
        setNombre('');
        setTematica('');
        setDescripcion('');
        setCapacidadTotal(0);
        setDisponibilidad('disponible');
        setHabilitada(true);
        setImagenPrincipal(null);
        setGaleriaNuevas([]);
        setPreviewPrincipal('');
        setGaleriaExistente([]);
        setEditandoId(null);
        setMostrarForm(false);
    };

    const handleEditarClick = (sala) => {
        setNombre(sala.nombre);
        setTematica(sala.tematica || '');
        setDescripcion(sala.descripcion || '');
        setCapacidadTotal(sala.capacidad_total);
        setDisponibilidad(sala.disponibilidad || 'disponible');
        setHabilitada(sala.habilitada);
        setPreviewPrincipal(sala.imagen_principal || '');
        setGaleriaExistente(sala.galeria || []);
        
        setImagenPrincipal(null);
        setGaleriaNuevas([]);
        
        setEditandoId(sala.id);
        setMostrarForm(true);
    };

    const eliminarImagenExistente = async (imagenId) => {
        if(!window.confirm('¿Seguro que deseas eliminar esta imagen de la galería?')) return;
        try {
            await salasService.eliminarImagen(editandoId, imagenId);
            setGaleriaExistente(prev => prev.filter(img => img.id !== imagenId));
        } catch (error) {
            alert('Error al eliminar imagen');
        }
    };

    const handleEliminarSala = async (id) => {
        if(!window.confirm('¿Estás seguro de eliminar completamente esta sala? Se perderán sus mesas y configuración.')) return;
        try {
            await salasService.delete(id);
            cargarSalas();
            alert('Sala eliminada correctamente.');
        } catch (error) {
            alert(error.response?.data?.error || 'Error al eliminar la sala');
        }
    };

    const handleGuardarSala = async (e) => {
        e.preventDefault();
        
        if(!nombre || !tematica || capacidadTotal <= 0 || !disponibilidad) {
            return alert('Completa los campos obligatorios correctamente.');
        }

        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('tematica', tematica);
        formData.append('descripcion', descripcion);
        formData.append('capacidad_total', capacidadTotal);
        formData.append('disponibilidad', disponibilidad);
        // Sincronizar habilitada con disponibilidad: si es 'no_disponible' se deshabilita
        formData.append('habilitada', disponibilidad !== 'no_disponible' ? 'true' : 'false');
        if (imagenPrincipal) {
            formData.append('imagen_principal', imagenPrincipal);
        }

        try {
            let salaId = editandoId;
            if (editandoId) {
                await salasService.update(editandoId, formData);
                alert('Sala actualizada correctamente');
            } else {
                const res = await salasService.create(formData);
                salaId = res.data.id;
                alert('Sala creada correctamente');
            }

            // Subir imágenes de galería si las hay
            if (galeriaNuevas.length > 0 && salaId) {
                const galeriaData = new FormData();
                Array.from(galeriaNuevas).forEach(file => {
                    galeriaData.append('galeria', file);
                });
                await salasService.subirGaleria(salaId, galeriaData);
            }

            resetForm();
            cargarSalas();
        } catch (error) {
            alert(error.response?.data?.error || 'Error al guardar sala');
        }
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
        return <span className={`px-2 py-1 rounded-full text-xs font-bold ${badges[estado] || 'bg-gray-100'}`}>{text[estado] || estado}</span>;
    };

    if (loading) return <div className="p-10 text-center text-slate-500 font-bold">Cargando gestión de salas...</div>;

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-800">Gestión de Salas Temáticas</h2>
                <button 
                    onClick={() => { resetForm(); setMostrarForm(true); }}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 shadow-sm transition"
                >
                    + Registrar Sala
                </button>
            </div>

            {mostrarForm && (
                <form onSubmit={handleGuardarSala} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 mb-8 w-full max-w-5xl">
                    <h3 className="text-xl font-bold mb-6 text-slate-800">
                        {editandoId ? 'Editar Sala Temática' : 'Registrar nueva Sala Temática'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* DATOS BÁSICOS */}
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre de la Sala *</label>
                                <input
                                    required
                                    placeholder="Ej. Sala VIP"
                                    className="border border-slate-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Temática *</label>
                                <input
                                    required
                                    placeholder="Ej. Rústica, Gamer, Romántica"
                                    className="border border-slate-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={tematica}
                                    onChange={(e) => setTematica(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Capacidad Total *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        className="border border-slate-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={capacidadTotal}
                                        onChange={(e) => setCapacidadTotal(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Disponibilidad *</label>
                                    <select 
                                        className="border border-slate-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={disponibilidad}
                                        onChange={(e) => setDisponibilidad(e.target.value)}
                                    >
                                        <option value="disponible">Disponible</option>
                                        <option value="no_disponible">No disponible</option>
                                        <option value="mantenimiento">En mantenimiento</option>
                                        <option value="reservada">Reservada</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <input
                                    type="checkbox"
                                    id="habilitada"
                                    checked={habilitada}
                                    onChange={(e) => setHabilitada(e.target.checked)}
                                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                                <label htmlFor="habilitada" className="text-sm font-semibold text-slate-700 cursor-pointer">
                                    {habilitada ? '✓ Sala Habilitada' : '✗ Sala Deshabilitada'} - Los clientes pueden ver esta sala
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Descripción</label>
                                <textarea
                                    placeholder="Breve descripción de la experiencia..."
                                    className="border border-slate-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 outline-none"
                                    rows="3"
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* IMÁGENES */}
                        <div className="flex flex-col gap-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Imagen Principal (Requerida)</label>
                                {previewPrincipal && !imagenPrincipal && (
                                    <img src={getImageUrl(previewPrincipal)} onError={handleImageError} alt="Principal" className="h-32 w-full object-cover rounded-lg mb-3 shadow-sm" />
                                )}
                                <input
                                    type="file"
                                    accept="image/jpeg, image/png, image/webp"
                                    className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                                    onChange={(e) => setImagenPrincipal(e.target.files[0])}
                                />
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex-1">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Galería (Opcional, Múltiples)</label>
                                
                                {galeriaExistente.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {galeriaExistente.map(img => (
                                            <div key={img.id} className="relative group">
                                                <img src={getImageUrl(img.imagen)} onError={handleImageError} alt="Galeria" className="h-16 w-16 object-cover rounded shadow-sm" />
                                                <button 
                                                    type="button"
                                                    onClick={() => eliminarImagenExistente(img.id)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow"
                                                    title="Eliminar imagen"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <input
                                    type="file"
                                    multiple
                                    accept="image/jpeg, image/png, image/webp"
                                    className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer"
                                    onChange={(e) => setGaleriaNuevas(e.target.files)}
                                />
                                {galeriaNuevas.length > 0 && <p className="text-xs text-indigo-600 mt-2 font-semibold">+{galeriaNuevas.length} imágenes nuevas listas para subir.</p>}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button type="button" onClick={resetForm} className="bg-white border border-slate-300 text-slate-700 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition">
                            Cancelar
                        </button>
                        <button type="submit" className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 shadow-sm transition">
                            Guardar Sala
                        </button>
                    </div>
                </form>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {salas.map((sala) => (
                    <div key={sala.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col group hover:shadow-md transition">
                        <div className="h-48 bg-slate-200 relative overflow-hidden">
                            {sala.imagen_principal ? (
                                <img src={getImageUrl(sala.imagen_principal)} onError={handleImageError} alt={sala.nombre} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">Sin Imagen</div>
                            )}
                            <div className="absolute top-3 right-3">
                                {getBadgeDisponibilidad(sala.disponibilidad)}
                            </div>
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                            <h3 className="text-xl font-black text-slate-800 mb-1">{sala.nombre}</h3>
                            <p className="text-indigo-600 font-bold text-sm mb-3 uppercase tracking-wider">{sala.tematica || 'Sin Temática'}</p>
                            <div className="mb-3">
                                {sala.habilitada ? (
                                    <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                        ✓ Habilitada (visible para clientes)
                                    </span>
                                ) : (
                                    <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                        ✗ Deshabilitada (oculta para clientes)
                                    </span>
                                )}
                            </div>
                            <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-1">{sala.descripcion || 'Sin descripción.'}</p>
                            
                            <div className="flex justify-between items-center mb-5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div className="text-center">
                                    <p className="text-xs text-slate-500 font-bold uppercase">Capacidad</p>
                                    <p className="font-black text-slate-800">{sala.capacidad_total} <span className="text-sm font-normal">pax</span></p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-slate-500 font-bold uppercase">Galería</p>
                                    <p className="font-black text-slate-800">{sala.galeria?.length || 0} <span className="text-sm font-normal">fotos</span></p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    onClick={() => onVerMesas(sala.id)}
                                    className="bg-indigo-50 text-indigo-700 font-bold py-2 rounded-lg hover:bg-indigo-100 transition"
                                >
                                    Ver Mesas
                                </button>
                                <button 
                                    onClick={() => handleEditarClick(sala)}
                                    className="bg-yellow-50 text-yellow-700 font-bold py-2 rounded-lg hover:bg-yellow-100 transition"
                                >
                                    Editar Sala
                                </button>
                                <button 
                                    onClick={() => handleEliminarSala(sala.id)}
                                    className="col-span-2 mt-1 text-red-500 font-bold py-2 rounded-lg hover:bg-red-50 transition border border-red-100"
                                >
                                    Eliminar Sala
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GestionSalas;
