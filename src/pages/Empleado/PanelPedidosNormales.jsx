import React, { useState, useEffect } from 'react';
import { salasService } from '../../services/salasService';
import { productosService } from '../../services/productosService';
import pedidosService from '../../services/pedidosService';
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

  const handleConfirmarPedido = async () => {
    const items = Object.values(carrito);
    if (items.length === 0) {
      mostrarError('Agrega al menos un producto antes de confirmar');
      return;
    }

    setConfirmando(true);
    setError('');

    try {
      const productosPayload = items.map(item => ({
        id: item.producto.id,
        cantidad: item.cantidad,
      }));

      await pedidosService.crearPorMesero(
        salaSeleccionada.id,
        mesaSeleccionada.id,
        productosPayload
      );

      setExito(`Pedido confirmado para ${mesaSeleccionada.nombre}`);
      setCarrito({});
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
      const msg = err.response?.data?.error || 'Error al confirmar el pedido';
      mostrarError(msg);
    } finally {
      setConfirmando(false);
    }
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
    </section>
  );
};

export default PanelPedidosNormales;
