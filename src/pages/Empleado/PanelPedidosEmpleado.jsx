import React, { useState, useEffect } from 'react';
import { salasService } from '../../services/salasService';
import { productosService } from '../../services/productosService';
import { finanzasService } from '../../services/finanzasService';
import { cuponesService } from '../../services/cuponesService';
import pedidosService from '../../services/pedidosService';
import SelectorSalas from './SelectorSalas';
import SelectorMesas from './SelectorMesas';
import CatalogoProductos from './CatalogoProductos';
import ResumenPedido from './ResumenPedido';
import NotaVentaModal from './NotaVentaModal';
import ClientePedidoSelector from '../../Components/ClientePedidoSelector';


const PanelPedidosEmpleado = () => {
  const [paso, setPaso] = useState('salas'); // 'salas' | 'mesas' | 'catalogo'
  const [salas, setSalas] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [salaSeleccionada, setSalaSeleccionada] = useState(null);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [carrito, setCarrito] = useState({}); // { productoId: { producto, cantidad } }
  const [pedidoActivo, setPedidoActivo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState(null);
  const [confirmarEfectivoModal, setConfirmarEfectivoModal] = useState(false);
  const [pagoInfo, setPagoInfo] = useState(null);
  const [notaVenta, setNotaVenta] = useState(null);
  const [procesandoAccionPago, setProcesandoAccionPago] = useState(false);
  const [clientePedido, setClientePedido] = useState({
    cliente_id: null,
    nombre_cliente: 'Cliente presencial',
  });

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

  const crearNotaVentaLocal = (pedido, metodoPago) => {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const productos = (pedido?.detalles || []).map(det => ({
      cantidad: det.cantidad,
      producto: det.producto_nombre,
      precio: parseFloat(det.precio_unitario).toFixed(2),
      total: parseFloat(det.subtotal).toFixed(2),
      observaciones: det.observaciones || '',
    }));
    const total = parseFloat(pedido?.total_pendiente || pedido?.total || 0);

    return {
      numeroComprobante: `NV-P${String(pedido?.id || 0).padStart(6, '0')}`,
      fechaHora: new Date().toLocaleString('es-BO'),
      mesero: usuario?.nombre || 'No registrado',
      mesa: mesaSeleccionada?.nombre || 'Sin mesa',
      sala: salaSeleccionada?.nombre || 'Sin sala',
      productos,
      subtotal: total.toFixed(2),
      total: total.toFixed(2),
      metodoPago,
    };
  };

  const actualizarCarritoDesdePedido = (pedido) => {
    setPedidoActivo(pedido);
    const nuevoCarrito = {};
    if (pedido && pedido.detalles && Array.isArray(pedido.detalles)) {
      pedido.detalles.forEach(det => {
        nuevoCarrito[det.producto] = {
          producto: {
            id: det.producto,
            nombre: det.producto_nombre,
            precio: parseFloat(det.precio_unitario),
            imagen: det.producto_imagen,
            stock: 9999
          },
          cantidad: det.cantidad,
          detalleId: det.id,
          confirmado: det.confirmado,
          observaciones: det.observaciones || ''
        };
      });
    }
    setCarrito(nuevoCarrito);
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

  // Paso 2 → 3: seleccionar mesa
  const handleSeleccionarMesa = async (mesa) => {
    setMesaSeleccionada(mesa);
    setCarrito({});
    setPedidoActivo(null);
    setClientePedido({ cliente_id: null, nombre_cliente: 'Cliente presencial' });
    setError('');

    if (mesa.estado === 'disponible') {
      setPaso('catalogo');
    } else {
      setCargando(true);
      try {
        const res = await finanzasService.getPedidoActivoMesa(mesa.id);
        actualizarCarritoDesdePedido(res.data);
        setPaso('catalogo');
      } catch (err) {
        if (err.response?.status === 404) {
          try {
            const initRes = await finanzasService.iniciarPedidoMesa(mesa.id);
            actualizarCarritoDesdePedido(initRes.data);
            setPaso('catalogo');
          } catch {
            mostrarError('Error al iniciar pedido en el backend');
          }
        } else {
          mostrarError('Error al cargar el pedido activo de la mesa');
        }
      } finally {
        setCargando(false);
      }
    }
  };

  const handleIniciarAtencion = async () => {
    if (!mesaSeleccionada) return;
    setCargando(true);
    setError('');
    try {
      const res = await finanzasService.iniciarPedidoMesa(mesaSeleccionada.id, clientePedido);
      actualizarCarritoDesdePedido(res.data);
      setMesaSeleccionada(prev => ({ ...prev, estado: 'ocupada' }));

      // Refrescar listado de mesas
      const mesasRes = await salasService.getMesas(salaSeleccionada.id);
      setMesas(Array.isArray(mesasRes.data) ? mesasRes.data : []);
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al iniciar la atención';
      mostrarError(msg);
    } finally {
      setCargando(false);
    }
  };

  // Agregar producto al carrito (persiste en backend)
  const handleAgregarAlCarrito = async (producto, cantidad, observaciones = '') => {
    if (!pedidoActivo) {
      mostrarError('Debe iniciar la atención de la mesa antes de agregar productos');
      return;
    }
    setError('');
    try {
      const res = await finanzasService.agregarDetalle(pedidoActivo.id, {
        producto_id: producto.id,
        cantidad: cantidad,
        observaciones,
      });
      actualizarCarritoDesdePedido(res.data);

      const prodRes = await productosService.getDisponibles();
      setProductos(Array.isArray(prodRes.data) ? prodRes.data : []);
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al agregar producto al pedido';
      mostrarError(msg);
    }
  };

  // Modificar cantidad de un ítem ya en el carrito (persiste en backend)
  const handleActualizarCantidad = async (productoId, nuevaCantidad) => {
    const item = carrito[productoId];
    if (!item || !pedidoActivo) return;

    if (nuevaCantidad <= 0) {
      await handleEliminarDelCarrito(productoId);
      return;
    }

    setError('');
    try {
      const res = await finanzasService.actualizarDetalle(pedidoActivo.id, item.detalleId, {
        cantidad: nuevaCantidad
      });
      actualizarCarritoDesdePedido(res.data);

      const prodRes = await productosService.getDisponibles();
      setProductos(Array.isArray(prodRes.data) ? prodRes.data : []);
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al actualizar la cantidad';
      mostrarError(msg);
    }
  };

  const handleActualizarObservaciones = async (productoId, observaciones) => {
    const item = carrito[productoId];
    if (!item || !pedidoActivo || item.confirmado) return;

    setError('');
    try {
      const res = await finanzasService.actualizarDetalle(pedidoActivo.id, item.detalleId, {
        observaciones: (observaciones || '').slice(0, 50)
      });
      actualizarCarritoDesdePedido(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al actualizar la personalización';
      mostrarError(msg);
    }
  };

  // Eliminar ítem del carrito (persiste en backend)
  const handleEliminarDelCarrito = async (productoId) => {
    const item = carrito[productoId];
    if (!item || !pedidoActivo) return;

    setError('');
    try {
      const res = await finanzasService.eliminarDetalle(pedidoActivo.id, item.detalleId);
      actualizarCarritoDesdePedido(res.data);

      const prodRes = await productosService.getDisponibles();
      setProductos(Array.isArray(prodRes.data) ? prodRes.data : []);
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al eliminar el producto';
      mostrarError(msg);
    }
  };

  // Confirma el pedido (solo guarda los productos pendientes)
  const handleConfirmarPedido = async () => {
    if (!pedidoActivo) return;
    setProcesandoAccionPago(true);
    setError('');
    try {
      const res = await finanzasService.confirmarPedido(pedidoActivo.id);
      actualizarCarritoDesdePedido(res.data);
      setExito('Pedido confirmado correctamente');
      setTimeout(() => setExito(''), 3000);

      // Refrescar listado de mesas
      const mesasRes = await salasService.getMesas(salaSeleccionada.id);
      setMesas(Array.isArray(mesasRes.data) ? mesasRes.data : []);
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al confirmar el pedido';
      mostrarError(msg);
    } finally {
      setProcesandoAccionPago(false);
    }
  };

  const handleAplicarPromocion = async (codigo) => {
    if (!pedidoActivo) return;
    setProcesandoAccionPago(true);
    setError('');
    try {
      const res = await pedidosService.aplicarPromocion(pedidoActivo.id, codigo);
      actualizarCarritoDesdePedido(res.data);
      setExito('Promoción aplicada correctamente');
      setTimeout(() => setExito(''), 3000);
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al aplicar la promoción';
      mostrarError(msg);
      throw err;
    } finally {
      setProcesandoAccionPago(false);
    }
  };

  const handleQuitarPromocion = async () => {
    if (!pedidoActivo) return;
    setProcesandoAccionPago(true);
    setError('');
    try {
      const res = await pedidosService.quitarPromocion(pedidoActivo.id);
      actualizarCarritoDesdePedido(res.data);
      setExito('Promoción quitada correctamente');
      setTimeout(() => setExito(''), 3000);
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al quitar la promoción';
      mostrarError(msg);
    } finally {
      setProcesandoAccionPago(false);
    }
  };

  const handleAplicarCupon = async (codigo) => {
    if (!pedidoActivo) return;
    setProcesandoAccionPago(true);
    setError('');
    try {
      await cuponesService.aplicar(pedidoActivo.id, codigo);
      const res = await finanzasService.getPedidoActivoMesa(mesaSeleccionada.id);
      actualizarCarritoDesdePedido(res.data);
      setExito('Cupón aplicado correctamente');
      setTimeout(() => setExito(''), 3000);
    } catch (err) {
      mostrarError(err.response?.data?.error || 'Error al aplicar el cupón');
      throw err;
    } finally {
      setProcesandoAccionPago(false);
    }
  };

  const handleQuitarCupon = async () => {
    if (!pedidoActivo) return;
    setProcesandoAccionPago(true);
    setError('');
    try {
      await cuponesService.quitar(pedidoActivo.id);
      const res = await finanzasService.getPedidoActivoMesa(mesaSeleccionada.id);
      actualizarCarritoDesdePedido(res.data);
      setExito('Cupón quitado correctamente');
      setTimeout(() => setExito(''), 3000);
    } catch (err) {
      mostrarError(err.response?.data?.error || 'Error al quitar el cupón');
    } finally {
      setProcesandoAccionPago(false);
    }
  };

  // Consulta resumen de pago y abre pasarela
  const handlePagarPedido = async () => {
    if (!pedidoActivo) return;
    setProcesandoAccionPago(true);
    setError('');
    try {
      const res = await finanzasService.getResumenPago(pedidoActivo.id);
      if (res.data.puede_pagar) {
        setMostrarModalPago(true);
        setMetodoPagoSeleccionado(null);
        setPagoInfo(null);
        setConfirmarEfectivoModal(false);
      } else {
        mostrarError(res.data.motivo_bloqueo_pago || 'No se puede realizar el pago en este momento');
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al obtener el resumen de pago';
      mostrarError(msg);
    } finally {
      setProcesandoAccionPago(false);
    }
  };

  // Pago con Stripe
  const handleElegirStripe = async () => {
    if (!pedidoActivo) return;
    setProcesandoAccionPago(true);
    setError('');
    try {
      const res = await finanzasService.iniciarPagoPedido({
        pedido_id: pedidoActivo.id,
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

  // Pago con QR
  const handleElegirQR = async () => {
    if (!pedidoActivo) return;
    setProcesandoAccionPago(true);
    setError('');
    try {
      const res = await finanzasService.iniciarPagoPedido({
        pedido_id: pedidoActivo.id,
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

  // Confirmar pago QR
  const handleConfirmarPagoQR = async () => {
    if (!pagoInfo?.pago_id) return;
    setProcesandoAccionPago(true);
    setError('');
    try {
      const res = await finanzasService.confirmarPagoQR(pagoInfo.pago_id);
      setNotaVenta(res.data?.nota_venta || crearNotaVentaLocal(pedidoActivo, 'QR'));
      setExito(`Pedido confirmado y pagado para ${mesaSeleccionada.nombre}`);
      setCarrito({});
      setPedidoActivo(null);
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

  // Pagar en efectivo
  const handleElegirEfectivo = () => {
    setMetodoPagoSeleccionado('efectivo');
    setConfirmarEfectivoModal(true);
  };

  // Confirmar pago en efectivo
  const handleConfirmarPagoEfectivo = async () => {
    if (!pedidoActivo) return;
    setProcesandoAccionPago(true);
    setError('');
    try {
      const res = await finanzasService.pagarEfectivo(pedidoActivo.id);
      const notaRes = await finanzasService.obtenerNotaVentaPedido(pedidoActivo.id, 'efectivo')
        .catch(() => null);
      setNotaVenta(notaRes?.data?.nota_venta || crearNotaVentaLocal(pedidoActivo, 'EFECTIVO'));
      setExito(res.data.message || 'Pago en efectivo registrado correctamente');
      setCarrito({});
      setPedidoActivo(null);
      setMostrarModalPago(false);
      setPagoInfo(null);
      setMetodoPagoSeleccionado(null);
      setConfirmarEfectivoModal(false);

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
      const msg = err.response?.data?.error || 'Error al registrar el pago en efectivo';
      mostrarError(msg);
    } finally {
      setProcesandoAccionPago(false);
    }
  };

  // Cancelar el modal sin destruir el pedido activo
  const handleCancelarPago = () => {
    setMostrarModalPago(false);
    setPagoInfo(null);
    setMetodoPagoSeleccionado(null);
    setConfirmarEfectivoModal(false);
  };

  const handleVolverAElegirMetodoPago = () => {
    setMetodoPagoSeleccionado(null);
    setPagoInfo(null);
    setConfirmarEfectivoModal(false);
  };

  const volverASalas = () => {
    setPaso('salas');
    setSalaSeleccionada(null);
    setMesaSeleccionada(null);
    setCarrito({});
    setPedidoActivo(null);
  };

  const volverAMesas = () => {
    setPaso('mesas');
    setMesaSeleccionada(null);
    setCarrito({});
    setPedidoActivo(null);
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
        mesaSeleccionada?.estado === 'disponible' ? (
          <div className="mx-auto grid max-w-4xl gap-5 lg:grid-cols-[1fr_0.9fr]">
            <ClientePedidoSelector
              value={clientePedido}
              onChange={setClientePedido}
              disabled={cargando}
            />
            <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600">🪑</div>
              <h3 className="mb-2 text-xl font-bold text-slate-800">Mesa libre: {mesaSeleccionada.nombre}</h3>
              <p className="mb-6 text-sm text-slate-500">Identifica al cliente e inicia la atención para registrar productos.</p>
              <button
                onClick={handleIniciarAtencion}
                disabled={cargando || (!clientePedido.cliente_id && !clientePedido.nombre_cliente.trim())}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                🚀 Iniciar atención / Ocupar mesa
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {console.log("ANTES DE CATALOGO:", combos)}
            <CatalogoProductos
              productos={productos}
              combos={combos}
              carrito={carrito}
              onAgregarAlCarrito={handleAgregarAlCarrito}
              prueba="HOLA123"
            />
            <ResumenPedido
              carrito={carrito}
              onActualizarCantidad={handleActualizarCantidad}
              onActualizarObservaciones={handleActualizarObservaciones}
              onEliminar={handleEliminarDelCarrito}
              onConfirmar={handleConfirmarPedido}
              confirmando={procesandoAccionPago}
              mesa={mesaSeleccionada}
              sala={salaSeleccionada}
              pedidoActivo={pedidoActivo}
              onPagar={handlePagarPedido}
              pagando={procesandoAccionPago}
              onAplicarPromocion={handleAplicarPromocion}
              onQuitarPromocion={handleQuitarPromocion}
              onAplicarCupon={handleAplicarCupon}
              onQuitarCupon={handleQuitarCupon}
            />
          </div>
        )
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
                  <span className="text-sm font-semibold text-slate-500">Monto Pendiente</span>
                  <span className="text-2xl font-black text-slate-900">
                    Bs. {pedidoActivo ? parseFloat(pedidoActivo.total_pendiente).toFixed(2) : '0.00'}
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
                    onClick={handleElegirEfectivo}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-amber-200 text-sm flex items-center justify-center gap-2"
                  >
                    💵 Pagar en efectivo
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

            {/* Vista de Pago en Efectivo */}
            {metodoPagoSeleccionado === 'efectivo' && confirmarEfectivoModal && (
              <div className="text-center">
                <p className="text-sm text-slate-500 mb-6">
                  ¿Confirma que recibió <strong className="text-slate-800">Bs. {pedidoActivo ? parseFloat(pedidoActivo.total_pendiente).toFixed(2) : '0.00'}</strong> en efectivo?
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    disabled={procesandoAccionPago}
                    onClick={handleConfirmarPagoEfectivo}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition text-sm"
                  >
                    {procesandoAccionPago ? 'Procesando...' : '✓ Sí, confirmar pago'}
                  </button>
                  <button
                    type="button"
                    disabled={procesandoAccionPago}
                    onClick={() => {
                      setMetodoPagoSeleccionado(null);
                      setConfirmarEfectivoModal(false);
                    }}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3.5 rounded-xl transition text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
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
                    onClick={handleVolverAElegirMetodoPago}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3.5 rounded-xl transition text-sm"
                  >
                    Volver a elegir método de pago
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {notaVenta && typeof window === 'undefined' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 text-center mb-2">
              Nota de Venta
            </h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              Pedido #{notaVenta.pedido?.id} · {notaVenta.fecha}
            </p>
            <div className="rounded-2xl bg-slate-50 p-4 mb-5 border border-slate-200/60 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="font-semibold text-slate-500">Mesa</span>
                <span className="font-bold text-slate-800">{notaVenta.mesa?.nombre}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-semibold text-slate-500">Sala</span>
                <span className="font-bold text-slate-800">{notaVenta.sala?.nombre}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-semibold text-slate-500">Método</span>
                <span className="font-bold text-slate-800">{notaVenta.metodoPago}</span>
              </div>
            </div>
            <div className="space-y-2 mb-5">
              {notaVenta.pedido?.detalles?.map(det => (
                <div key={det.id} className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-slate-700">
                    <strong>{det.cantidad}x</strong> {det.producto_nombre}
                  </span>
                  <span className="font-semibold text-slate-900">
                    Bs. {parseFloat(det.subtotal).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-4 mb-6">
              <span className="text-sm font-semibold text-slate-500">Total pagado</span>
              <span className="text-2xl font-black text-emerald-600">
                Bs. {parseFloat(notaVenta.pedido?.total_pendiente || notaVenta.pedido?.total || 0).toFixed(2)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setNotaVenta(null)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      <NotaVentaModal nota={notaVenta} onClose={() => setNotaVenta(null)} />
    </section>
  );
};

export default PanelPedidosEmpleado;
