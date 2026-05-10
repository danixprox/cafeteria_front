import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerEmpleados, obtenerClientes } from '../../services/api';
import GestionReservas from "../../pages/Admin/GestionReservas";
import EmployeeSidebar from "./EmployeeSidebar";

const EmployeePage = () => {
  const navigate = useNavigate();
  const [empleados, setEmpleados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [clientesOriginal, setClientesOriginal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vista, setVista] = useState("perfil");

  const [usuario] = useState(() => {
    const u = localStorage.getItem('usuario');
    return u ? JSON.parse(u) : null;
  });

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch('http://127.0.0.1:8000/api/logout/', {
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

  useEffect(() => {
    const cargar = async () => {
      try {
        const [emp, cli] = await Promise.all([obtenerEmpleados(), obtenerClientes()]);
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
    const filtrados = clientesOriginal.filter((c) =>
      c.usuario?.nombre.toLowerCase().includes(t)
    );
    setClientes(filtrados);
  };

  if (loading) return <div className="p-6">Cargando...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (

  <div className="min-h-screen flex flex-col bg-slate-50 relative">

    <EmployeeSidebar
      vista={vista}
      setVista={setVista}
      handleLogout={handleLogout}
    />

    <div className="bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-50 via-slate-50 to-slate-200 px-4 py-10 flex-1">

      <div className="mx-auto max-w-6xl space-y-8">

        {/* PERFIL */}
        {vista === "perfil" && (

          <>

            <header className="rounded-[2rem] bg-white p-8 shadow-2xl ring-1 ring-slate-200">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-xs uppercase tracking-[0.35em] text-amber-700">
                    Empleado
                  </p>

                  <h1 className="mt-2 text-4xl font-black text-slate-900">
                    Panel de Empleado
                  </h1>

                  <p className="mt-2 text-slate-600">
                    {usuario?.nombre} — {usuario?.cod_rol?.cod_rol || usuario?.rol}
                  </p>

                </div>

              </div>

            </header>

            <main className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">

              {/* EMPLEADOS */}
              <section className="rounded-[2rem] bg-white p-8 shadow-lg ring-1 ring-slate-200">

                <div className="flex items-center justify-between gap-4">

                  <div>

                    <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
                      Empleados
                    </p>

                    <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                      Equipo activo
                    </h2>

                  </div>

                  <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800">
                    {empleados.length} registros
                  </span>

                </div>

                <div className="mt-6 grid gap-4">

                  {empleados.length === 0 ? (

                    <p className="text-slate-500">
                      No hay empleados
                    </p>

                  ) : (

                    empleados.map((e) => (

                      <div
                        key={e.cod_empleado}
                        className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                      >

                        <p className="text-lg font-semibold text-slate-900">
                          {e.usuario?.nombre}
                        </p>

                        <p className="mt-2 text-sm text-slate-600">
                          Cargo: {e.cargo}
                        </p>

                        <p className="text-sm text-slate-600">
                          Turno: {e.turno}
                        </p>

                      </div>

                    ))

                  )}

                </div>

              </section>

              {/* CLIENTES */}
              <section className="rounded-[2rem] bg-white p-8 shadow-lg ring-1 ring-slate-200">

                <div className="flex items-center justify-between gap-4">

                  <div>

                    <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
                      Clientes
                    </p>

                    <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                      Búsqueda rápida
                    </h2>

                  </div>

                  <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
                    {clientes.length} encontrados
                  </span>

                </div>

                <input
                  placeholder="Buscar cliente..."
                  className="mt-6 w-full rounded-[1.5rem] border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  onChange={(e) => buscarCliente(e.target.value)}
                />

                <div className="mt-6 grid gap-4">

                  {clientes.length === 0 ? (

                    <p className="text-slate-500">
                      No hay clientes
                    </p>

                  ) : (

                    clientes.map((c) => (

                      <div
                        key={c.cod_cliente}
                        className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                      >

                        <p className="text-lg font-semibold text-slate-900">
                          {c.usuario?.nombre}
                        </p>

                        <p className="mt-2 text-sm text-slate-600">
                          Teléfono: {c.telefono}
                        </p>

                        <p className="text-sm text-slate-600">
                          Dirección: {c.direccion}
                        </p>

                      </div>

                    ))

                  )}

                </div>

              </section>

            </main>

            {/* INVENTARIO */}
            <section className="rounded-[2rem] bg-white p-8 shadow-lg ring-1 ring-slate-200">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
                    Inventario
                  </p>

                  <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                    Control rápido
                  </h2>

                </div>

                <p className="text-sm text-slate-500">
                  Observa el stock de productos clave.
                </p>

              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                {[
                  { nombre: 'Café', stock: 25 },
                  { nombre: 'Leche', stock: 10 },
                  { nombre: 'Pan', stock: 5 },
                  { nombre: 'Azúcar', stock: 0 },
                ].map((item, index) => {

                  let estado = 'Disponible';
                  let color = 'text-emerald-600';

                  if (item.stock <= 5 && item.stock > 0) {
                    estado = 'Bajo';
                    color = 'text-amber-600';
                  }

                  if (item.stock === 0) {
                    estado = 'Agotado';
                    color = 'text-red-600';
                  }

                  return (

                    <div
                      key={index}
                      className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                    >

                      <p className="font-semibold text-slate-900">
                        {item.nombre}
                      </p>

                      <p className="mt-2 text-sm text-slate-600">
                        Stock: {item.stock}
                      </p>

                      <p className={`mt-3 text-sm font-semibold ${color}`}>
                        {estado}
                      </p>

                    </div>

                  );

                })}

              </div>

            </section>

          </>

        )}

        {/* GESTION RESERVAS */}
        {vista === "reservas" && (
          <GestionReservas />
        )}

      </div>

    </div>

  </div>

);
};

export default EmployeePage;