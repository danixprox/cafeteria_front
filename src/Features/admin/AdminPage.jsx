import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  obtenerUsuarios,
  eliminarUsuario,
  obtenerEmpleados,
  obtenerClientes
} from '../../services/api';

import '../../App.css';

const AdminPage = () => {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vista, setVista] = useState('usuarios');
  const [loading, setLoading] = useState(false);

  // 🔄 Cargar datos según vista
  const cargarDatos = async () => {
    setLoading(true);
    try {
      if (vista === 'usuarios') {
        const data = await obtenerUsuarios();
        setUsuarios(data);
      }
      if (vista === 'empleados') {
        const data = await obtenerEmpleados();
        setEmpleados(data);
      }
      if (vista === 'clientes') {
        const data = await obtenerClientes();
        setClientes(data);
      }
    } catch (error) {
      console.error(error);
      alert('Error cargando datos');
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarDatos();
  }, [vista]);

  // 🗑️ eliminar usuario
  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar usuario?')) return;

    try {
      await eliminarUsuario(id);
      cargarDatos();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  // 🚪 logout
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="bg-white border-b p-4 flex justify-between">
        <h1 className="text-2xl font-bold">Panel Administrador</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
          Cerrar sesión
        </button>
      </header>

      {/* NAV */}
      <div className="p-4 flex gap-3">
        <button onClick={() => setVista('usuarios')} className="bg-black text-white px-3 py-2 rounded">
          Usuarios
        </button>
        <button onClick={() => setVista('empleados')} className="bg-black text-white px-3 py-2 rounded">
          Empleados
        </button>
        <button onClick={() => setVista('clientes')} className="bg-black text-white px-3 py-2 rounded">
          Clientes
        </button>
      </div>

      {/* CONTENIDO */}
      <div className="p-4">

        {loading && <p>Cargando...</p>}

        {/* 👤 USUARIOS */}
        {vista === 'usuarios' && (
          <table className="w-full bg-white border">
            <thead>
              <tr className="bg-gray-200">
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id_usuario} className="text-center border-t">
                  <td>{u.id_usuario}</td>
                  <td>{u.nombre}</td>
                  <td>{u.correo}</td>
                  <td>{u.cod_rol}</td>
                  <td>
                    <button
                      onClick={() => handleEliminar(u.id_usuario)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* 👨‍🍳 EMPLEADOS */}
        {vista === 'empleados' && (
          <table className="w-full bg-white border">
            <thead>
              <tr className="bg-gray-200">
                <th>Código</th>
                <th>Nombre</th>
                <th>Cargo</th>
                <th>Turno</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map(e => (
                <tr key={e.cod_empleado} className="text-center border-t">
                  <td>{e.cod_empleado}</td>
                  <td>{e.usuario.nombre}</td>
                  <td>{e.cargo}</td>
                  <td>{e.turno}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* 🧑 CLIENTES */}
        {vista === 'clientes' && (
          <table className="w-full bg-white border">
            <thead>
              <tr className="bg-gray-200">
                <th>Código</th>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Dirección</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map(c => (
                <tr key={c.cod_cliente} className="text-center border-t">
                  <td>{c.cod_cliente}</td>
                  <td>{c.usuario.nombre}</td>
                  <td>{c.telefono}</td>
                  <td>{c.direccion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>
    </div>
  );
};

export default AdminPage;