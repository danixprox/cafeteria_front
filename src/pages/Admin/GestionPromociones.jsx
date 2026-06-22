import React, { useState, useEffect } from 'react';
import { promocionesService } from '../../services/promocionesService';
import { productosService } from '../../services/productosService';
import { categoriasService } from '../../services/categoriasService';
import { Tag, Percent, Calendar, Plus, Trash2, Edit, AlertCircle, CheckCircle, Search, RefreshCw, X } from 'lucide-react';

const GestionPromociones = () => {
    const [promociones, setPromociones] = useState([]);
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todos');

    // Estado del formulario
    const [form, setForm] = useState({
        codigo: '',
        nombre: '',
        descripcion: '',
        tipo_descuento: 'porcentaje',
        valor_descuento: '',
        fecha_inicio: '',
        fecha_fin: '',
        activa: true,
        productos: [],
        categorias: []
    });

    const [editandoId, setEditandoId] = useState(null);
    const [mostrarForm, setMostrarForm] = useState(false);

    // Estados de búsqueda en los listados de selección del formulario
    const [busquedaProd, setBusquedaProd] = useState('');
    const [busquedaCat, setBusquedaCat] = useState('');

    const cargarDatos = async () => {
        setLoading(true);
        setError('');
        try {
            const [promRes, prodRes, catRes] = await Promise.all([
                promocionesService.getAll(),
                productosService.getAll(),
                categoriasService.getAll()
            ]);
            
            // Django REST Framework podría retornar la lista directamente o en .results si hay paginación
            setPromociones(Array.isArray(promRes.data) ? promRes.data : promRes.data.results || []);
            setProductos(Array.isArray(prodRes.data) ? prodRes.data : prodRes.data.results || []);
            setCategorias(Array.isArray(catRes.data) ? catRes.data : catRes.data.results || []);
        } catch (err) {
            console.error('Error al cargar datos:', err);
            setError('Error al cargar los datos del sistema. Intente de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    // Limpiar alertas automáticamente después de 5 segundos
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 7000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Manejar selección de productos individuales
    const handleProductToggle = (productId) => {
        setForm(prev => {
            const yaSeleccionado = prev.productos.includes(productId);
            return {
                ...prev,
                productos: yaSeleccionado
                    ? prev.productos.filter(id => id !== productId)
                    : [...prev.productos, productId]
            };
        });
    };

    // Manejar selección de categorías individuales
    const handleCategoryToggle = (categoryId) => {
        setForm(prev => {
            const yaSeleccionada = prev.categorias.includes(categoryId);
            return {
                ...prev,
                categorias: yaSeleccionada
                    ? prev.categorias.filter(id => id !== categoryId)
                    : [...prev.categorias, categoryId]
            };
        });
    };

    // Seleccionar o deseleccionar todos los productos visibles tras filtro
    const handleSelectAllVisibleProducts = (visibleProductIds, select) => {
        setForm(prev => {
            const otrosProductos = prev.productos.filter(id => !visibleProductIds.includes(id));
            return {
                ...prev,
                productos: select ? [...otrosProductos, ...visibleProductIds] : otrosProductos
            };
        });
    };

    // Seleccionar o deseleccionar todas las categorías visibles tras filtro
    const handleSelectAllVisibleCategories = (visibleCategoryIds, select) => {
        setForm(prev => {
            const otrasCategorias = prev.categorias.filter(id => !visibleCategoryIds.includes(id));
            return {
                ...prev,
                categorias: select ? [...otrasCategorias, ...visibleCategoryIds] : otrasCategorias
            };
        });
    };

    // Validaciones del formulario
    const validarFormulario = () => {
        if (!form.codigo.trim()) return 'El código de la promoción es obligatorio.';
        if (!form.nombre.trim()) return 'El nombre de la promoción es obligatorio.';
        if (!form.tipo_descuento) return 'El tipo de descuento es obligatorio.';
        
        const valor = parseFloat(form.valor_descuento);
        if (isNaN(valor) || valor <= 0) return 'El valor del descuento debe ser un número mayor a 0.';
        
        if (form.tipo_descuento === 'porcentaje' && valor > 100) {
            return 'El porcentaje de descuento no puede ser mayor a 100%.';
        }
        
        if (!form.fecha_inicio) return 'La fecha de inicio es obligatoria.';
        if (!form.fecha_fin) return 'La fecha de fin es obligatoria.';
        
        if (new Date(form.fecha_fin) < new Date(form.fecha_inicio)) {
            return 'La fecha de fin no puede ser anterior a la fecha de inicio.';
        }
        
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const errorValidacion = validarFormulario();
        if (errorValidacion) {
            setError(errorValidacion);
            return;
        }

        setSaving(true);
        try {
            const dataToSubmit = {
                ...form,
                codigo: form.codigo.toUpperCase().trim(),
                nombre: form.nombre.trim(),
                valor_descuento: parseFloat(form.valor_descuento),
                // Asegurar que pasamos listas de enteros de IDs
                productos: form.productos.map(id => parseInt(id, 10)),
                categorias: form.categorias.map(id => parseInt(id, 10))
            };

            if (editandoId) {
                await promocionesService.update(editandoId, dataToSubmit);
                setSuccess('Promoción actualizada correctamente.');
            } else {
                await promocionesService.create(dataToSubmit);
                setSuccess('Promoción creada correctamente.');
            }

            // Reiniciar y recargar
            setForm({
                codigo: '',
                nombre: '',
                descripcion: '',
                tipo_descuento: 'porcentaje',
                valor_descuento: '',
                fecha_inicio: '',
                fecha_fin: '',
                activa: true,
                productos: [],
                categorias: []
            });
            setEditandoId(null);
            setMostrarForm(false);
            cargarDatos();
        } catch (err) {
            console.error('Error al guardar promoción:', err);
            const serverErr = err.response?.data;
            let msg = 'Ocurrió un error al guardar la promoción.';
            if (serverErr) {
                if (typeof serverErr === 'object') {
                    // Extraer los mensajes específicos de los campos
                    msg = Object.entries(serverErr)
                        .map(([campo, errores]) => `${campo}: ${Array.isArray(errores) ? errores.join(', ') : errores}`)
                        .join(' | ');
                } else {
                    msg = serverErr;
                }
            }
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleEditar = (promo) => {
        setForm({
            codigo: promo.codigo,
            nombre: promo.nombre,
            descripcion: promo.descripcion || '',
            tipo_descuento: promo.tipo_descuento,
            valor_descuento: promo.valor_descuento,
            fecha_inicio: promo.fecha_inicio,
            fecha_fin: promo.fecha_fin,
            activa: promo.activa,
            // Guardamos solo los IDs
            productos: promo.productos || [],
            categorias: promo.categorias || []
        });
        setEditandoId(promo.id);
        setMostrarForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEliminar = async (id, codigo) => {
        if (!window.confirm(`¿Está seguro de eliminar la promoción "${codigo}"? Esta acción no se puede deshacer.`)) {
            return;
        }

        try {
            await promocionesService.delete(id);
            setSuccess('Promoción eliminada con éxito.');
            cargarDatos();
        } catch (err) {
            console.error('Error al eliminar:', err);
            setError(err.response?.data?.error || 'Error al eliminar la promoción. Asegúrese de que no esté en uso.');
        }
    };

    const handleToggleActiva = async (promo) => {
        try {
            const nuevaActiva = !promo.activa;
            await promocionesService.update(promo.id, { activa: nuevaActiva });
            setSuccess(`Promoción "${promo.codigo}" ${nuevaActiva ? 'activada' : 'desactivada'} correctamente.`);
            cargarDatos();
        } catch (err) {
            console.error('Error al actualizar estado:', err);
            setError('Error al actualizar el estado de la promoción.');
        }
    };

    // Filtrado de productos visibles en el formulario
    const productosFiltrados = productos.filter(p => 
        p.nombre.toLowerCase().includes(busquedaProd.toLowerCase()) || 
        (p.categoria_nombre && p.categoria_nombre.toLowerCase().includes(busquedaProd.toLowerCase()))
    );

    // Filtrado de categorías visibles en el formulario
    const categoriasFiltradas = categorias.filter(c => 
        c.nombre.toLowerCase().includes(busquedaCat.toLowerCase())
    );

    // Filtrado de promociones en la tabla
    const promocionesFiltradas = promociones.filter(promo => {
        const matchesSearch = 
            promo.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            promo.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
            (promo.descripcion && promo.descripcion.toLowerCase().includes(busqueda.toLowerCase()));
        
        const matchesEstado = 
            filtroEstado === 'todos' ||
            (filtroEstado === 'activas' && promo.activa) ||
            (filtroEstado === 'inactivas' && !promo.activa);

        return matchesSearch && matchesEstado;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                <RefreshCw className="animate-spin h-10 w-10 text-indigo-600 mb-4" />
                <p className="font-semibold text-lg">Cargando promociones...</p>
                <p className="text-sm text-slate-400">Por favor espere un momento.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-full">
            {/* Header del módulo */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <Tag className="text-emerald-600" /> Gestión de Promociones
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Crea, edita y gestiona las campañas de descuentos de la cafetería.
                    </p>
                </div>
                <button 
                    onClick={() => { 
                        setMostrarForm(!mostrarForm); 
                        setForm({
                            codigo: '',
                            nombre: '',
                            descripcion: '',
                            tipo_descuento: 'porcentaje',
                            valor_descuento: '',
                            fecha_inicio: '',
                            fecha_fin: '',
                            activa: true,
                            productos: [],
                            categorias: []
                        }); 
                        setEditandoId(null); 
                        setError('');
                    }}
                    className={`flex items-center gap-2 px-5 py-3 rounded-full font-bold transition duration-200 shadow-md ${
                        mostrarForm 
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                >
                    {mostrarForm ? (
                        <>
                            <X size={18} /> Cancelar
                        </>
                    ) : (
                        <>
                            <Plus size={18} /> Nueva Promoción
                        </>
                    )}
                </button>
            </div>

            {/* Alertas */}
            {error && (
                <div className="flex items-start gap-3 bg-rose-50 border-l-4 border-rose-600 p-4 rounded-xl shadow-sm animate-fade-in text-rose-900">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-rose-600" />
                    <div>
                        <p className="font-bold text-sm">Error en la operación</p>
                        <p className="text-sm mt-0.5">{error}</p>
                    </div>
                </div>
            )}

            {success && (
                <div className="flex items-start gap-3 bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded-xl shadow-sm animate-fade-in text-emerald-900">
                    <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-emerald-600" />
                    <div>
                        <p className="font-bold text-sm">Operación exitosa</p>
                        <p className="text-sm mt-0.5">{success}</p>
                    </div>
                </div>
            )}

            {/* Formulario */}
            {mostrarForm && (
                <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-100 space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            {editandoId ? <Edit className="text-indigo-600" size={20} /> : <Plus className="text-emerald-600" size={20} />}
                            {editandoId ? `Editar Promoción: ${form.codigo}` : 'Datos de la Nueva Promoción'}
                        </h3>
                        <p className="text-slate-400 text-xs mt-0.5">Todos los campos con asterisco (*) son obligatorios.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Sección General */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-black text-slate-700 tracking-wider uppercase border-l-2 border-indigo-500 pl-2">
                                Información Básica
                            </h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Código *</label>
                                    <input 
                                        type="text"
                                        name="codigo" 
                                        value={form.codigo} 
                                        onChange={handleInputChange} 
                                        required 
                                        disabled={!!editandoId} // No permitir cambiar código si ya existe
                                        placeholder="Ej: DIA-MADRE, PROMO10"
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition uppercase disabled:bg-slate-100 disabled:text-slate-500" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Nombre *</label>
                                    <input 
                                        type="text"
                                        name="nombre" 
                                        value={form.nombre} 
                                        onChange={handleInputChange} 
                                        required 
                                        placeholder="Nombre descriptivo"
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Descripción</label>
                                <textarea 
                                    name="descripcion" 
                                    value={form.descripcion} 
                                    onChange={handleInputChange} 
                                    rows="2"
                                    placeholder="Detalles sobre las condiciones de la promoción..."
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition resize-none" 
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Tipo de Descuento *</label>
                                    <select 
                                        name="tipo_descuento" 
                                        value={form.tipo_descuento} 
                                        onChange={handleInputChange} 
                                        required 
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-white"
                                    >
                                        <option value="porcentaje">Porcentaje (%)</option>
                                        <option value="monto_fijo">Monto Fijo (Bs)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">
                                        Valor del Descuento * {form.tipo_descuento === 'porcentaje' ? '(%)' : '(Bs)'}
                                    </label>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        name="valor_descuento" 
                                        value={form.valor_descuento} 
                                        onChange={handleInputChange} 
                                        required 
                                        placeholder={form.tipo_descuento === 'porcentaje' ? 'Ej: 15' : 'Ej: 10.50'}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1">
                                        <Calendar size={16} /> Fecha de Inicio *
                                    </label>
                                    <input 
                                        type="date" 
                                        name="fecha_inicio" 
                                        value={form.fecha_inicio} 
                                        onChange={handleInputChange} 
                                        required 
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1">
                                        <Calendar size={16} /> Fecha de Fin *
                                    </label>
                                    <input 
                                        type="date" 
                                        name="fecha_fin" 
                                        value={form.fecha_fin} 
                                        onChange={handleInputChange} 
                                        required 
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition" 
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 py-2">
                                <input 
                                    type="checkbox" 
                                    id="activa" 
                                    name="activa" 
                                    checked={form.activa} 
                                    onChange={handleInputChange} 
                                    className="h-5 w-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                />
                                <label htmlFor="activa" className="text-sm font-bold text-slate-700 select-none cursor-pointer">
                                    Promoción activa e inmediatamente disponible
                                </label>
                            </div>
                        </div>

                        {/* Sección de Selección de Productos y Categorías */}
                        <div className="space-y-6">
                            {/* Selector de Productos */}
                            <div className="space-y-2">
                                <h4 className="text-sm font-black text-slate-700 tracking-wider uppercase border-l-2 border-indigo-500 pl-2 flex justify-between items-center">
                                    <span>Asociar Productos</span>
                                    <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full lowercase normal-case">
                                        {form.productos.length} seleccionados
                                    </span>
                                </h4>
                                
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="Buscar producto por nombre..." 
                                        value={busquedaProd}
                                        onChange={(e) => setBusquedaProd(e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                    <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                                </div>

                                <div className="border border-slate-200 rounded-2xl p-3 h-44 overflow-y-auto bg-slate-50 space-y-2 text-sm">
                                    {productosFiltrados.length === 0 ? (
                                        <p className="text-slate-400 text-center py-8">No se encontraron productos.</p>
                                    ) : (
                                        <div className="space-y-1">
                                            {/* Opciones rápidas */}
                                            <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-2">
                                                <span className="text-xs text-slate-500 font-bold">Listado ({productosFiltrados.length})</span>
                                                <div className="flex gap-2">
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleSelectAllVisibleProducts(productosFiltrados.map(p => p.id), true)}
                                                        className="text-xs text-indigo-600 font-bold hover:underline"
                                                    >
                                                        Todos
                                                    </button>
                                                    <span className="text-slate-300">|</span>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleSelectAllVisibleProducts(productosFiltrados.map(p => p.id), false)}
                                                        className="text-xs text-slate-500 font-bold hover:underline"
                                                    >
                                                        Ninguno
                                                    </button>
                                                </div>
                                            </div>
                                            {productosFiltrados.map(p => {
                                                const isChecked = form.productos.includes(p.id);
                                                return (
                                                    <div 
                                                        key={p.id} 
                                                        onClick={() => handleProductToggle(p.id)}
                                                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition select-none ${
                                                            isChecked ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-white border border-transparent'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={isChecked}
                                                                onChange={() => {}} // Manejado por onClick del contenedor
                                                                className="rounded text-indigo-600 border-slate-300 pointer-events-none"
                                                            />
                                                            <div>
                                                                <p className="font-bold text-slate-800">{p.nombre}</p>
                                                                <p className="text-xs text-slate-400">{p.categoria_nombre || 'Sin categoría'}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                                                            Bs {p.precio}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Selector de Categorías */}
                            <div className="space-y-2">
                                <h4 className="text-sm font-black text-slate-700 tracking-wider uppercase border-l-2 border-indigo-500 pl-2 flex justify-between items-center">
                                    <span>Asociar Categorías Completas</span>
                                    <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full lowercase normal-case">
                                        {form.categorias.length} seleccionadas
                                    </span>
                                </h4>
                                
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="Buscar categoría..." 
                                        value={busquedaCat}
                                        onChange={(e) => setBusquedaCat(e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                    <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                                </div>

                                <div className="border border-slate-200 rounded-2xl p-3 h-36 overflow-y-auto bg-slate-50 space-y-2 text-sm">
                                    {categoriasFiltradas.length === 0 ? (
                                        <p className="text-slate-400 text-center py-6">No se encontraron categorías.</p>
                                    ) : (
                                        <div className="space-y-1">
                                            {/* Opciones rápidas */}
                                            <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-2">
                                                <span className="text-xs text-slate-500 font-bold font-bold">Categorías ({categoriasFiltradas.length})</span>
                                                <div className="flex gap-2">
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleSelectAllVisibleCategories(categoriasFiltradas.map(c => c.id), true)}
                                                        className="text-xs text-indigo-600 font-bold hover:underline"
                                                    >
                                                        Todas
                                                    </button>
                                                    <span className="text-slate-300">|</span>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleSelectAllVisibleCategories(categoriasFiltradas.map(c => c.id), false)}
                                                        className="text-xs text-slate-500 font-bold hover:underline"
                                                    >
                                                        Ninguna
                                                    </button>
                                                </div>
                                            </div>
                                            {categoriasFiltradas.map(c => {
                                                const isChecked = form.categorias.includes(c.id);
                                                return (
                                                    <div 
                                                        key={c.id} 
                                                        onClick={() => handleCategoryToggle(c.id)}
                                                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition select-none ${
                                                            isChecked ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-white border border-transparent'
                                                        }`}
                                                    >
                                                        <input 
                                                            type="checkbox" 
                                                            checked={isChecked}
                                                            onChange={() => {}} // Manejado por onClick del contenedor
                                                            className="rounded text-indigo-600 border-slate-300 pointer-events-none"
                                                        />
                                                        <span className="font-bold text-slate-800">{c.nombre}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción del formulario */}
                    <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-6">
                        <button 
                            type="submit" 
                            disabled={saving}
                            className="bg-emerald-600 text-white px-6 py-3 rounded-full font-bold hover:bg-emerald-700 transition shadow-md flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? 'Guardando...' : 'Guardar Promoción'}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => {
                                setMostrarForm(false);
                                setEditandoId(null);
                                setError('');
                            }}
                            className="border border-slate-300 text-slate-700 px-6 py-3 rounded-full font-bold hover:bg-slate-100 transition"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            )}

            {/* Listado y Filtros */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden space-y-4 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                    <h3 className="text-lg font-black text-slate-800">Listado de Promociones</h3>
                    
                    {/* Búsqueda y Filtro rápido */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-[280px]">
                            <input 
                                type="text"
                                placeholder="Buscar código o nombre..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full border border-slate-200 rounded-full pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                        </div>
                        <select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            className="border border-slate-200 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                        >
                            <option value="todos">Todos los estados</option>
                            <option value="activas">Solo Activas</option>
                            <option value="inactivas">Solo Inactivas</option>
                        </select>
                    </div>
                </div>

                {/* Tabla Responsive */}
                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Código</th>
                                <th className="px-6 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Detalles Promoción</th>
                                <th className="px-6 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Descuento</th>
                                <th className="px-6 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Vigencia</th>
                                <th className="px-6 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Asociaciones</th>
                                <th className="px-6 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-black text-slate-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {promocionesFiltradas.map(promo => {
                                const tieneProductos = promo.nombres_productos && promo.nombres_productos.length > 0;
                                const tieneCategorias = promo.nombres_categorias && promo.nombres_categorias.length > 0;

                                return (
                                    <tr key={promo.id} className="hover:bg-slate-50/50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-mono font-bold text-xs uppercase shadow-sm">
                                                <Tag size={12} className="text-slate-500" />
                                                {promo.codigo}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800 text-sm">{promo.nombre}</div>
                                            {promo.descripcion && (
                                                <p className="text-slate-400 text-xs mt-0.5 truncate max-w-[200px]" title={promo.descripcion}>
                                                    {promo.descripcion}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1 font-extrabold text-sm text-slate-800">
                                                {promo.tipo_descuento === 'porcentaje' ? (
                                                    <>
                                                        <Percent size={14} className="text-indigo-600" />
                                                        {parseFloat(promo.valor_descuento).toFixed(0)}%
                                                    </>
                                                ) : (
                                                    <>
                                                        Bs {parseFloat(promo.valor_descuento).toFixed(2)}
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 space-y-0.5">
                                            <div><span className="font-bold text-slate-400">Inicio:</span> {promo.fecha_inicio}</div>
                                            <div><span className="font-bold text-slate-400">Fin:</span> {promo.fecha_fin}</div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 space-y-1">
                                            {tieneProductos && (
                                                <div className="max-w-[220px]">
                                                    <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px]">prods</span>{' '}
                                                    <span className="text-slate-600" title={promo.nombres_productos.join(', ')}>
                                                        {promo.nombres_productos.length === 1 
                                                            ? promo.nombres_productos[0] 
                                                            : `${promo.nombres_productos.length} productos`}
                                                    </span>
                                                </div>
                                            )}
                                            {tieneCategorias && (
                                                <div className="max-w-[220px]">
                                                    <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">cats</span>{' '}
                                                    <span className="text-slate-600" title={promo.nombres_categorias.join(', ')}>
                                                        {promo.nombres_categorias.length === 1 
                                                            ? promo.nombres_categorias[0] 
                                                            : `${promo.nombres_categorias.length} categorías`}
                                                    </span>
                                                </div>
                                            )}
                                            {!tieneProductos && !tieneCategorias && (
                                                <span className="text-slate-400 italic">Global (Aplica a todo)</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button 
                                                onClick={() => handleToggleActiva(promo)}
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold transition select-none ${
                                                    promo.activa 
                                                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                                                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                                                }`}
                                                title="Haga clic para cambiar estado"
                                            >
                                                {promo.activa ? 'Activa' : 'Inactiva'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button 
                                                onClick={() => handleEditar(promo)} 
                                                className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl font-bold text-xs transition"
                                            >
                                                <Edit size={12} /> Editar
                                            </button>
                                            <button 
                                                onClick={() => handleEliminar(promo.id, promo.codigo)} 
                                                className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl font-bold text-xs transition"
                                            >
                                                <Trash2 size={12} /> Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {promocionesFiltradas.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-10 text-center text-slate-400 italic text-sm">
                                        No hay promociones registradas o que coincidan con la búsqueda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GestionPromociones;
