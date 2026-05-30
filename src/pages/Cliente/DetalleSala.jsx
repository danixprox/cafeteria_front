import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { salasService } from '../../services/salasService';
import { reservasService } from '../../services/reservasService';
import { productosService } from '../../services/productosService';
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

    const [deseaPedido, setDeseaPedido] = useState(false);
    const [productos, setProductos] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const [categorias, setCategorias] = useState([]);

    const [loading, setLoading] = useState(true);
    const [loadingDisponibilidad, setLoadingDisponibilidad] = useState(false);
    const [reservando, setReservando] = useState(false);
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');

    // ── Helpers ────────────────────────────────────────────────────────────────
    const generarFechas = () => {
        const fechas = [];
        const hoy = new Date();
        const y0 = hoy.getFullYear(), m0 = hoy.getMonth(), d0 = hoy.getDate();
        for (let i = 0; i < 7; i++) {
            const f = new Date(y0, m0, d0 + i);
            const y = f.getFullYear();
            const m = String(f.getMonth() + 1).padStart(2, '0');
            const d = String(f.getDate()).padStart(2, '0');
            fechas.push({
                fechaISO: `${y}-${m}-${d}`,
                dia: f.toLocaleDateString('es-ES', { weekday: 'short' }),
                numero: f.getDate(),
                mes: f.toLocaleDateString('es-ES', { month: 'short' })
            });
        }
        return fechas;
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `${import.meta.env.VITE_API_URL || ''}${imagePath}`;
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

    // ── Datos iniciales ────────────────────────────────────────────────────────
    useEffect(() => {
        Promise.all([
            salasService.getById(id),
            salasService.getMesas(id),
            productosService.getActivos()
        ])
        .then(([salaRes, mesasRes, prodRes]) => {
            setSala(salaRes.data);
            setMesas(mesasRes.data);
            const prods = prodRes.data || [];
            setProductos(prods);
            const catsMap = {};
            prods.forEach(p => {
                if (!catsMap[p.categoria]) {
                    catsMap[p.categoria] = { nombre: p.categoria_nombre, productos: [] };
                }
                catsMap[p.categoria].productos.push(p);
            });
            setCategorias(Object.values(catsMap));
        })
        .catch(err => {
            console.error(err);
            setError('Error al cargar la información de la sala.');
        })
        .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (fecha) {
            setLoadingDisponibilidad(true);
            setHorarioSeleccionado(null);
            setMesaSeleccionada(null);
            setError('');
            salasService.getDisponibilidad(id, fecha)
                .then(res => setDisponibilidad(res.data))
                .catch(err => {
                    setError(err.response?.data?.error || 'Error al cargar la disponibilidad para esta fecha.');
                    setDisponibilidad([]);
                })
                .finally(() => setLoadingDisponibilidad(false));
        }
    }, [fecha, id]);

    // ── Carrito (lógica sin cambios) ───────────────────────────────────────────
    const agregarAlCarrito = (producto, cantidad) => {
        if (cantidad <= 0) return;
        const itemExistente = carrito.find(item => item.id === producto.id);
        const cantidadActual = itemExistente ? itemExistente.cantidad : 0;
        const nuevaCantidad = cantidadActual + cantidad;
        if (nuevaCantidad > producto.stock) {
            setError(`No hay suficiente stock para "${producto.nombre}". Disponible: ${producto.stock}.`);
            return;
        }
        setError('');
        if (itemExistente) {
            setCarrito(carrito.map(item =>
                item.id === producto.id
                    ? { ...item, cantidad: nuevaCantidad, subtotal: nuevaCantidad * producto.precio }
                    : item
            ));
        } else {
            setCarrito([...carrito, {
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad,
                subtotal: cantidad * producto.precio
            }]);
        }
    };

    const disminuirCantidad = (idProducto) => {
        setError('');
        const item = carrito.find(i => i.id === idProducto);
        if (!item) return;
        if (item.cantidad <= 1) {
            eliminarDelCarrito(idProducto);
        } else {
            setCarrito(carrito.map(i =>
                i.id === idProducto
                    ? { ...i, cantidad: i.cantidad - 1, subtotal: (i.cantidad - 1) * i.precio }
                    : i
            ));
        }
    };

    const eliminarDelCarrito = (idProducto) => {
        setError('');
        setCarrito(carrito.filter(item => item.id !== idProducto));
    };

    const totalCarrito = carrito.reduce((acc, item) => acc + item.subtotal, 0);

    // ── Confirmar reserva (lógica sin cambios) ─────────────────────────────────
    const handleReservar = async () => {
        setError('');
        setExito('');
        if (!fecha) { setError('Debes seleccionar una fecha para tu reserva.'); return; }
        if (!horarioSeleccionado) { setError('Debes seleccionar un horario disponible.'); return; }
        if (!mesaSeleccionada) { setError('Debes seleccionar una mesa en el plano antes de continuar.'); return; }
        const mesaObjeto = mesas.find(m => m.id === mesaSeleccionada);
        if (!mesaObjeto) { setError('La mesa seleccionada no es válida.'); return; }
        if (parseInt(cantidadPersonas) > mesaObjeto.capacidad) {
            setError(`La cantidad de personas excede la capacidad de la mesa "${mesaObjeto.nombre}" (máx. ${mesaObjeto.capacidad}).`);
            return;
        }
        if (parseInt(cantidadPersonas) < 1) { setError('La cantidad de personas debe ser al menos 1.'); return; }
        setReservando(true);
        try {
            await reservasService.create({
                sala: id,
                mesa: mesaSeleccionada,
                fecha: fecha,
                hora_inicio: horarioSeleccionado.hora_inicio,
                hora_fin: horarioSeleccionado.hora_fin,
                cantidad_personas: parseInt(cantidadPersonas),
                productos: deseaPedido ? carrito.map(c => ({ id: c.id, cantidad: c.cantidad })) : []
            });
            setExito('🎉 ¡Reserva confirmada con éxito! Redirigiendo a tus reservas...');
            setTimeout(() => navigate('/cliente/mis-reservas'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Ocurrió un error al realizar la reserva. Intenta de nuevo.');
        } finally {
            setReservando(false);
        }
    };

    const puedeReservar = sala?.habilitada !== false;
    const mesasDisponiblesEnHorario = horarioSeleccionado
        ? (horarioSeleccionado.mesas?.filter(m => m.disponible)?.length || 0)
        : 0;
    const fechas = generarFechas();

    if (loading) return <div className="p-10 text-center text-slate-500 font-bold">Cargando detalles de la sala...</div>;
    if (!sala) return <div className="p-10 text-center text-red-500">{error || 'Sala no encontrada.'}</div>;

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto min-h-screen bg-slate-50">

            {/* ── Cabecera de la sala ── */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-slate-100 p-2 h-56">
                    <div className="col-span-1 md:col-span-2 h-full rounded-2xl overflow-hidden relative">
                        {sala.imagen_principal ? (
                            <img src={getImageUrl(sala.imagen_principal)} onError={handleImageError} alt={sala.nombre} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-200 flex items-center justify-center font-bold text-slate-400">Sin Imagen Principal</div>
                        )}
                        <div className="absolute top-3 left-3">{getBadgeDisponibilidad(sala.disponibilidad)}</div>
                    </div>
                    <div className="hidden md:flex flex-col gap-2 h-full overflow-y-auto pr-1">
                        {sala.galeria && sala.galeria.length > 0
                            ? sala.galeria.map(img => (
                                <img key={img.id} src={getImageUrl(img.imagen)} onError={handleImageError} alt="Galeria" className="w-full h-24 object-cover rounded-2xl" />
                            ))
                            : <div className="w-full h-full bg-slate-200 flex items-center justify-center rounded-2xl font-bold text-slate-400">Sin Galería</div>
                        }
                    </div>
                </div>
                <div className="px-6 py-4 flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-black text-slate-800">{sala.nombre}</h1>
                        <p className="text-indigo-600 font-bold text-sm tracking-wider uppercase">{sala.tematica || 'Sin Temática'}</p>
                        <p className="text-slate-500 text-sm mt-1 line-clamp-2">{sala.descripcion}</p>
                    </div>
                    <div className="flex gap-3 text-xs shrink-0">
                        <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-center">
                            <p className="text-slate-400 font-medium">Capacidad</p>
                            <p className="font-bold text-slate-800">{sala.capacidad_total} pers.</p>
                        </div>
                        <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-center">
                            <p className="text-slate-400 font-medium">Mesas</p>
                            <p className="font-bold text-slate-800">{mesas.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Mensajes ── */}
            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-4 font-semibold border border-red-200 flex items-center gap-3">
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {error}
                </div>
            )}
            {exito && (
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-4 font-semibold border border-emerald-200 flex items-center gap-3">
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {exito}
                </div>
            )}
            {!puedeReservar && (
                <div className="bg-amber-50 text-amber-700 p-4 rounded-xl mb-4 font-semibold border border-amber-200">
                    ⚠️ Esta sala está deshabilitada por el administrador y no acepta reservas en este momento.
                </div>
            )}

            {/* ── Grid principal: pasos + mapa ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                {/* Columna izquierda: pasos 1-3 */}
                <div className="space-y-4">

                    {/* Paso 1: Fecha */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-xs font-black">1</span>
                            Elige la fecha
                        </h3>
                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                            {fechas.map((f, index) => (
                                <button
                                    key={index}
                                    onClick={() => setFecha(f.fechaISO)}
                                    className={`p-2 rounded-xl border text-center font-bold transition ${fecha === f.fechaISO ? 'bg-yellow-500 scale-105 text-black shadow-lg' : 'bg-gray-100 hover:bg-gray-200'}`}
                                >
                                    <div className="text-[10px] uppercase">{f.dia}</div>
                                    <div className="text-base">{f.numero}</div>
                                    <div className="text-[10px]">{f.mes}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Paso 2: Horario */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-xs font-black">2</span>
                            Elige el horario
                        </h3>
                        {loadingDisponibilidad ? (
                            <div className="flex items-center gap-2 text-slate-500 text-sm py-2">
                                <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                Cargando horarios...
                            </div>
                        ) : disponibilidad.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {disponibilidad.map((bloque, idx) => {
                                    const mesasLibres = bloque.mesas?.filter(m => m.disponible)?.length || 0;
                                    const isSelected = horarioSeleccionado === bloque;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => { setHorarioSeleccionado(bloque); setMesaSeleccionada(null); setError(''); }}
                                            className={`p-2 text-sm rounded-lg border transition-all duration-150 ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : mesasLibres > 0 ? 'bg-white hover:bg-indigo-50 border-slate-200 text-slate-700 hover:border-indigo-300' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                                        >
                                            <div className="font-bold text-xs">{bloque.hora_inicio.substring(0, 5)}</div>
                                            <div className="font-bold text-xs">{bloque.hora_fin.substring(0, 5)}</div>
                                            <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-indigo-200' : mesasLibres > 0 ? 'text-emerald-600' : 'text-red-400'}`}>
                                                {mesasLibres > 0 ? `${mesasLibres} libre${mesasLibres > 1 ? 's' : ''}` : 'Sin mesas'}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-slate-400 text-sm py-2 text-center">Selecciona una fecha para ver horarios.</p>
                        )}
                    </div>

                    {/* Paso 3: Detalles + Confirmar */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-xs font-black">3</span>
                            Detalles finales
                        </h3>

                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cantidad de personas</label>
                        <input
                            type="number"
                            min="1"
                            max={mesas.find(m => m.id === mesaSeleccionada)?.capacidad || 20}
                            className="w-full border border-slate-300 p-2.5 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            value={cantidadPersonas}
                            onChange={(e) => setCantidadPersonas(parseInt(e.target.value) || 1)}
                        />

                        {/* Checkbox pedido */}
                        <div className="pt-3 border-t border-slate-100">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 text-indigo-600 rounded"
                                    checked={deseaPedido}
                                    onChange={(e) => setDeseaPedido(e.target.checked)}
                                />
                                <span className="font-bold text-slate-700 text-sm">¿Desea agregar un pedido?</span>
                            </label>
                            {deseaPedido && (
                                <p className="text-xs text-indigo-500 mt-1 ml-7">
                                    Elige tus productos en la sección de abajo.
                                </p>
                            )}
                        </div>

                        {/* Resumen de carrito compacto */}
                        {deseaPedido && carrito.length > 0 && (
                            <div className="mt-3 bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                                <p className="text-xs font-bold text-indigo-700 mb-2">
                                    🛒 {carrito.length} producto{carrito.length > 1 ? 's' : ''} seleccionado{carrito.length > 1 ? 's' : ''}
                                </p>
                                <div className="space-y-1 max-h-28 overflow-y-auto">
                                    {carrito.map(item => (
                                        <div key={item.id} className="flex items-center justify-between gap-2 text-xs">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <span className="font-semibold text-slate-700 truncate">{item.nombre}</span>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button onClick={() => disminuirCantidad(item.id)}
                                                    className="w-5 h-5 rounded bg-red-100 text-red-700 hover:bg-red-200 flex items-center justify-center font-bold transition">
                                                    -
                                                </button>
                                                <span className="font-bold w-4 text-center">{item.cantidad}</span>
                                                <button
                                                    onClick={() => { const prod = productos.find(p => p.id === item.id); if (prod) agregarAlCarrito(prod, 1); }}
                                                    disabled={item.cantidad >= (productos.find(p => p.id === item.id)?.stock || 0)}
                                                    className="w-5 h-5 rounded bg-green-100 text-green-700 hover:bg-green-200 flex items-center justify-center font-bold transition disabled:opacity-40 disabled:cursor-not-allowed">
                                                    +
                                                </button>
                                                <button onClick={() => eliminarDelCarrito(item.id)}
                                                    className="text-red-400 hover:text-red-600 transition ml-1 text-xs">
                                                    ✕
                                                </button>
                                            </div>
                                            <span className="text-indigo-700 font-bold shrink-0 w-16 text-right">
                                                Bs {item.subtotal.toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-indigo-200 mt-2 pt-2 flex justify-between items-center">
                                    <span className="text-xs font-bold text-indigo-700">Total pedido</span>
                                    <span className="text-sm font-black text-indigo-700">Bs {totalCarrito.toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleReservar}
                            disabled={!mesaSeleccionada || !horarioSeleccionado || !puedeReservar || reservando}
                            className={`w-full mt-4 py-3 rounded-xl font-bold transition shadow-sm text-sm flex items-center justify-center gap-2 ${
                                !puedeReservar
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    : mesaSeleccionada && horarioSeleccionado
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            {reservando
                                ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Procesando...</>)
                                : !puedeReservar
                                    ? 'Sala deshabilitada'
                                    : !horarioSeleccionado
                                        ? 'Selecciona un horario'
                                        : !mesaSeleccionada
                                            ? 'Selecciona una mesa'
                                            : deseaPedido && carrito.length > 0
                                                ? '✓ Confirmar Reserva con Pedido'
                                                : '✓ Confirmar Reserva'
                            }
                        </button>
                    </div>
                </div>

                {/* Columna derecha: Mapa de mesas */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
                        <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-xs font-black">4</span>
                        Selecciona tu mesa en el plano
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">Haz click sobre una mesa disponible para seleccionarla.</p>

                    {!horarioSeleccionado ? (
                        <div className="flex flex-col items-center justify-center h-72 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
                            <svg className="w-10 h-10 mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="font-semibold text-sm">Selecciona una fecha y horario</span>
                            <span className="text-xs mt-1">para ver las mesas disponibles</span>
                        </div>
                    ) : mesasDisponiblesEnHorario === 0 ? (
                        <div className="flex flex-col items-center justify-center h-72 bg-red-50 rounded-xl border-2 border-dashed border-red-200 text-red-400">
                            <span className="text-3xl mb-2">😔</span>
                            <span className="font-semibold text-sm">No hay mesas disponibles</span>
                            <span className="text-xs mt-1">en este horario. Prueba otro horario o fecha.</span>
                        </div>
                    ) : (
                        <MapaMesas
                            mesas={mesas}
                            disponibilidad={horarioSeleccionado}
                            mesaSeleccionada={mesaSeleccionada}
                            onSeleccionarMesa={(mesaId) => { setMesaSeleccionada(mesaId); setError(''); }}
                        />
                    )}
                </div>
            </div>

            {/* ── Catálogo de productos (full-width, solo cuando deseaPedido) ── */}
            {deseaPedido && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                🍽️ Catálogo de productos
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Selecciona los productos que deseas incluir en tu preorden.
                            </p>
                        </div>
                        {carrito.length > 0 && (
                            <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                                {carrito.reduce((a, i) => a + i.cantidad, 0)} ítem{carrito.reduce((a, i) => a + i.cantidad, 0) !== 1 ? 's' : ''} · Bs {totalCarrito.toFixed(2)}
                            </span>
                        )}
                    </div>

                    {categorias.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-8">No hay productos disponibles en este momento.</p>
                    ) : (
                        <div className="space-y-8">
                            {categorias.map((cat, idx) => (
                                <div key={idx}>
                                    {/* Cabecera de categoría */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-xs font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                                            {cat.nombre}
                                        </span>
                                        <div className="flex-1 h-px bg-slate-100" />
                                    </div>

                                    {/* Grid de tarjetas de producto */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {cat.productos.map(prod => {
                                            const itemEnCarrito = carrito.find(i => i.id === prod.id);
                                            const cantEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0;
                                            const sinStock = prod.stock === 0;
                                            const limiteAlcanzado = cantEnCarrito >= prod.stock;
                                            const imgUrl = getImageUrl(prod.imagen);

                                            return (
                                                <div
                                                    key={prod.id}
                                                    className={`rounded-2xl border overflow-hidden flex flex-col transition ${
                                                        sinStock
                                                            ? 'border-slate-200 opacity-60'
                                                            : cantEnCarrito > 0
                                                                ? 'border-indigo-300 ring-2 ring-indigo-100 shadow-sm'
                                                                : 'border-slate-200 hover:border-indigo-200 hover:shadow-sm'
                                                    }`}
                                                >
                                                    {/* Imagen del producto */}
                                                    <div className="h-36 bg-slate-100 overflow-hidden relative">
                                                        {imgUrl ? (
                                                            <img
                                                                src={imgUrl}
                                                                alt={prod.nombre}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'flex';
                                                                }}
                                                            />
                                                        ) : null}
                                                        {/* Placeholder (visible si no hay imagen o si la imagen falla) */}
                                                        <div
                                                            className="w-full h-full flex flex-col items-center justify-center text-slate-300 absolute inset-0"
                                                            style={{ display: imgUrl ? 'none' : 'flex' }}
                                                        >
                                                            <svg className="w-10 h-10 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            <span className="text-xs font-medium">Sin imagen</span>
                                                        </div>
                                                        {/* Badge carrito */}
                                                        {cantEnCarrito > 0 && (
                                                            <span className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                                                                {cantEnCarrito}
                                                            </span>
                                                        )}
                                                        {/* Badge sin stock */}
                                                        {sinStock && (
                                                            <span className="absolute inset-0 bg-slate-800/40 flex items-center justify-center">
                                                                <span className="bg-white text-slate-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide">
                                                                    Sin stock
                                                                </span>
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Info y acciones */}
                                                    <div className="p-3 flex flex-col flex-1 gap-2">
                                                        <div className="flex-1">
                                                            <p className="font-bold text-slate-800 text-sm leading-tight">{prod.nombre}</p>
                                                            <p className="text-lg font-black text-indigo-700 mt-1">Bs {parseFloat(prod.precio).toFixed(2)}</p>
                                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                                Stock disponible: <span className="font-semibold text-slate-600">{prod.stock}</span>
                                                            </p>
                                                        </div>

                                                        {!sinStock && (
                                                            <div className="flex items-center gap-2 mt-1">
                                                                {cantEnCarrito > 0 ? (
                                                                    <div className="flex items-center gap-2 w-full">
                                                                        <button
                                                                            onClick={() => disminuirCantidad(prod.id)}
                                                                            className="w-8 h-8 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 flex items-center justify-center font-bold transition text-sm"
                                                                        >
                                                                            -
                                                                        </button>
                                                                        <span className="flex-1 text-center font-black text-slate-800">{cantEnCarrito}</span>
                                                                        <button
                                                                            onClick={() => agregarAlCarrito(prod, 1)}
                                                                            disabled={limiteAlcanzado}
                                                                            className="w-8 h-8 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 flex items-center justify-center font-bold transition text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                                                        >
                                                                            +
                                                                        </button>
                                                                        <button
                                                                            onClick={() => eliminarDelCarrito(prod.id)}
                                                                            className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition text-xs"
                                                                            title="Quitar del carrito"
                                                                        >
                                                                            ✕
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => agregarAlCarrito(prod, 1)}
                                                                        className="w-full py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition"
                                                                    >
                                                                        + Agregar
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DetalleSala;
