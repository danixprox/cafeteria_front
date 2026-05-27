import React, { useState, useEffect } from 'react';
import { categoriasService } from '../../services/categoriasService';

const AdminCategorias = () => {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ nombre: '', descripcion: '' });
    const [editandoId, setEditandoId] = useState(null);
    const [mostrarForm, setMostrarForm] = useState(false);

    const cargarCategorias = () => {
        setLoading(true);
        categoriasService.getAll()
            .then(res => setCategorias(res.data))
            .catch(err => setError('Error al cargar categorías'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        cargarCategorias();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editandoId) {
                await categoriasService.update(editandoId, form);
            } else {
                await categoriasService.create(form);
            }
            setForm({ nombre: '', descripcion: '' });
            setEditandoId(null);
            setMostrarForm(false);
            cargarCategorias();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar la categoría');
        }
    };

    const handleEditar = (cat) => {
        setForm({ nombre: cat.nombre, descripcion: cat.descripcion || '' });
        setEditandoId(cat.id);
        setMostrarForm(true);
    };

    const handleEliminar = async (id) => {
        if (!window.confirm('¿Está seguro de eliminar esta categoría?')) return;
        try {
            await categoriasService.delete(id);
            cargarCategorias();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al eliminar la categoría');
        }
    };

    if (loading) return <div>Cargando categorías...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Gestión de Categorías</h2>
                <button 
                    onClick={() => { setMostrarForm(!mostrarForm); setForm({ nombre: '', descripcion: '' }); setEditandoId(null); }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold"
                >
                    {mostrarForm ? 'Cancelar' : '+ Nueva Categoría'}
                </button>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

            {mostrarForm && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Nombre</label>
                            <input name="nombre" value={form.nombre} onChange={handleChange} required className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Descripción</label>
                            <input name="descripcion" value={form.descripcion} onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                    </div>
                    <button type="submit" className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded font-bold w-full md:w-auto">
                        Guardar Categoría
                    </button>
                </form>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-bold text-slate-500">Nombre</th>
                            <th className="px-6 py-3 text-left text-sm font-bold text-slate-500">Descripción</th>
                            <th className="px-6 py-3 text-right text-sm font-bold text-slate-500">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {categorias.map(cat => (
                            <tr key={cat.id}>
                                <td className="px-6 py-4 font-bold">{cat.nombre}</td>
                                <td className="px-6 py-4 text-slate-600">{cat.descripcion}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button onClick={() => handleEditar(cat)} className="text-indigo-600 font-bold hover:underline">Editar</button>
                                    <button onClick={() => handleEliminar(cat.id)} className="text-red-600 font-bold hover:underline">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                        {categorias.length === 0 && (
                            <tr><td colSpan="3" className="px-6 py-4 text-center text-slate-500">No hay categorías registradas</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminCategorias;
