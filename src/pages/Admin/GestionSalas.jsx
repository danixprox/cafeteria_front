import React, { useEffect, useState } from 'react';
import { salasService } from '../../services/salasService';

const GestionSalas = ({ onVerMesas }) => {
    const [salas, setSalas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        capacidad_total: 0
    });

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

    const handleCambiarEstado = async (id, estadoActual) => {
        try {
            await salasService.cambiarEstado(id, !estadoActual);
            cargarSalas();
        } catch (error) {
            alert(error.response?.data?.error || 'Error al cambiar estado');
        }
    };

    const handleGuardarSala = async (e) => {
        e.preventDefault();
        try {
            if (editandoId) {
                await salasService.update(editandoId, formData);
                alert('Sala editada correctamente');
            } else {
                await salasService.create(formData);
                alert('Sala creada correctamente');
            }
            setMostrarForm(false);
            setEditandoId(null);
            setFormData({ nombre: '', descripcion: '', capacidad_total: 0 });
            cargarSalas();
        } catch (error) {
            alert(error.response?.data?.error || 'Error al guardar sala');
        }
    };

    const handleEditarClick = (sala) => {
        setFormData({
            nombre: sala.nombre,
            descripcion: sala.descripcion,
            capacidad_total: sala.capacidad_total
        });
        setEditandoId(sala.id);
        setMostrarForm(true);
    };

    const handleCancelarForm = () => {
        setMostrarForm(false);
        setEditandoId(null);
        setFormData({ nombre: '', descripcion: '', capacidad_total: 0 });
    };

    if (loading) return <div className="p-10 text-center">Cargando gestión de salas...</div>;

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Gestión de Salas Temáticas</h2>
                <button 
                    onClick={() => { setMostrarForm(!mostrarForm); setEditandoId(null); setFormData({ nombre: '', descripcion: '', capacidad_total: 0 }); }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700"
                >
                    + Registrar Sala
                </button>
            </div>

            {mostrarForm && (
                <form onSubmit={handleGuardarSala} className="bg-white p-6 rounded-2xl shadow-lg mb-6 w-full max-w-4xl border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">
                        {editandoId ? 'Editar Sala' : 'Registrar nueva Sala'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            required
                            placeholder="Nombre de la sala"
                            className="border p-2 rounded text-black w-full"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        />
                        <input
                            type="number"
                            min="0"
                            placeholder="Capacidad total"
                            className="border p-2 rounded text-black w-full"
                            value={formData.capacidad_total}
                            onChange={(e) => setFormData({ ...formData, capacidad_total: e.target.value })}
                        />
                        <textarea
                            placeholder="Descripción temática"
                            className="border p-2 rounded text-black w-full md:col-span-2"
                            rows="2"
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700">
                            Guardar
                        </button>
                        <button type="button" onClick={handleCancelarForm} className="bg-gray-300 px-4 py-2 rounded font-bold hover:bg-gray-400">
                            Cancelar
                        </button>
                    </div>
                </form>
            )}
            
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sala</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacidad</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {salas.map((sala) => (
                            <tr key={sala.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium text-gray-900">{sala.nombre}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {sala.capacidad_total} pax
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        sala.habilitada ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {sala.habilitada ? 'Habilitada' : 'Deshabilitada'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                    <button 
                                        onClick={() => onVerMesas(sala.id)}
                                        className="text-indigo-600 hover:text-indigo-900 font-bold"
                                    >
                                        Ver Mesas
                                    </button>
                                    <button 
                                        onClick={() => handleEditarClick(sala)}
                                        className="text-yellow-600 hover:text-yellow-900 font-bold"
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => handleCambiarEstado(sala.id, sala.habilitada)}
                                        className={`${sala.habilitada ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} font-bold`}
                                    >
                                        {sala.habilitada ? 'Desactivar' : 'Activar'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GestionSalas;
