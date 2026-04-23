import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  obtenerUsuarios,
  eliminarUsuario,
  obtenerEmpleados,
  obtenerClientes,
} from "../../services/api";

import "../../App.css";
import { obtenerBitacora } from "../../services/api";

const AdminPage = () => {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [bitacora, setBitacora] = useState([]);

  console.log("CLIENTES:", clientes);

  const [vista, setVista] = useState("usuarios");
  const [loading, setLoading] = useState(false);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevoEmpleado, setNuevoEmpleado] = useState({
  nombre: '',
  correo: '',
  contrasena: '',
  cargo: 'mesero'
 });

  // 🔄 Cargar datos según vista
  const cargarDatos = async () => {
    setLoading(true);
    try {
      if (vista === "usuarios") {
        const data = await obtenerUsuarios();
        setUsuarios(data);
      } else if (vista === "empleados") {
        const data = await obtenerEmpleados();
        setEmpleados(data);
      } else if (vista === "clientes") {
        const data = await obtenerClientes();
        setClientes(data); 
      } else if (vista === "bitacora") {
        const data = await obtenerBitacora();
        setBitacora(data);
      }
    } catch (error) {
      console.error(error);
      alert("Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line
  }, [vista]);

  // 🗑️ eliminar usuario
  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar usuario?")) return;

    try {
      await eliminarUsuario(id);
      cargarDatos();
    } catch {
      alert("Error al eliminar");
    }
  };

   // 🚪 logout
   const handleLogout = async () => {
  const token = localStorage.getItem("token");

  try {
    await fetch("http://127.0.0.1:8000/api/logout/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Error logout:", error);
  }

  localStorage.clear();
  navigate("/login");
};

  const handleCrearEmpleado = async () => {
  try {

    // 🔴 VALIDACIÓN
    if (!nuevoEmpleado.nombre || !nuevoEmpleado.correo || !nuevoEmpleado.contrasena) {
      alert("Completa todos los campos");
      return;
    }

    const password = nuevoEmpleado.contrasena;

    if (password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      alert("Debe tener una letra MAYÚSCULA");
      return;
    }

    if (!/[a-z]/.test(password)) {
      alert("Debe tener una letra minúscula");
      return;
    }

    if (!/[0-9]/.test(password)) {
      alert("Debe tener un número");
      return;
    }

    if (!/[!@#$%^&*]/.test(password)) {
      alert("Debe tener un carácter especial");
      return;
    }

    // 🔵 FETCH
    const token = localStorage.getItem("token");

   const res = await fetch('http://127.0.0.1:8000/api/empleados/', {
   method: 'POST',
   headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`   // 🔥 ESTA LÍNEA ES LA CLAVE
 },
   body: JSON.stringify(nuevoEmpleado)
});

    const data = await res.json();

    console.log("RESPUESTA BACKEND:", data);

    if (!res.ok) {
      alert(data.error || "Error al crear empleado");
      return;
    }

    alert("Empleado creado ✔");

    setMostrarForm(false);
    cargarDatos();

  } catch (error) {
    console.error(error);
    alert("Error de conexión");
  }
};

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 p-5 flex flex-col justify-between shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-8">
            Donde Juanita
          </h2>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setVista("usuarios")}
              className="text-left px-4 py-2 rounded-xl text-slate-700 hover:bg-amber-100 hover:text-amber-700 transition"
            >
              Usuarios
            </button>

            <button
              onClick={() => setVista("clientes")}
              className="text-left px-4 py-2 rounded-xl text-slate-700 hover:bg-amber-100 hover:text-amber-700 transition"
            >
              Clientes
            </button>

            <button
              onClick={() => setVista("empleados")}
              className="text-left px-4 py-2 rounded-xl text-slate-700 hover:bg-amber-100 hover:text-amber-700 transition"
            >
              Empleados
            </button>

            <button
              onClick={() => setVista("bitacora")}
              className="text-left px-4 py-2 rounded-xl text-slate-700 hover:bg-amber-100 hover:text-amber-700 transition"
            >
              Bitácora
            </button>

            <button
              onClick={() => setVista("inventario")}
              className="text-left px-4 py-2 rounded-xl text-slate-700 hover:bg-amber-100 hover:text-amber-700 transition"
            >
              Inventario
            </button>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="bg-amber-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-amber-700 transition"
        >
          Cerrar sesión
        </button>
      </aside>

      {/* CONTENIDO */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-semibold text-slate-900 mb-6 capitalize">
          {vista}
        </h1>

        {loading && <p className="text-slate-500">Cargando...</p>}

        {/* 👤 USUARIOS */}
        {vista === "usuarios" && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Correo</th>
                  <th className="p-3">Rol</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr
                    key={u.id_usuario}
                    className="text-center border-t hover:bg-slate-50"
                  >
                    <td className="p-2">{u.id_usuario}</td>
                    <td className="p-2">{u.nombre}</td>
                    <td className="p-2">{u.correo}</td>
                    <td className="p-2">{u.cod_rol}</td>
                    <td className="p-2">
                      <button
                        onClick={() => handleEliminar(u.id_usuario)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
         
        
       {/* 👨‍🍳 EMPLEADOS */}
{vista === "empleados" && (
  <>
    {/* BOTÓN */}
    <button
      onClick={() => setMostrarForm(!mostrarForm)}
      className="mb-4 bg-orange-500 text-white px-4 py-2 rounded-lg"
    >
      Registrar empleado
    </button>

    {/* FORMULARIO */}
    {mostrarForm && (
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-6 w-full max-w-4xl">

        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          Registrar empleado
        </h3>

        <div className="grid grid-cols-2 gap-4">

          <input
            placeholder="Nombre"
            className="border p-2 rounded text-black"
            value={nuevoEmpleado.nombre}
            onChange={(e)=>setNuevoEmpleado({...nuevoEmpleado, nombre:e.target.value})}
          />

          <input
            placeholder="Correo"
            className="border p-2 rounded text-black"
            value={nuevoEmpleado.correo}
            onChange={(e)=>setNuevoEmpleado({...nuevoEmpleado, correo:e.target.value})}
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="border p-2 rounded text-black"
            value={nuevoEmpleado.contrasena}
            onChange={(e)=>setNuevoEmpleado({...nuevoEmpleado, contrasena:e.target.value})}
          />

          <select
            className="border p-2 rounded text-black"
            value={nuevoEmpleado.cargo}
            onChange={(e)=>setNuevoEmpleado({...nuevoEmpleado, cargo:e.target.value})}
          >
            <option value="mesero">Mesero</option>
            <option value="cocinero">Cocinero</option>
          </select>

        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleCrearEmpleado}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Guardar
          </button>

          <button
            onClick={() => setMostrarForm(false)}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Cancelar
          </button>
        </div>

      </div>
    )}

    {/* TABLA */}
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="p-3">Código</th>
            <th className="p-3">Nombre</th>
            <th className="p-3">Cargo</th>
            <th className="p-3">Turno</th>
          </tr>
        </thead>

        <tbody>
          {empleados.map((e) => (
            <tr key={e.cod_empleado} className="text-center border-t">
              <td className="p-2">{e.cod_empleado}</td>
              <td className="p-2">{e.usuario?.nombre}</td>
              <td className="p-2">{e.cargo}</td>
              <td className="p-2">{e.turno}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
)}

{/* 🧑 CLIENTES */}
{vista === "clientes" && (
  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
    <table className="w-full">
      <thead className="bg-slate-100 text-slate-700">
        <tr>
          <th className="p-3">Código</th>
          <th className="p-3">Nombre</th>
          <th className="p-3">Teléfono</th>
          <th className="p-3">Dirección</th>
        </tr>
      </thead>
      <tbody>
        {clientes.map((c) => (
          <tr
            key={c.cod_cliente}
            className="text-center border-t hover:bg-slate-50"
          >
               <td>{c.usuario?.nombre}</td>
               <td>{c.usuario?.correo}</td>
               <td>{c.telefono}</td>
               <td>{c.direccion}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
 {/* 📜 BITÁCORA */}
{vista === "bitacora" && (
  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
    <table className="w-full">
      <thead className="bg-slate-100 text-slate-700">
        <tr>
          <th className="p-3">Usuario</th>
          <th className="p-3">Acción</th>
          <th className="p-3">Detalle</th>
          <th className="p-3">Fecha</th>
        </tr>
      </thead>
      <tbody>
        {bitacora.map((b) => (
          <tr key={`${b.usuario}-${b.fecha}`} className="text-center border-t">
            <td className="p-2">{b.usuario}</td>
            <td className="p-2">{b.accion}</td>
            <td className="p-2">{b.detalle}</td>
            <td className="p-2">{b.fecha}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

       </main>
    </div>
  );
};
export default AdminPage;