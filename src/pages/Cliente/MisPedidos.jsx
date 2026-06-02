import React, { useEffect, useMemo, useState } from 'react';
import { Edit3, Minus, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react';
import { editarPedidoActual, obtenerPedidosActuales } from '../../services/historialPedidosService';
import { productosService } from '../../services/productosService';

const estadoConfig = {
  pendiente: ['Pendiente', 'bg-slate-100 text-slate-700'],
  confirmado: ['Confirmado', 'bg-amber-100 text-amber-700'],
  en_preparacion: ['En preparacion', 'bg-indigo-100 text-indigo-700'],
  lista: ['Listo para recoger', 'bg-emerald-100 text-emerald-700'],
};

const Badge = ({ estado }) => {
  const [label, cls] = estadoConfig[estado] || [estado, 'bg-slate-100 text-slate-700'];
  return <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${cls}`}>{label}</span>;
};

const estadoTexto = {
  pendiente: 'Tu pedido fue registrado y esta esperando confirmacion.',
  confirmado: 'Tu pedido fue recibido. Aun puedes editarlo si no paso el limite.',
  en_preparacion: 'Cocina ya esta preparando tu pedido. La edicion esta cerrada.',
  lista: 'Tu pedido esta listo.',
};

const toNumber = (value) => Number.parseFloat(value || 0);

const MisPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(null);
  const [carrito, setCarrito] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = async (silencioso = false) => {
    if (!silencioso) setCargando(true);
    try {
      const [pedidosRes, productosRes] = await Promise.all([
        obtenerPedidosActuales(),
        productosService.getDisponibles(),
      ]);
      setPedidos(Array.isArray(pedidosRes.results) ? pedidosRes.results : []);
      setProductos(Array.isArray(productosRes.data) ? productosRes.data : []);
      setError('');
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar tus pedidos actuales.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    const timer = setInterval(() => cargar(true), 15000);
    return () => clearInterval(timer);
  }, []);

  const abrirEdicion = (pedido) => {
    const inicial = {};
    pedido.detalle.forEach((item) => {
      inicial[item.producto_id] = {
        id: item.producto_id,
        nombre: item.producto,
        categoria: item.producto_categoria,
        precio: toNumber(item.precio_unitario),
        cantidad: item.cantidad,
        stockDisponible: item.stock_disponible,
      };
    });
    setEditando(pedido);
    setCarrito(inicial);
    setMensaje('');
    setError('');
  };

  const catalogo = useMemo(() => {
    const actuales = new Set(Object.keys(carrito).map(Number));
    return productos.filter((p) => !actuales.has(p.id));
  }, [productos, carrito]);

  const cambiarCantidad = (productoId, delta) => {
    setCarrito((prev) => {
      const item = prev[productoId];
      if (!item) return prev;
      const nueva = item.cantidad + delta;
      if (nueva <= 0) {
        const copia = { ...prev };
        delete copia[productoId];
        return copia;
      }
      if (nueva > item.stockDisponible) {
        setError(`Stock insuficiente para ${item.nombre}. Disponible: ${item.stockDisponible}.`);
        return prev;
      }
      return { ...prev, [productoId]: { ...item, cantidad: nueva } };
    });
  };

  const agregarProducto = (producto) => {
    const disponible = producto.stock_disponible ?? producto.stock;
    if (disponible <= 0) {
      setError(`No hay stock disponible para ${producto.nombre}.`);
      return;
    }
    setCarrito((prev) => ({
      ...prev,
      [producto.id]: {
        id: producto.id,
        nombre: producto.nombre,
        categoria: producto.categoria_nombre,
        precio: toNumber(producto.precio),
        cantidad: 1,
        stockDisponible: disponible,
      },
    }));
  };

  const guardarCambios = async () => {
    const items = Object.values(carrito);
    if (!items.length) {
      setError('El pedido debe tener al menos un producto.');
      return;
    }

    setGuardando(true);
    setError('');
    try {
      await editarPedidoActual(editando.id, items.map((item) => ({ id: item.id, cantidad: item.cantidad })));
      setMensaje('Pedido actualizado correctamente.');
      setEditando(null);
      setCarrito({});
      await cargar(true);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo editar el pedido.');
    } finally {
      setGuardando(false);
    }
  };

  const totalEdicion = Object.values(carrito).reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  return (
    <div className="space-y-5 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Mis Pedidos</h2>
          <p className="text-sm text-slate-500">Pedidos activos de hoy y seguimiento en tiempo real.</p>
        </div>
        <button onClick={() => cargar()} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          <RefreshCw size={16} /> Actualizar
        </button>
      </div>

      {mensaje && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{mensaje}</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {cargando ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">Cargando tus pedidos...</div>
      ) : pedidos.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
          <p className="font-semibold text-slate-800">No tienes pedidos activos.</p>
          <p className="mt-1 text-sm text-slate-500">Cuando tengas un pedido pendiente, confirmado o en preparacion aparecera aqui.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pedidos.map((pedido) => (
            <section key={pedido.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">{pedido.numero_pedido}</p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">{pedido.ubicacion || 'Pedido actual'}</h3>
                  <p className="mt-1 text-sm text-slate-500">{estadoTexto[pedido.estado] || 'Seguimiento del pedido.'}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge estado={pedido.estado} />
                  {pedido.editable ? (
                    <button onClick={() => abrirEdicion(pedido)} className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white">
                      <Edit3 size={16} /> Editar
                    </button>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">{pedido.edicion_bloqueada_motivo}</span>
                  )}
                </div>
              </div>

              <div className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-100">
                {pedido.detalle.map((item) => (
                  <div key={item.producto_id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="font-semibold text-slate-900">{item.producto}</p>
                      <p className="text-sm text-slate-500">{item.cantidad} x Bs. {toNumber(item.precio_unitario).toFixed(2)}</p>
                    </div>
                    <p className="font-bold text-slate-900">Bs. {toNumber(item.subtotal).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-right text-lg font-black text-slate-900">Total: Bs. {toNumber(pedido.total).toFixed(2)}</div>
            </section>
          ))}
        </div>
      )}

      {editando && (
        <div className="fixed inset-0 z-40 bg-slate-950/30 p-4">
          <div className="mx-auto mt-10 max-h-[85vh] max-w-4xl overflow-auto rounded-3xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Editando {editando.numero_pedido}</p>
                <h3 className="text-xl font-bold text-slate-900">Productos del pedido</h3>
              </div>
              <button onClick={() => setEditando(null)} className="rounded-full bg-slate-100 p-2"><X size={18} /></button>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
              <div>
                <h4 className="mb-2 font-semibold text-slate-900">Pedido actual</h4>
                <div className="space-y-2">
                  {Object.values(carrito).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{item.nombre}</p>
                          <p className="text-sm text-slate-500">Bs. {item.precio.toFixed(2)} c/u</p>
                          <p className="text-xs text-slate-400">Disponible para este pedido: {item.stockDisponible}</p>
                        </div>
                        <button onClick={() => cambiarCantidad(item.id, -item.cantidad)} className="rounded-full bg-red-50 p-2 text-red-600"><Trash2 size={16} /></button>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <button onClick={() => cambiarCantidad(item.id, -1)} className="rounded-full bg-slate-100 p-2"><Minus size={16} /></button>
                        <span className="w-10 text-center font-semibold">{item.cantidad}</span>
                        <button onClick={() => cambiarCantidad(item.id, 1)} className="rounded-full bg-slate-100 p-2"><Plus size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-slate-900">Agregar productos</h4>
                <div className="max-h-80 space-y-2 overflow-auto pr-1">
                  {catalogo.map((producto) => (
                    <button key={producto.id} onClick={() => agregarProducto(producto)} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 p-3 text-left hover:bg-slate-50">
                      <div>
                        <p className="font-semibold text-slate-900">{producto.nombre}</p>
                        <p className="text-sm text-slate-500">Bs. {toNumber(producto.precio).toFixed(2)} - Stock {producto.stock_disponible ?? producto.stock}</p>
                      </div>
                      <Plus size={18} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xl font-black text-slate-900">Total: Bs. {totalEdicion.toFixed(2)}</p>
              <button disabled={guardando} onClick={guardarCambios} className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 font-semibold text-white disabled:opacity-60">
                <Save size={18} /> {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisPedidos;
