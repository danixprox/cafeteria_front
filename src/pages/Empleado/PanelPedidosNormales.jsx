import React, { useState, useEffect } from 'react';
import { salasService } from '../../services/salasService';
import { productosService } from '../../services/productosService';
import pedidosService from '../../services/pedidosService';
import { finanzasService } from '../../services/finanzasService';
import SelectorSalas from './SelectorSalas';
import SelectorMesas from './SelectorMesas';
import CatalogoProductos from './CatalogoProductos';
import ResumenPedido from './ResumenPedido';

const PanelPedidosNormales = ({ onPedidoCreado }) => {
  const [paso, setPaso] = useState('salas');
  const [salas, setSalas] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [salaSeleccionada, setSalaSeleccionada] = useState(null);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [carrito, setCarrito] = useState({});
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [confirmando, setConfirmando] = useState(false);
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState(null);
  const [pagoInfo, setPagoInfo] = useState(null);
  const [procesandoAccionPago, setProcesandoAccionPago] = useState(false);

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

  const handleSeleccionarMesa = (mesa) => {
    setMesaSeleccionada(mesa);
    setCarrito({});
    setPaso('catalogo');
  };

  const handleAgregarAlCarrito = (producto, cantidad) => {
    const cantidadActual = carrito[producto.id]?.cantidad || 0;
    const nuevaCantidad = cantidadActual + cantidad;
    const stockBase = producto.stock_disponible ?? producto.stock;

    if (nuevaCantidad > stockBase) {
      mostrarError(
        `Stock disponible insuficiente para "${producto.nombre}". Disponible: ${stockBase - cantidadActual}`
      );
      return;
    }

    setCarrito(prev => ({
      ...prev,
      [producto.id]: { producto, cantidad: nuevaCantidad },
    }));
  };

  const handleActualizarCantidad = (productoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      handleEliminarDelCarrito(productoId);
      return;
    }
    const producto = carrito[productoId]?.producto;
    if (!producto) return;

    const stockBase = producto.stock_disponible ?? producto.stock;
    if (nuevaCantidad > stockBase) {
      mostrarError(`Stock máximo para "${producto.nombre}": ${stockBase}`);
      return;
    }

    setCarrito(prev => ({
      ...prev,
      [productoId]: { ...prev[productoId], cantidad: nuevaCantidad },
    }));
  };

  const handleEliminarDelCarrito = (productoId) => {
    setCarrito(prev => {
      const copia = { ...prev };
      delete copia[productoId];
      return copia;
    });
  };

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
        throw new Error("No se recibió la URL de Stripe.");
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Error al iniciar pago con Stripe';
      mostrarError(msg);
      setMostrarModalPago(false);
    } finally {
      setProcesandoAccionPago(false);
    }
  };

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
      onPedidoCreado?.();

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

  const handleCancelarPago = async () => {
    if (pagoInfo?.pedido_id) {
      setProcesandoAccionPago(true);
      try {
        await finanzasService.cancelarPagoPedido(pagoInfo.pedido_id);
      } catch (err) {
        console.error("Error al cancelar el pedido pendiente:", err);
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">Pedido directo</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            {paso === 'salas' && 'Selecciona una sala'}
            {paso === 'mesas' && `Sala: ${salaSeleccionada?.nombre}`}
            {paso === 'catalogo' && `${mesaSeleccionada?.nombre} — ${salaSeleccionada?.nombre}`}
          </h2>
        </div>

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

      {cargando && <p className="py-10 text-center text-slate-400">Cargando...</p>}

      {!cargando && paso === 'salas' && (
        <SelectorSalas salas={salas} onSeleccionar={handleSeleccionarSala} />
      )}

      {!cargando && paso === 'mesas' && (
        <SelectorMesas mesas={mesas} sala={salaSeleccionada} onSeleccionar={handleSeleccionarMesa} />
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
            confirmando={confirmando}
            mesa={mesaSeleccionada}
            sala={salaSeleccionada}
          />
        </div>
      )}
      {/* ── Modal de Pasarela de Pago para Empleado ── */}
      {mostrarModalPago && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in duration-200">
            <h3 className="text-xl font-black text-slate-900 text-center mb-2">
              Pasarela de Pago
            </h3>
            
            {/* Si no se ha seleccionado método de pago */}
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
                    💳 Pagar con Stripe
                  </button>
                  <button
                    type="button"
                    disabled={procesandoAccionPago}
                    onClick={handleElegirQR}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-emerald-200 text-sm flex items-center justify-center gap-2"
                  >
                    📱 Pagar con QR
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

            {/* Si se eligió QR */}
            {metodoPagoSeleccionado === 'qr' && pagoInfo && (
              <div className="text-center">
                <p className="text-sm text-slate-500 mb-4">
                  Muestra el código QR al cliente para realizar el pago de:
                </p>
                <p className="text-2xl font-black text-emerald-600 mb-6">
                  Bs. {pagoInfo.total.toFixed(2)}
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
                    {procesandoAccionPago ? 'Procesando...' : '✓ Confirmar Pago'}
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

export default PanelPedidosNormales;
