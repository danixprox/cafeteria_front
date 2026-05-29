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
    
    // Estados para carrito y productos
    const [deseaPedido, setDeseaPedido] = useState(false);
    const [productos, setProductos] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const [categorias, setCategorias] = useState([]);

    const [loading, setLoading] = useState(true);
    const [loadingDisponibilidad, setLoadingDisponibilidad] = useState(false);
    const [reservando, setReservando] = useState(false);
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');

    const generarFechas = () => {
        const fechas = [];
        const hoy = new Date();
        const y0 = hoy.getFullYear(), m0 = hoy.getMonth(), d0 = hoy.getDate();
        for (let i = 0; i < 7; i++) {
            // Construir con componentes locales para evitar el desfase UTC
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

    useEffect(() => {
        Promise.all([
            salasService.getById(id),
            salasService.getMesas(id),
            productosService.getActivos()
        ])
        .then(([salaRes, mesasRes, prodRes]) => {
            setSala(salaRes.data);
            setMesas(mesasRes.data);
            
            // Agrupar productos
            const prods = prodRes.data || [];
            setProductos(prods);
            const catsMap = {};
            prods.forEach(p => {
                if(!catsMap[p.categoria]) {
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

    const puedeReservar = sala?.habilitada !== false;

    // Funciones del carrito (sin validación de stock — es una preorden, no un pedido)
    const agregarAlCarrito = (producto, cantidad) => {
        if (cantidad <= 0) return;
        const itemExistente = carrito.find(item => item.id === producto.id);
        if (itemExistente) {
            setCarrito(carrito.map(item =>
                item.id === producto.id
                    ? { ...item, cantidad: item.cantidad + cantidad, subtotal: (item.cantidad + cantidad) * producto.precio }
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

    const eliminarDelCarrito = (idProducto) => {
        setCarrito(carrito.filter(item => item.id !== idProducto));
    };

    const totalCarrito = carrito.reduce((acc, item) => acc + item.subtotal, 0);

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

    const mesasDisponiblesEnHorario = horarioSeleccionado
        ? (horarioSeleccionado.mesas?.filter(m => m.disponible)?.length || 0)
        : 0;

    if (loading) return <div className="p-10 text-center text-slate-500 font-bold">Cargando detalles de la sala...</div>;
    if (!sala) return <div className="p-10 text-center text-red-500">{error || 'Sala no encontrada.'}</div>;

    const fechas = generarFechas();

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-slate-50">
            {/* Cabecera */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 bg-slate-100 p-2 h-[400px]">
                    <div className="col-span-1 md:col-span-2 lg:col-span-2 h-full rounded-2xl overflow-hidden relative">
                        {sala.imagen_principal ? (
                            <img src={getImageUrl(sala.imagen_principal)} onError={handleImageError} alt={sala.nombre} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-200 flex items-center justify-center font-bold text-slate-400">Sin Imagen Principal</div>
                        )}
                        <div className="absolute top-4 left-4">{getBadgeDisponibilidad(sala.disponibilidad)}</div>
                    </div>
                    <div className="hidden lg:flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                        {sala.galeria && sala.galeria.length > 0 ? (
                            sala.galeria.map(img => (<img key={img.id} src={getImageUrl(img.imagen)} onError={handleImageError} alt="Galeria" className="w-full h-48 object-cover rounded-2xl" />))
                        ) : (
                            <div className="w-full h-full bg-slate-200 flex items-center justify-center rounded-2xl font-bold text-slate-400">Sin Galería</div>
                        )}
                    </div>
                </div>
                <div className="p-8">
                    <h1 className="text-4xl font-black text-slate-800 mb-2">{sala.nombre}</h1>
                    <p className="text-indigo-600 font-bold tracking-wider uppercase mb-4">{sala.tematica || 'Sin Temática'}</p>
                    <p className="text-slate-600 text-lg leading-relaxed">{sala.descripcion}</p>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                        <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200"><span className="text-slate-500 font-medium">Capacidad total:</span> <span className="font-bold text-slate-800">{sala.capacidad_total} personas</span></div>
                        <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200"><span className="text-slate-500 font-medium">Mesas configuradas:</span> <span className="font-bold text-slate-800">{mesas.length}</span></div>
                    </div>
                </div>
            </div>

            {/* MENSAJES */}
            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 font-semibold border border-red-200 flex items-center gap-3">
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {error}
                </div>
            )}
            {exito && (
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-6 font-semibold border border-emerald-200 flex items-center gap-3">
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {exito}
                </div>
            )}

            {!puedeReservar && (
                <div className="bg-amber-50 text-amber-700 p-4 rounded-xl mb-6 font-semibold border border-amber-200">
                    ⚠️ Esta sala está deshabilitada por el administrador y no acepta reservas en este momento.
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* COLUMNA IZQUIERDA - PASOS */}
                <div className="lg:col-span-1 space-y-6">
                    {/* PASO 1: FECHA */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-sm font-black">1</span>
                            Elige la fecha
                        </h3>
                        <div className="grid grid-cols-4 gap-2">
                            {fechas.map((f, index) => (
                                <button
                                    key={index}
                                    onClick={() => setFecha(f.fechaISO)}
                                    className={`p-2 rounded-xl border text-center font-bold transition ${fecha === f.fechaISO ? 'bg-yellow-500 scale-105 text-black shadow-lg' : 'bg-gray-100 hover:bg-gray-200'}`}
                                >
                                    <div className="text-xs uppercase">{f.dia}</div>
                                    <div className="text-lg">{f.numero}</div>
                                    <div className="text-xs">{f.mes}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* PASO 2: HORARIO */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-sm font-black">2</span>
                            Elige el horario
                        </h3>
                        {loadingDisponibilidad ? (
                            <div className="flex items-center gap-2 text-slate-500 text-sm py-4">
                                <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                Cargando horarios...
                            </div>
                        ) : disponibilidad.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2">
                                {disponibilidad.map((bloque, idx) => {
                                    const mesasLibres = bloque.mesas?.filter(m => m.disponible)?.length || 0;
                                    const isSelected = horarioSeleccionado === bloque;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => { setHorarioSeleccionado(bloque); setMesaSeleccionada(null); setError(''); }}
                                            className={`p-2.5 text-sm rounded-lg border transition-all duration-150 ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : mesasLibres > 0 ? 'bg-white hover:bg-indigo-50 border-slate-200 text-slate-700 hover:border-indigo-300' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                                        >
                                            <div className="font-bold">{bloque.hora_inicio.substring(0,5)} - {bloque.hora_fin.substring(0,5)}</div>
                                            <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-indigo-200' : mesasLibres > 0 ? 'text-emerald-600' : 'text-red-400'}`}>
                                                {mesasLibres > 0 ? `${mesasLibres} mesa${mesasLibres > 1 ? 's' : ''} libre${mesasLibres > 1 ? 's' : ''}` : 'Sin mesas libres'}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-slate-400 text-sm py-4 text-center">Selecciona una fecha para ver horarios disponibles.</p>
                        )}
                    </div>
                    
                    {/* PASO 3: CONFIRMAR */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-sm font-black">3</span>
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

                        {/* Pedidos */}
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <label className="flex items-center gap-2 cursor-pointer mb-4">
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 text-indigo-600 rounded"
                                    checked={deseaPedido}
                                    onChange={(e) => setDeseaPedido(e.target.checked)}
                                />
                                <span className="font-bold text-slate-700">¿Desea agregar un pedido?</span>
                            </label>

                            {deseaPedido && (
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4">
                                    <h4 className="font-bold text-sm mb-2 text-indigo-700">Catálogo de Productos</h4>
                                    {categorias.length === 0 && <p className="text-xs text-slate-500">No hay productos disponibles.</p>}
                                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                        {categorias.map((cat, idx) => (
                                            <div key={idx}>
                                                <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">{cat.nombre}</h5>
                                                <div className="space-y-2">
                                                    {cat.productos.map(prod => (
                                                        <div key={prod.id} className="flex justify-between items-center bg-white p-2 border rounded shadow-sm">
                                                            <div className="flex-1">
                                                                <p className="text-sm font-bold text-slate-700">{prod.nombre}</p>
                                                                <p className="text-xs text-slate-500">Bs {prod.precio}</p>
                                                            </div>
                                                            <button
                                                                onClick={() => agregarAlCarrito(prod, 1)}
                                                                className="ml-2 w-8 h-8 rounded-full flex items-center justify-center font-bold bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Carrito Resumen */}
                                    {carrito.length > 0 && (
                                        <div className="mt-4 border-t pt-2">
                                            <h5 className="font-bold text-sm mb-2">Tu Carrito:</h5>
                                            {carrito.map(item => (
                                                <div key={item.id} className="flex justify-between text-xs mb-1 items-center">
                                                    <span>{item.cantidad}x {item.nombre}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold">Bs {item.subtotal}</span>
                                                        <button onClick={() => eliminarDelCarrito(item.id)} className="text-red-500">❌</button>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="border-t pt-1 mt-1 text-right font-black text-indigo-700">
                                                Total Pedido: Bs {totalCarrito.toFixed(2)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        <button 
                            onClick={handleReservar}
                            disabled={!mesaSeleccionada || !horarioSeleccionado || !puedeReservar || reservando}
                            className={`w-full py-3.5 rounded-xl font-bold transition shadow-sm text-base flex items-center justify-center gap-2 ${!puedeReservar ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : mesaSeleccionada && horarioSeleccionado ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                        >
                            {reservando ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Procesando...</>) : !puedeReservar ? ('Sala deshabilitada') : !horarioSeleccionado ? ('Selecciona un horario') : !mesaSeleccionada ? ('Selecciona una mesa') : deseaPedido && carrito.length > 0 ? ('✓ Confirmar Reserva con Pedido') : ('✓ Confirmar Reserva')}
                        </button>
                    </div>
                </div>

                {/* COLUMNA DERECHA - PLANO DE MESAS */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full">
                        <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                            <span className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-sm font-black">4</span>
                            Selecciona tu mesa en el plano
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">Haz click sobre una mesa disponible (azul) para seleccionarla.</p>
                        
                        {!horarioSeleccionado ? (
                            <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
                                <svg className="w-10 h-10 mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span className="font-semibold">Selecciona una fecha y horario</span>
                                <span className="text-xs mt-1">para ver las mesas disponibles</span>
                            </div>
                        ) : mesasDisponiblesEnHorario === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 bg-red-50 rounded-xl border-2 border-dashed border-red-200 text-red-400">
                                <span className="text-3xl mb-2">😔</span>
                                <span className="font-semibold">No hay mesas disponibles</span>
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
            </div>
        </div>
    );
};

export default DetalleSala;
