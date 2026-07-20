import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  obtenerEmpleados,
  obtenerClientes,
  obtenerBitacora,
  actualizarEmpleado,
  eliminarEmpleado,
  actualizarCliente,
  eliminarCliente
} from "../../services/api";
import { validarContrasena, obtenerRequisitos } from "../../utils/validation";

import GestionSalas from "../../pages/Admin/GestionSalas";
import GestionMesas from "../../pages/Admin/GestionMesas";
import GestionReservas from "../../pages/Admin/GestionReservas";
import AdminSidebar from "./AdminSidebar";

import "../../App.css";

import GestionNotificaciones from '../../pages/Admin/GestionNotificaciones';
import AdminCategorias from '../../pages/Admin/AdminCategorias';
import AdminProductos from '../../pages/Admin/AdminProductos';
import AdminHistorialPedidos from '../../pages/Admin/HistorialPedidos';
import CierreCaja from '../../pages/Admin/CierreCaja';
import GestionPromociones from '../../pages/Admin/GestionPromociones';
import GestionOpiniones from '../../pages/Admin/GestionOpiniones';
import GenerarReporte from '../../pages/Admin/GenerarReporte';
const AdminPage = () => {
  const navigate = useNavigate();

  const [empleados, setEmpleados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [bitacora, setBitacora] = useState([]);
  const [soloImportantes, setSoloImportantes] = useState(false);
  const [activeUserTab, setActiveUserTab] = useState('empleados');
  const [busquedaUsuario, setBusquedaUsuario] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [mostrarFormEmpleado, setMostrarFormEmpleado] = useState(false);
  const [empleadoEditando, setEmpleadoEditando] = useState(null);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [mostrarContrasenaEmpleado, setMostrarContrasenaEmpleado] = useState(false);
  const [empleadoForm, setEmpleadoForm] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    cargo: 'mesero',
    estado: 'activo',
    contrasena: '',
  });
  const [clienteForm, setClienteForm] = useState({
    nombre: '',
    correo: '',
    telefono: '',
  });

  const accionesImportantes = new Set([
    'login',
    'logout',
    'crear empleado',
    'editar cliente',
    'eliminar reserva',
  ]);

  const [vista, setVista] = useState('usuarios');
  const [loading, setLoading] = useState(false);
  const [salaIdParaMesas, setSalaIdParaMesas] = useState(null);

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return fecha;
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const dedupBitacora = (entries = []) => {
    if (!Array.isArray(entries)) return [];
    const seen = new Set();
    return entries.filter((item) => {
      const usuario = item.usuario && typeof item.usuario === 'object'
        ? item.usuario.nombre
        : item.usuario;
      const key = `${usuario || ''}|${item.accion || ''}|${item.detalle || ''}|${item.fecha || ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const ordenarBitacora = (entries = []) => {
    return [...entries].sort((a, b) => {
      const fechaA = new Date(a.fecha).getTime();
      const fechaB = new Date(b.fecha).getTime();
      return fechaB - fechaA;
    });
  };

  const normalizarAccion = (accion) => {
    if (!accion) return "";
    return accion.toString().toLowerCase().trim();
  };

  const esAccionImportante = (accion) => {
    const texto = normalizarAccion(accion);
    if (!texto) return false;
    if (texto.includes('login')) return true;
    if (texto.includes('logout')) return true;
    if (texto.includes('crear') && texto.includes('empleado')) return true;
    if (texto.includes('editar') && texto.includes('cliente')) return true;
    if (texto.includes('eliminar') && texto.includes('reserva')) return true;
    return accionesImportantes.has(texto);
  };

  const filtrarAccionesImportantes = (entries = []) => {
    return entries.filter((item) => esAccionImportante(item.accion));
  };

  const dedupEventos = (entries = []) => {
    const seen = new Set();
    return entries.filter((item) => {
      const usuario = item.usuario && typeof item.usuario === 'object'
        ? item.usuario.nombre
        : item.usuario;
      const accion = normalizarAccion(item.accion);
      const detalle = (item.detalle || '').toString().trim();
      const key = `${usuario || ''}|${accion}|${detalle}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  // 🔄 Cargar datos según vista
  const cargarDatos = async () => {
    setLoading(true);
    try {
      if (vista === 'usuarios') {
        const [empleadosData, clientesData] = await Promise.all([
          obtenerEmpleados(),
          obtenerClientes(),
        ]);

        setEmpleados(Array.isArray(empleadosData) ? empleadosData : empleadosData.results ?? []);
        setClientes(Array.isArray(clientesData) ? clientesData : clientesData.results ?? []);
      } else if (vista === 'bitacora') {
        const data = await obtenerBitacora();
        const limpia = ordenarBitacora(dedupBitacora(data));
        setBitacora(limpia);
      }
    } catch (error) {
      console.error(error);
      alert('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current === false && import.meta.env.DEV) {
      effectRan.current = true;
      return;
    }

    cargarDatos();
    // eslint-disable-next-line
  }, [vista]);

  const resetEmpleadoForm = () => {
    setEmpleadoForm({
      nombre: '',
      correo: '',
      telefono: '',
      cargo: 'mesero',
      estado: 'activo',
      contrasena: '',
    });
    setEmpleadoEditando(null);
  };

  const resetClienteForm = () => {
    setClienteForm({
      nombre: '',
      correo: '',
      telefono: '',
    });
    setClienteEditando(null);
  };

  const handleEliminarEmpleado = async (id) => {
    if (!window.confirm('¿Eliminar empleado?')) return;

    try {
      await eliminarEmpleado(id);
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert('Error al eliminar empleado');
    }
  };

  const handleEliminarCliente = async (id) => {
    if (!window.confirm('¿Eliminar cliente?')) return;

    try {
      await eliminarCliente(id);
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert('Error al eliminar cliente');
    }
  };

  const handleLogout = async () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    try {
      const token = localStorage.getItem('token');
      await fetch(`${apiUrl}/api/logout/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error logout:', error);
    }

    localStorage.clear();
    navigate('/login');
  };

  const handleEditarEmpleado = (empleado) => {
    setEmpleadoEditando(empleado);
    setEmpleadoForm({
      nombre: empleado.usuario?.nombre || empleado.nombre || '',
      correo: empleado.usuario?.correo || empleado.correo || '',
      telefono: empleado.usuario?.telefono || empleado.telefono || '',
      cargo: empleado.cargo || 'mesero',
      estado: empleado.estado || 'activo',
      contrasena: '',
    });
    setMostrarFormEmpleado(true);
    setClienteEditando(null);
  };

  const handleEditarCliente = (cliente) => {
    setClienteEditando(cliente);
    setClienteForm({
      nombre: cliente.usuario?.nombre || cliente.nombre || '',
      correo: cliente.usuario?.correo || cliente.correo || '',
      telefono: cliente.usuario?.telefono || cliente.telefono || '',
    });
    setEmpleadoEditando(null);
    setMostrarFormEmpleado(false);
  };

  const handleGuardarEmpleado = async () => {
    const { nombre, correo, telefono, cargo, estado, contrasena } = empleadoForm;
    if (!nombre || !correo) {
      alert('Completa los campos requeridos');
      return;
    }

    try {
      const payload = {
        nombre,
        correo,
        cargo,
      };
      if (empleadoEditando) {
        payload.telefono = telefono;
        payload.estado = estado;
      } else {
        payload.estado = 'activo';
      }

      if (empleadoEditando) {
        await actualizarEmpleado(empleadoEditando.cod_empleado || empleadoEditando.id, payload);
        alert('Empleado actualizado correctamente');
      } else {
        if (!contrasena) {
          alert('La contraseña es obligatoria');
          return;
        }

        const validacion = validarContrasena(contrasena);
        if (!validacion.valido) {
          alert('La contraseña debe cumplir los requisitos de seguridad: 8+ caracteres, mayúscula, minúscula, número y carácter especial.');
          return;
        }

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        payload.contrasena = contrasena;
        await fetch(`${apiUrl}/api/empleados/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(payload),
        });

        alert('Empleado creado correctamente');
      }

      resetEmpleadoForm();
      setMostrarFormEmpleado(false);
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert('Error guardando empleado');
    }
  };

  const handleGuardarCliente = async () => {
    if (!clienteEditando) return;
    const { nombre, correo, telefono } = clienteForm;
    if (!nombre || !correo || !telefono) {
      alert('Completa los campos requeridos');
      return;
    }

    try {
      await actualizarCliente(clienteEditando.cod_cliente || clienteEditando.id, {
        nombre,
        correo,
        telefono,
      });
      alert('Cliente actualizado correctamente');
      resetClienteForm();
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert('Error guardando cliente');
    }
  };

  const getNombreUsuario = (item) => item.usuario?.nombre || item.nombre || '';
  const getCorreoUsuario = (item) => item.usuario?.correo || item.correo || '';
  const requisitosEmpleado = obtenerRequisitos(empleadoForm.contrasena);

  const empleadosFiltrados = empleados.filter((empleado) => {
    const nombre = getNombreUsuario(empleado).toLowerCase();
    const correo = getCorreoUsuario(empleado).toLowerCase();
    const rol = String(empleado.cargo || '').toLowerCase();
    const busqueda = busquedaUsuario.toLowerCase();
    const matchesSearch = nombre.includes(busqueda) || correo.includes(busqueda);
    const matchesRol = filtroRol === 'todos' || rol === filtroRol;
    return matchesSearch && matchesRol;
  });

  const clientesFiltrados = clientes.filter((cliente) => {
    const nombre = getNombreUsuario(cliente).toLowerCase();
    const correo = getCorreoUsuario(cliente).toLowerCase();
    const busqueda = busquedaUsuario.toLowerCase();
    return nombre.includes(busqueda) || correo.includes(busqueda);
  });

  let bitacoraMostrar = soloImportantes
    ? filtrarAccionesImportantes(bitacora)
    : bitacora;
  bitacoraMostrar = dedupEventos(bitacoraMostrar);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative">
      {/* HEADER / DROPDOWN MENU */}
      <AdminSidebar 
        vista={vista} 
        setVista={setVista} 
handleLogout={handleLogout} 
      />

      {/* CONTENIDO */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-slate-900 mb-6 capitalize">
          {vista}
        </h1>

        {loading && <p className="text-slate-500">Cargando...</p>}

        {/* 👤 USUARIOS */}
        {vista === 'usuarios' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm p-4 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
              <div className="flex gap-2 rounded-full bg-slate-100 p-2">
                {['empleados', 'clientes'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveUserTab(tab);
                      setBusquedaUsuario('');
                      if (tab === 'empleados') setFiltroRol('todos');
                      setClienteEditando(null);
                      resetEmpleadoForm();
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition ${activeUserTab === tab ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-amber-100'}`}
                  >
                    {tab === 'empleados' ? 'Empleados' : 'Clientes'}
                  </button>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <input
                  value={busquedaUsuario}
                  onChange={(e) => setBusquedaUsuario(e.target.value)}
                  placeholder="Buscar por nombre o correo"
                  className="w-full sm:w-[320px] border border-slate-200 rounded-full px-4 py-2 text-sm shadow-sm"
                />
                {activeUserTab === 'empleados' && (
                  <select
                    value={filtroRol}
                    onChange={(e) => setFiltroRol(e.target.value)}
                    className="border border-slate-200 rounded-full px-4 py-2 text-sm shadow-sm"
                  >
                    <option value="todos">Todos los roles</option>
                    <option value="mesero">Mesero</option>
                    <option value="cocinero">Cocinero</option>
                  </select>
                )}
              </div>
            </div>

            {activeUserTab === 'empleados' && (
              <div className="bg-white rounded-3xl shadow-sm p-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">Empleados</p>
                    <p className="text-sm text-slate-500">Meseros y cocineros del sistema.</p>
                  </div>
                  <button
                    onClick={() => {
                      setMostrarFormEmpleado((prev) => !prev);
                      resetEmpleadoForm();
                      setEmpleadoEditando(null);
                    }}
                    className="rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition"
                  >
                    Nuevo empleado
                  </button>
                </div>

                {mostrarFormEmpleado && (
                  <div className="border border-slate-200 rounded-3xl bg-slate-50 p-6">
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div>
                        <h2 className="text-xl font-semibold text-slate-900">{empleadoEditando ? 'Editar empleado' : 'Crear empleado'}</h2>
                        <p className="text-sm text-slate-500">Rellena los datos y guarda la cuenta del empleado.</p>
                      </div>
                      <button
                        onClick={() => {
                          setMostrarFormEmpleado(false);
                          resetEmpleadoForm();
                        }}
                        className="text-slate-500 hover:text-slate-900"
                      >
                        Cerrar
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        value={empleadoForm.nombre}
                        onChange={(e) => setEmpleadoForm({ ...empleadoForm, nombre: e.target.value })}
                        placeholder="Nombre completo"
                        className="border border-slate-200 rounded-2xl px-4 py-3"
                      />
                      <input
                        value={empleadoForm.correo}
                        onChange={(e) => setEmpleadoForm({ ...empleadoForm, correo: e.target.value })}
                        placeholder="Correo electrónico"
                        className="border border-slate-200 rounded-2xl px-4 py-3"
                      />
                      <select
                        value={empleadoForm.cargo}
                        onChange={(e) => setEmpleadoForm({ ...empleadoForm, cargo: e.target.value })}
                        className="border border-slate-200 rounded-2xl px-4 py-3"
                      >
                        <option value="mesero">Mesero</option>
                        <option value="cocinero">Cocinero</option>
                      </select>
                      {!empleadoEditando && (
                        <div className="relative">
                          <input
                            type={mostrarContrasenaEmpleado ? "text" : "password"}
                            value={empleadoForm.contrasena}
                            onChange={(e) => setEmpleadoForm({ ...empleadoForm, contrasena: e.target.value })}
                            placeholder="Contraseña"
                            className="w-full border border-slate-200 rounded-2xl px-4 py-3 pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setMostrarContrasenaEmpleado((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                            aria-label={mostrarContrasenaEmpleado ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          >
                            {mostrarContrasenaEmpleado ? (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 1l22 22" />
                                <path d="M17.94 17.94A10.93 10.93 0 0 1 12 19.5c-5 0-9.27-3.11-11-7.5a10.94 10.94 0 0 1 4.46-5.71" />
                                <path d="M10.58 10.58a2 2 0 1 0 2.84 2.84" />
                                <path d="M14.12 14.12L19.36 19.36" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {empleadoForm.contrasena && !empleadoEditando && (
                      <div className="mt-4 p-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-700">
                        <p className="font-semibold mb-2">Requisitos de contraseña:</p>
                        <ul className="space-y-1">
                          <li className={requisitosEmpleado.longitud ? 'text-emerald-600' : 'text-red-600'}>
                            {requisitosEmpleado.longitud ? '✓' : '✗'} Mínimo 8 caracteres
                          </li>
                          <li className={requisitosEmpleado.mayuscula ? 'text-emerald-600' : 'text-red-600'}>
                            {requisitosEmpleado.mayuscula ? '✓' : '✗'} Una letra mayúscula
                          </li>
                          <li className={requisitosEmpleado.minuscula ? 'text-emerald-600' : 'text-red-600'}>
                            {requisitosEmpleado.minuscula ? '✓' : '✗'} Una letra minúscula
                          </li>
                          <li className={requisitosEmpleado.numero ? 'text-emerald-600' : 'text-red-600'}>
                            {requisitosEmpleado.numero ? '✓' : '✗'} Un número
                          </li>
                          <li className={requisitosEmpleado.especial ? 'text-emerald-600' : 'text-red-600'}>
                            {requisitosEmpleado.especial ? '✓' : '✗'} Un carácter especial
                          </li>
                        </ul>
                      </div>
                    )}

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        onClick={handleGuardarEmpleado}
                        className="rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-600 transition"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => {
                          resetEmpleadoForm();
                          setMostrarFormEmpleado(false);
                        }}
                        className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto rounded-3xl bg-white shadow-sm border border-slate-200">
                  <table className="min-w-full text-left">
                    <thead className="bg-slate-100 text-slate-700">
                      <tr>
                        <th className="px-6 py-4 text-sm font-semibold">Nombre completo</th>
                        <th className="px-6 py-4 text-sm font-semibold">Correo electrónico</th>
                        <th className="px-6 py-4 text-sm font-semibold">Rol</th>
                        <th className="px-6 py-4 text-sm font-semibold">Estado</th>
                        <th className="px-6 py-4 text-sm font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {empleadosFiltrados.length === 0 ? (
                        <tr>
                          <td className="px-6 py-5 border-t text-center text-slate-500" colSpan={5}>
                            No hay empleados para mostrar.
                          </td>
                        </tr>
                      ) : (
                        empleadosFiltrados.map((empleado) => {
                          const nombre = getNombreUsuario(empleado);
                          const correo = getCorreoUsuario(empleado);
                          const rol = empleado.cargo || 'mesero';
                          const estado = empleado.estado || 'activo';

                          return (
                            <tr key={empleado.cod_empleado || empleado.id} className="border-t hover:bg-slate-50">
                              <td className="px-6 py-4">{nombre}</td>
                              <td className="px-6 py-4">{correo}</td>
                              <td className="px-6 py-4">
                                <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                                  {rol.charAt(0).toUpperCase() + rol.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${estado === 'activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                                  {estado === 'activo' ? 'Activo' : 'Inactivo'}
                                </span>
                              </td>
                              <td className="px-6 py-4 space-x-2">
                                <button
                                  onClick={() => handleEditarEmpleado(empleado)}
                                  className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleEliminarEmpleado(empleado.cod_empleado || empleado.id)}
                                  className="rounded-full bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600 transition"
                                >
                                  Eliminar
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeUserTab === 'clientes' && (
              <div className="bg-white rounded-3xl shadow-sm p-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">Clientes</p>
                    <p className="text-sm text-slate-500">Los clientes se registran desde la interfaz pública.</p>
                  </div>
                  <p className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">Sin creación desde aquí</p>
                </div>

                <div className="overflow-x-auto rounded-3xl bg-white shadow-sm border border-slate-200">
                  <table className="min-w-full text-left">
                    <thead className="bg-slate-100 text-slate-700">
                      <tr>
                        <th className="px-6 py-4 text-sm font-semibold">Nombre completo</th>
                        <th className="px-6 py-4 text-sm font-semibold">Correo electrónico</th>
                        <th className="px-6 py-4 text-sm font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientesFiltrados.length === 0 ? (
                        <tr>
                          <td className="px-6 py-5 border-t text-center text-slate-500" colSpan={3}>
                            No hay clientes para mostrar.
                          </td>
                        </tr>
                      ) : (
                        clientesFiltrados.map((cliente) => (
                          <tr key={cliente.cod_cliente || cliente.id} className="border-t hover:bg-slate-50">
                            <td className="px-6 py-4">{getNombreUsuario(cliente)}</td>
                            <td className="px-6 py-4">{getCorreoUsuario(cliente)}</td>
                            <td className="px-6 py-4 space-x-2">
                              <button
                                onClick={() => handleEditarCliente(cliente)}
                                className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleEliminarCliente(cliente.cod_cliente || cliente.id)}
                                className="rounded-full bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600 transition"
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {clienteEditando && (
                  <div className="border border-slate-200 rounded-3xl bg-slate-50 p-6">
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div>
                        <h2 className="text-xl font-semibold text-slate-900">Editar cliente</h2>
                        <p className="text-sm text-slate-500">Corrige datos públicos del cliente.</p>
                      </div>
                      <button
                        onClick={resetClienteForm}
                        className="text-slate-500 hover:text-slate-900"
                      >
                        Cerrar
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        value={clienteForm.nombre}
                        onChange={(e) => setClienteForm({ ...clienteForm, nombre: e.target.value })}
                        placeholder="Nombre completo"
                        className="border border-slate-200 rounded-2xl px-4 py-3"
                      />
                      <input
                        value={clienteForm.correo}
                        onChange={(e) => setClienteForm({ ...clienteForm, correo: e.target.value })}
                        placeholder="Correo electrónico"
                        className="border border-slate-200 rounded-2xl px-4 py-3"
                      />
                      <input
                        value={clienteForm.telefono}
                        onChange={(e) => setClienteForm({ ...clienteForm, telefono: e.target.value })}
                        placeholder="Teléfono"
                        className="border border-slate-200 rounded-2xl px-4 py-3"
                      />
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        onClick={handleGuardarCliente}
                        className="rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-600 transition"
                      >
                        Guardar cambios
                      </button>
                      <button
                        onClick={resetClienteForm}
                        className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {vista === 'historial_pedidos' && (
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <AdminHistorialPedidos />
          </div>
        )}
         
        
 {/* 📜 BITÁCORA */}
{vista === "bitacora" && (
  <div className="rounded-[2rem] bg-slate-50 p-6 shadow-lg ring-1 ring-slate-200">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200">
      <div>
        <p className="text-lg font-semibold text-slate-900">Bitácora</p>
        <p className="text-sm text-slate-500">Solo acciones importantes</p>
      </div>
      <button
        onClick={() => setSoloImportantes((prev) => !prev)}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${soloImportantes ? 'bg-slate-900 text-white' : 'bg-amber-100 text-amber-900 hover:bg-amber-200'}`}
      >
        {soloImportantes ? 'Mostrar todo' : 'Mostrar solo importantes'}
      </button>
    </div>
    <div className="overflow-x-auto rounded-[1.5rem] bg-white shadow-sm ring-1 ring-slate-200 mt-6">
      <table className="min-w-full border-separate border-spacing-0">
        <thead className="bg-amber-100 text-slate-700">
          <tr>
            <th className="p-4 text-left text-sm font-semibold">Usuario</th>
            <th className="p-4 text-left text-sm font-semibold">Acción</th>
            <th className="p-4 text-left text-sm font-semibold">Detalle</th>
            <th className="p-4 text-left text-sm font-semibold">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {bitacoraMostrar.length === 0 ? (
            <tr className="text-center border-t">
              <td className="p-6" colSpan="4">
                No hay registros en la bitácora.
              </td>
            </tr>
          ) : (
            bitacoraMostrar.map((b, index) => {
              const usuario = b.usuario && typeof b.usuario === 'object'
                ? b.usuario.nombre
                : b.usuario;
              const fecha = formatearFecha(b.fecha);

              return (
                <tr
                  key={b.id ?? index}
                  className="text-left border-t hover:bg-slate-50"
                >
                  <td className="p-4 border-b border-slate-200">{usuario}</td>
                  <td className="p-4 border-b border-slate-200">{b.accion}</td>
                  <td className="p-4 border-b border-slate-200">{b.detalle}</td>
                  <td className="p-4 border-b border-slate-200">{fecha}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  </div>
)}

{vista === "salas" && (
  <GestionSalas 
    onVerMesas={(id) => {
      setSalaIdParaMesas(id);
      setVista("mesas");
    }} 
  />
)}

{vista === "mesas" && salaIdParaMesas && (
  <GestionMesas 
    idSala={salaIdParaMesas} 
    onVolver={() => setVista("salas")} 
  />
)}

{vista === "reservas" && (
  <GestionReservas />
)}


{vista === "notificaciones" && (
  <GestionNotificaciones />
)}

{vista === "opiniones" && (
  <GestionOpiniones />
)}

{vista === "reportes" && (
  <GenerarReporte />
)}

{vista === "cierre_caja" && (
  <CierreCaja />
)}

{vista === "categorias" && (
  <AdminCategorias />
)}

{vista === "productos" && (
  <AdminProductos />
)}

{vista === "promociones" && (
  <GestionPromociones />
)}

       </main>
    </div>
  );
};



export default AdminPage;
