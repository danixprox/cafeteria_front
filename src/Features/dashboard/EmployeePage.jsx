import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerEmpleados, obtenerClientes } from '../../services/api';

const EmployeePage = () => {
  const navigate = useNavigate();

  const [empleados, setEmpleados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
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
      } catch (err) {
        setError(err.message || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">❌ {error}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            Panel de Empleado
          </h1>
          <button
            onClick={handleLogout}
            className="bg-slate-900 text-white px-4 py-2 rounded"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">

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
                  <p className="font-semibold text-slate-900">
                    {e.usuario?.nombre}
                  </p>
                  <p className="text-sm text-slate-600">
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
        <section>
          <h2 className="text-xl font-semibold mb-4 text-slate-900">
            🧍 Clientes
          </h2>

          <div className="bg-white rounded shadow divide-y">
            {clientes.length === 0 ? (
              <p className="p-4 text-slate-500">No hay clientes</p>
            ) : (
              clientes.map(c => (
                <div key={c.cod_cliente} className="p-4">
                  <p className="font-semibold text-slate-900">
                    {c.usuario?.nombre}
                  </p>
                  <p className="text-sm text-slate-600">
                    Tel: {c.telefono}
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
    </div>
  );
};

export default EmployeePage;