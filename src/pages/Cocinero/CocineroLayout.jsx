import { Outlet, useNavigate } from 'react-router-dom';
import CocineroSidebar from './CocineroSidebar';

const CocineroLayout = () => {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      localStorage.removeItem('id_usuario');
      localStorage.removeItem('nombre_usuario');
      localStorage.removeItem('rol_usuario');
    } catch (e) {
      console.error('Error limpiando localStorage', e);
    }
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:max-w-7xl">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-600">Panel del Cocinero</p>
            <h1 className="mt-3 text-3xl font-black text-slate-900">Gestión de comandas</h1>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <div className="rounded-3xl bg-slate-50 px-4 py-3 text-slate-700 shadow-sm">
              <p className="font-semibold">{usuario?.nombre || 'Cocinero'}</p>
              <p className="text-sm text-slate-500">{usuario?.correo || '—'}</p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid gap-6 px-4 py-8 lg:max-w-7xl lg:grid-cols-[280px_1fr]">
        <CocineroSidebar />
        <main className="space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CocineroLayout;
