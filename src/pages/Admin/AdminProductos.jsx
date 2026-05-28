import React, { useState, useEffect } from 'react';
import { productosService } from '../../services/productosService';
import { categoriasService } from '../../services/categoriasService';

const AdminProductos = () => {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [form, setForm] = useState({
        nombre: '', descripcion: '', precio: '', stock: '', categoria: '', estado: 'true'
    });
    const [imagenFile, setImagenFile] = useState(null);
    const [editandoId, setEditandoId] = useState(null);
    const [mostrarForm, setMostrarForm] = useState(false);

    const cargarDatos = () => {
        setLoading(true);
        Promise.all([productosService.getAll(), categoriasService.getAll()])
            .then(([prodRes, catRes]) => {
                setProductos(prodRes.data);
                setCategorias(catRes.data);
            })
            .catch(err => setError('Error al cargar datos'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setImagenFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = { ...form };
            if (imagenFile) {
                dataToSubmit.imagen = imagenFile;
            }

            if (editandoId) {
                await productosService.update(editandoId, dataToSubmit);
            } else {
                await productosService.create(dataToSubmit);
            }

            setForm({ nombre: '', descripcion: '', precio: '', stock: '', categoria: '', estado: 'true' });
            setImagenFile(null);
            setEditandoId(null);
            setMostrarForm(false);
            cargarDatos();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar el producto');
        }
    };

    const handleEditar = (prod) => {
        setForm({
            nombre: prod.nombre,
            descripcion: prod.descripcion || '',
            precio: prod.precio,
            stock: prod.stock,
            categoria: prod.categoria,
            estado: prod.estado ? 'true' : 'false'
        });
        setImagenFile(null);
        setEditandoId(prod.id);
        setMostrarForm(true);
    };

    const handleEliminar = async (id) => {
        if (!window.confirm('¿Está seguro de eliminar este producto?')) return;
        try {
            await productosService.delete(id);
            cargarDatos();
        } catch (err) {
            setError('Error al eliminar');
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `${import.meta.env.VITE_API_URL || ''}${imagePath}`;
    };

    if (loading) return <div>Cargando productos...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Gestión de Productos</h2>
                <button 
                    onClick={() => { setMostrarForm(!mostrarForm); setForm({ nombre: '', descripcion: '', precio: '', stock: '', categoria: '', estado: 'true' }); setEditandoId(null); }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold"
                >
                    {mostrarForm ? 'Cancelar' : '+ Nuevo Producto'}
                </button>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

            {mostrarForm && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Nombre</label>
                            <input name="nombre" value={form.nombre} onChange={handleChange} required className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Precio (Bs)</label>
                            <input type="number" step="0.01" name="precio" value={form.precio} onChange={handleChange} required className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Stock</label>
                            <input type="number" name="stock" value={form.stock} onChange={handleChange} required className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Categoría</label>
                            <select name="categoria" value={form.categoria} onChange={handleChange} required className="w-full border p-2 rounded">
                                <option value="">Seleccione una categoría</option>
                                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Estado</label>
                            <select name="estado" value={form.estado} onChange={handleChange} className="w-full border p-2 rounded">
                                <option value="true">Activo</option>
                                <option value="false">Inactivo</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Imagen (opcional)</label>
                            <input type="file" onChange={handleFileChange} accept="image/*" className="w-full border p-1 rounded" />
                        </div>
                        <div className="md:col-span-2 lg:col-span-3">
                            <label className="block text-sm font-bold mb-1">Descripción</label>
                            <input name="descripcion" value={form.descripcion} onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                    </div>
                    <button type="submit" className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded font-bold">
                        Guardar Producto
                    </button>
                </form>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-bold text-slate-500">Imagen</th>
                            <th className="px-6 py-3 text-left text-sm font-bold text-slate-500">Producto</th>
                            <th className="px-6 py-3 text-left text-sm font-bold text-slate-500">Categoría</th>
                            <th className="px-6 py-3 text-left text-sm font-bold text-slate-500">Precio (Bs) / Stock</th>
                            <th className="px-6 py-3 text-right text-sm font-bold text-slate-500">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {productos.map(prod => (
                            <tr key={prod.id}>
                                <td className="px-6 py-4">
                                    {prod.imagen ? (
                                        <img src={getImageUrl(prod.imagen)} alt={prod.nombre} className="w-12 h-12 object-cover rounded-md" />
                                    ) : (
                                        <div className="w-12 h-12 bg-slate-200 rounded-md flex items-center justify-center text-xs text-slate-400">Sin img</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 font-bold">{prod.nombre}<br/><span className={`text-xs px-2 py-0.5 rounded-full ${prod.estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{prod.estado ? 'Activo' : 'Inactivo'}</span></td>
                                <td className="px-6 py-4 text-slate-600">{prod.categoria_nombre}</td>
                                <td className="px-6 py-4">Bs {prod.precio}<br/><span className="text-sm text-slate-500">Stock: {prod.stock}</span></td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button onClick={() => handleEditar(prod)} className="text-indigo-600 font-bold hover:underline">Editar</button>
                                    <button onClick={() => handleEliminar(prod.id)} className="text-red-600 font-bold hover:underline">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                        {productos.length === 0 && (
                            <tr><td colSpan="5" className="px-6 py-4 text-center text-slate-500">No hay productos registrados</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminProductos;
