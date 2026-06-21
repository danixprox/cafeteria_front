import React, { useState, useEffect } from 'react';
import { salasService } from '../../services/salasService';
import { productosService } from '../../services/productosService';
import { finanzasService } from '../../services/finanzasService';
import SelectorSalas from './SelectorSalas';
import SelectorMesas from './SelectorMesas';
import CatalogoProductos from './CatalogoProductos';
import ResumenPedido from './ResumenPedido';

const PanelPedidosEmpleado = () => {
  const [paso, setPaso] = useState('salas'); // 'salas' | 'mesas' | 'catalogo'
  const [salas, setSalas] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [salaSeleccionada, setSalaSeleccionada] = useState(null);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [carrito, setCarrito] = useState({}); // { productoId: { producto, cantidad } }
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState(null);
  const [pagoInfo, setPagoInfo] = useState(null);
  const [procesandoAccionPago, setProcesandoAccionPago] = useState(false);

  // Cargar salas y productos al montar
  useEffect(() => {
    salasService.getAll()
      .then(res => setSalas(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Error al cargar las salas'));

    productosService.getDisponibles()
      .then(res => setProductos(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Error al cargar los productos'));
  }, []);

  const mostrarError = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 4000);
  };

  // Paso 1 → 2: seleccionar sala y cargar sus mesas
  const handleSeleccionarSala = async (sala) => {
    setSalaSeleccionada(sala);
    setCargando(true);
    setError('');
    try {
      const res = await salasService.getMesas(sala.id);
      setMesas(Array.isArray(res.data) ? res.data : []);
      setPaso('mesas');
    } catch {
      mostrarError('Error al cargar las mesas de la sala');
    } finally {
      setCargando(false);
    }
  };

  // Paso 2 → 3: seleccionar mesa y abrir catálogo
  const handleSeleccionarMesa = (mesa) => {
    setMesaSeleccionada(mesa);
    setCarrito({});
    setPaso('catalogo');
  };

  // Agregar producto al carrito (acumula si ya existe)
  const handleAgregarAlCarrito = (producto, cantidad) => {
    const cantidadActual = carrito[producto.id]?.cantidad || 0;
    const nuevaCantidad = cantidadActual + cantidad;

    if (nuevaCantidad > producto.stock) {
      mostrarError(
        `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock - cantidadActual}`
      );
      return;
    }

    setCarrito(prev => ({
      ...prev,
      [producto.id]: { producto, cantidad: nuevaCantidad },
    }));
  };

  // Modificar cantidad de un ítem ya en el carrito
  const handleActualizarCantidad = (productoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      handleEliminarDelCarrito(productoId);
      return;
    }
    const producto = carrito[productoId]?.producto;
    if (!producto) return;

    if (nuevaCantidad > producto.stock) {
      mostrarError(`Stock máximo para "${producto.nombre}": ${producto.stock}`);
      return;
    }

    setCarrito(prev => ({
      ...prev,
      [productoId]: { ...prev[productoId], cantidad: nuevaCantidad },
    }));
  };

  // Eliminar ítem del carrito
  const handleEliminarDelCarrito = (productoId) => {
    setCarrito(prev => {
      const copia = { ...prev };
      delete copia[productoId];
      return copia;
    });
  };

  // Abre el modal de pasarela de pago
  const handleConfirmarPedido = () => {
    const items = Object.values(carrito);
    if (items.length === 0) {
      mostrarError('Agrega al menos un producto antes de confirmar');
      return;
    }
    setMostrarModalPago(true);
    setMetodoPagoSeleccionado(null);
    setPagoInfo(null);
    setError('');
  };

  // Pago con Stripe: crea el pedido en el backend y redirige
  const handleElegirStripe = async () => {
    const items = Object.values(carrito);
    const productosPayload = items.map(item => ({
      id: item.producto.id,
      cantidad: item.cantidad,
    }));

    setProcesandoAccionPago(true);
    setError('');
    try {
      const res = await finanzasService.iniciarPagoPedido({
        sala_id: salaSeleccionada.id,
        mesa_id: mesaSeleccionada.id,
        productos: productosPayload,
        metodo_pago: 'stripe',
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        throw new Error('No se recibió la URL de Stripe.');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Error al iniciar pago con Stripe';
      mostrarError(msg);
      setMostrarModalPago(false);
    } finally {
      setProcesandoAccionPago(false);
    }
  };

  // Pago con QR: crea el pedido y devuelve la imagen QR
  const handleElegirQR = async () => {
    const items = Object.values(carrito);
    const productosPayload = items.map(item => ({
      id: item.producto.id,
      cantidad: item.cantidad,
    }));

    setProcesandoAccionPago(true);
    setError('');
    try {
      const res = await finanzasService.iniciarPagoPedido({
        sala_id: salaSeleccionada.id,
        mesa_id: mesaSeleccionada.id,
        productos: productosPayload,
        metodo_pago: 'qr',
      });
      setPagoInfo(res.data);
      setMetodoPagoSeleccionado('qr');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Error al iniciar pago con QR';
      mostrarError(msg);
      setMostrarModalPago(false);
    } finally {
      setProcesandoAccionPago(false);
    }
  };

  // Confirmar pago QR luego de que el cliente escaneó
  const handleConfirmarPagoQR = async () => {
    if (!pagoInfo?.pago_id) return;
    setProcesandoAccionPago(true);
    setError('');
    try {
      await finanzasService.confirmarPagoQR(pagoInfo.pago_id);
      setExito(`Pedido confirmado y pagado para ${mesaSeleccionada.nombre}`);
      setCarrito({});
      setMostrarModalPago(false);
      setPagoInfo(null);
      setMetodoPagoSeleccionado(null);

      const [mesasRes, prodRes] = await Promise.all([
        salasService.getMesas(salaSeleccionada.id),
        productosService.getDisponibles(),
      ]);
      setMesas(Array.isArray(mesasRes.data) ? mesasRes.data : []);
      setProductos(Array.isArray(prodRes.data) ? prodRes.data : []);

      setTimeout(() => {
        setExito('');
        setPaso('mesas');
        setMesaSeleccionada(null);
      }, 2500);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Error al confirmar pago con QR';
      mostrarError(msg);
    } finally {
      setProcesandoAccionPago(false);
    }
  };

  // Cancelar el modal (y revertir el pedido si ya se creó)
  const handleCancelarPago = async () => {
    if (pagoInfo?.pedido_id) {
      setProcesandoAccionPago(true);
      try {
        await finanzasService.cancelarPagoPedido(pagoInfo.pedido_id);
      } catch (err) {
        console.error('Error al cancelar el pedido pendiente:', err);
      } finally {
        setProcesandoAccionPago(false);
      }
    }
    setMostrarModalPago(false);
    setPagoInfo(null);
    setMetodoPagoSeleccionado(null);
  };

  const volverASalas = () => {
    setPaso('salas');
    setSalaSeleccionada(null);
    setMesaSeleccionada(null);
    setCarrito({});
  };

  const volverAMesas = () => {
    setPaso('mesas');
    setMesaSeleccionada(null);
    setCarrito({});
  };

  return (
    <section className="rounded-[2rem] bg-white p-8 shadow-lg ring-1 ring-slate-200">
      {/* Cabecera del panel */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">Pedidos</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            {paso === 'salas' && 'Selecciona una sala'}
            {paso === 'mesas' && `Sala: ${salaSeleccionada?.nombre}`}
            {paso === 'catalogo' &&
              `${mesaSeleccionada?.nombre} — ${salaSeleccionada?.nombre}`}
          </h2>
        </div>

        {/* Breadcrumb / botones de vuelta */}
        {(paso === 'mesas' || paso === 'catalogo') && (
          <div className="flex gap-2">
            {paso === 'catalogo' && (
              <button
                onClick={volverAMesas}
                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                ← Cambiar mesa
              </button>
            )}
            <button
              onClick={volverASalas}
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              ← Cambiar sala
            </button>
          </div>
        )}
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {exito && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          ✓ {exito}
        </div>
      )}

      {/* Contenido por paso */}
      {cargando && (
        <p className="py-10 text-center text-slate-400">Cargando...</p>
      )}

      {!cargando && paso === 'salas' && (
        <SelectorSalas salas={salas} onSeleccionar={handleSeleccionarSala} />
      )}

      {!cargando && paso === 'mesas' && (
        <SelectorMesas
          mesas={mesas}
          sala={salaSeleccionada}
          onSeleccionar={handleSeleccionarMesa}
        />
      )}

      {!cargando && paso === 'catalogo' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <CatalogoProductos
            productos={productos}
            carrito={carrito}
            onAgregarAlCarrito={handleAgregarAlCarrito}
          />
          <ResumenPedido
            carrito={carrito}
            onActualizarCantidad={handleActualizarCantidad}
            onEliminar={handleEliminarDelCarrito}
            onConfirmar={handleConfirmarPedido}
            confirmando={procesandoAccionPago}
            mesa={mesaSeleccionada}
            sala={salaSeleccionada}
          />
        </div>
      )}

      {/* ── Modal de Pasarela de Pago ── */}
      {mostrarModalPago && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in duration-200">
            <h3 className="text-xl font-black text-slate-900 text-center mb-2">
              Pasarela de Pago
            </h3>

            {/* Selección de método */}
            {!metodoPagoSeleccionado && (
              <>
                <p className="text-sm text-slate-500 text-center mb-6">
                  Mesa: <strong>{mesaSeleccionada?.nombre}</strong> · Sala: <strong>{salaSeleccionada?.nombre}</strong>
                </p>
                <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-200/60 flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-500">Total del Pedido</span>
                  <span className="text-2xl font-black text-slate-900">
                    Bs. {Object.values(carrito).reduce((sum, item) => sum + parseFloat(item.producto.precio) * item.cantidad, 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    disabled={procesandoAccionPago}
                    onClick={handleElegirStripe}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-indigo-200 text-sm flex items-center justify-center gap-2"
                  >
                    {procesandoAccionPago ? 'Redirigiendo...' : '💳 Pagar con Stripe'}
                  </button>
                  <button
                    type="button"
                    disabled={procesandoAccionPago}
                    onClick={handleElegirQR}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-emerald-200 text-sm flex items-center justify-center gap-2"
                  >
                    {procesandoAccionPago ? 'Generando QR...' : '📱 Pagar con QR'}
                  </button>
                  <button
                    type="button"
                    disabled={procesandoAccionPago}
                    onClick={handleCancelarPago}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3.5 rounded-xl transition text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}

            {/* Vista del QR para que el cliente escanee */}
            {metodoPagoSeleccionado === 'qr' && pagoInfo && (
              <div className="text-center">
                <p className="text-sm text-slate-500 mb-4">
                  Muestra el código QR al cliente para realizar el pago de:
                </p>
                <p className="text-2xl font-black text-emerald-600 mb-6">
                  Bs. {parseFloat(pagoInfo.total).toFixed(2)}
                </p>
                <div className="mx-auto w-64 h-64 bg-slate-100 border border-slate-200 rounded-3xl p-3 flex items-center justify-center shadow-inner mb-6">
                  <img src={pagoInfo.qr_url} alt="Código QR de Pago" className="w-full h-full object-contain rounded-2xl" />
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    disabled={procesandoAccionPago}
                    onClick={handleConfirmarPagoQR}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition text-sm"
                  >
                    {procesandoAccionPago ? 'Procesando...' : '✓ Confirmar Pago Recibido'}
                  </button>
                  <button
                    type="button"
                    disabled={procesandoAccionPago}
                    onClick={handleCancelarPago}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3.5 rounded-xl transition text-sm"
                  >
                    Cancelar y revertir stock
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default PanelPedidosEmpleado;
