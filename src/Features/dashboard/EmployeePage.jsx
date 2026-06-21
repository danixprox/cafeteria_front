import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { obtenerEmpleados, obtenerClientes } from '../../services/api';
import { finanzasService } from '../../services/finanzasService';
import GestionReservas from "../../pages/Admin/GestionReservas";
import EmployeeSidebar from "./EmployeeSidebar";
import PanelPedidosEmpleado from '../../pages/Empleado/PanelPedidosEmpleado';
import PedidosPage from '../../pages/Empleado/PedidosPage';

const EmployeePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [empleados, setEmpleados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [clientesOriginal, setClientesOriginal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vista, setVista] = useState("perfil");
  const [paginaClientes, setPaginaClientes] = useState(1);
  const [toast, setToast] = useState(null); // { tipo: 'exito'|'error', mensaje: string }

  const [usuario] = useState(() => {
    const u = localStorage.getItem('usuario');
    return u ? JSON.parse(u) : null;
  });

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    try {
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

  // Manejar retorno de Stripe (pago_success o pago_cancel)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pagoSuccess = params.get('pago_success');
    const pagoCancel = params.get('pago_cancel');
    const sessionId = params.get('session_id');
    const pedidoId = params.get('pedido_id');

    if (pagoSuccess && sessionId) {
      finanzasService.confirmarPagoStripe(sessionId)
        .then(() => {
          setToast({ tipo: 'exito', mensaje: '✓ Pago con Stripe confirmado correctamente. El pedido fue registrado.' });
        })
        .catch((err) => {
          const msg = err.response?.data?.error || 'Error al confirmar el pago de Stripe';
          setToast({ tipo: 'error', mensaje: msg });
        })
        .finally(() => {
          // Limpiar query params de la URL sin recargar
          navigate('/empleado', { replace: true });
          setTimeout(() => setToast(null), 5000);
        });
    } else if (pagoCancel) {
      setToast({ tipo: 'error', mensaje: `Pago cancelado. El pedido #${pedidoId || ''} fue revertido.` });
      navigate('/empleado', { replace: true });
      setTimeout(() => setToast(null), 5000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    setPaginaClientes(1);
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

  const itemsPorPagina = 5;
  const totalPaginas = Math.ceil(clientes.length / itemsPorPagina);
  const clientesPaginados = clientes.slice(
    (paginaClientes - 1) * itemsPorPagina,
    paginaClientes * itemsPorPagina
  );

  return (

  <div className="min-h-screen flex flex-col bg-slate-50 relative">

    {/* Toast de notificación de pago Stripe */}
    {toast && (
      <div className={`fixed top-6 right-6 z-[100] max-w-sm rounded-2xl px-5 py-4 shadow-xl text-sm font-semibold transition-all
        ${toast.tipo === 'exito'
          ? 'bg-emerald-600 text-white'
          : 'bg-red-600 text-white'
        }`}>
        {toast.mensaje}
      </div>
    )}

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
                    {usuario?.nombre}
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

                <div className="mt-6 grid gap-4 max-h-[380px] overflow-y-auto pr-2">

                  {clientes.length === 0 ? (

                    <p className="text-slate-500 text-center py-4 font-semibold">
                      No se encontraron clientes
                    </p>

                  ) : (

                    clientesPaginados.map((c) => (

                      <div
                        key={c.cod_cliente}
                        className="rounded-3xl border border-slate-200 bg-slate-50 p-5 hover:border-amber-200 transition"
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

                {totalPaginas > 1 && (
                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      disabled={paginaClientes === 1}
                      onClick={() => setPaginaClientes((prev) => Math.max(prev - 1, 1))}
                      className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <span className="text-xs text-slate-500 font-medium">
                      Página {paginaClientes} de {totalPaginas}
                    </span>
                    <button
                      type="button"
                      disabled={paginaClientes === totalPaginas}
                      onClick={() => setPaginaClientes((prev) => Math.min(prev + 1, totalPaginas))}
                      className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
                )}

              </section>

            </main>

            {/* PEDIDOS */}
            <PanelPedidosEmpleado />

          </>

        )}

        {/* GESTION RESERVAS */}
        {vista === "reservas" && (
          <GestionReservas />
        )}

        {/* PEDIDOS - vista completa desde sidebar */}
        {vista === "pedidos" && (
          <PedidosPage />
        )}

      </div>

    </div>

  </div>

);
};

export default EmployeePage;