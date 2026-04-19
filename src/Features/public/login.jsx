import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../services/api';
import { validarLogin } from '../../utils/validation';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validar campos
    const validacion = validarLogin(email, password);
    if (!validacion.valido) {
      setError(validacion.errores[0]);
      return;
    }

    setLoading(true);

    try {
      // Llamar al servicio de API
      const datos = await login(email, password);
      
      // Guardar en localStorage
      localStorage.setItem('usuario', JSON.stringify(datos));
      localStorage.setItem('id_usuario', datos.id_usuario);
      localStorage.setItem('nombre_usuario', datos.nombre);
      localStorage.setItem('rol_usuario', datos.rol);

      setSuccess(`¡Bienvenido ${datos.nombre}!`);
      
      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen from-amber-100 via-slate-50 to-amber-200 px-4 py-10">
      <div className="mx-auto max-w-5xl overflow-hidden bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Sección Izquierda - Desktop */}
          <section className="hidden bg-slate-900 p-10 text-white lg:block">
            <div className="flex h-full flex-col justify-between">
              <div>
                <span className="inline-flex rounded-full bg-amber-200/15 px-3 py-1 text-xs uppercase tracking-[0.32em] text-amber-200">
                  Cafetería Pro
                </span>
                <h2 className="mt-8 text-4xl font-semibold leading-tight">
                  Bienvenido de vuelta
                </h2>
                <p className="mt-5 max-w-sm text-slate-300">
                  Inicia sesión para acceder al panel de administración y gestionar tu cafetería.
                </p>
              </div>

              <div className="space-y-5">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <p className="text-sm uppercase tracking-[0.28em] text-amber-200">Credenciales Demo</p>
                  <p className="mt-4 text-sm text-white">
                    <strong>Email:</strong> admin@cafeteria.com
                  </p>
                  <p className="mt-2 text-sm text-white">
                    <strong>Contraseña:</strong> Admin@123
                  </p>
                </div>

                <Link
                  to="/"
                  className="inline-flex w-full items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  ← Volver al inicio
                </Link>
              </div>
            </div>
          </section>

          {/* Sección Derecha - Formulario */}
          <section className="p-8 sm:p-10">
            <Link
              to="/"
              className="mb-6 inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 lg:hidden"
            >
              ← Volver
            </Link>

            <div className="mb-8">
              <p className="text-sm uppercase tracking-[0.32em] text-amber-600">Cafetería Pro</p>
              <h1 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">Iniciar sesión</h1>
              <p className="mt-3 text-slate-600">
                Accede con tu correo y contraseña para continuar.
              </p>
            </div>

            {/* Alertas */}
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-700">❌ {error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4">
                <p className="text-sm text-green-700">✅ {success}</p>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu.email@ejemplo.com"
                  className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  disabled={loading}
                />
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3 text-slate-500 hover:text-slate-700 text-lg"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-3xl bg-slate-900 px-5 py-3 text-base font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cargando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>

            {/* Enlace de Registro */}
            <div className="mt-8 text-center">
              <p className="text-slate-600 text-sm">
                ¿No tienes cuenta?{' '}
                <Link to="/registro" className="font-semibold text-amber-600 hover:text-amber-700">
                  Regístrate aquí
                </Link>
              </p>
            </div>

            {/* Información adicional */}
            <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-600">
              <p className="text-sm font-semibold text-slate-900">💡 Consejo</p>
              <p className="mt-2 text-sm">
                Usa las credenciales de demo para probar la aplicación. Contacta al administrador para crear una cuenta.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}