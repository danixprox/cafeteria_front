import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerEmpleados, obtenerClientes } from '../../services/api';

const EmployeePage = () => {
  const navigate = useNavigate();

  const [empleados, setEmpleados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [clientesOriginal, setClientesOriginal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 🔥 mejor forma (evita warnings)
  const [usuario] = useState(() => {
    const u = localStorage.getItem("usuario");
    return u ? JSON.parse(u) : null;
  });

  // 🔥 LOGOUT CON BITÁCORA
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

  useEffect(() => {
    const cargar = async () => {
      try {
        const [emp, cli] = await Promise.all([
          obtenerEmpleados(),
          obtenerClientes()
        ]);

        setEmpleados(emp || []);
        setClientes(cli || []);
        setClientesOriginal(cli || []);
      } catch (err) {
        setError(err.message || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  const buscarCliente = (texto) => {
    const t = texto.toLowerCase();

    if (!t) {
      setClientes(clientesOriginal);
      return;
    }

    const filtrados = clientesOriginal.filter(c =>
      c.usuario?.nombre.toLowerCase().includes(t)
    );

    setClientes(filtrados);
  };

  if (loading) return <div className="p-6">Cargando...</div>;
  if (error) return <div className="p-6 text-red-500">❌ {error}</div>;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Panel de Empleado
            </h1>
            <p className="text-sm text-slate-600">
              {usuario?.nombre} ({usuario?.cod_rol?.cod_rol || usuario?.rol})
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-slate-900 text-white px-4 py-2 rounded"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">

        {/* BOTÓN ACTUALIZAR */}
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Actualizar
        </button>

        {/* EMPLEADOS */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-slate-900">
            👨‍🍳 Empleados
          </h2>

          <div className="bg-white rounded shadow divide-y">
            {empleados.length === 0 ? (
              <p className="p-4 text-slate-500">No hay empleados</p>
            ) : (
              empleados.map(e => (
                <div key={e.cod_empleado} className="p-4">
                  <p className="font-semibold">{e.usuario?.nombre}</p>
                  <p className="text-sm">Cargo: {e.cargo}</p>
                  <p className="text-sm">Turno: {e.turno}</p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* CLIENTES */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-slate-900">
            🧍 Clientes
          </h2>

          <input
            placeholder="Buscar cliente..."
            className="border p-2 rounded mb-4 w-full"
            onChange={(e) => buscarCliente(e.target.value)}
          />

          <div className="bg-white rounded shadow divide-y">
            {clientes.length === 0 ? (
              <p className="p-4 text-slate-500">No hay clientes</p>
            ) : (
              clientes.map(c => (
                <div key={c.cod_cliente} className="p-4">
                  <p className="font-semibold">{c.usuario?.nombre}</p>
                  <p className="text-sm">Tel: {c.telefono}</p>
                  <p className="text-sm">Dirección: {c.direccion}</p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 🔥 INVENTARIO SIMULADO */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-slate-900">
            📦 Inventario
          </h2>

          <div className="bg-white rounded shadow divide-y">
            {[
              { nombre: "Café", stock: 25 },
              { nombre: "Leche", stock: 10 },
              { nombre: "Pan", stock: 5 },
              { nombre: "Azúcar", stock: 0 }
            ].map((item, index) => {

              let estado = "Disponible";
              let color = "text-green-600";

              if (item.stock <= 5 && item.stock > 0) {
                estado = "Bajo";
                color = "text-yellow-600";
              }

              if (item.stock === 0) {
                estado = "Agotado";
                color = "text-red-600";
              }

              return (
                <div key={index} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{item.nombre}</p>
                    <p className="text-sm text-slate-600">
                      Stock: {item.stock}
                    </p>
                  </div>

                  <span className={`text-sm font-semibold ${color}`}>
                    {estado}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

      </main>
    </div>
  );
};

export default EmployeePage;