import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registro, obtenerRoles } from '../../services/api';
import { validarRegistro, obtenerRequisitos } from '../../utils/validation';

export default function Registro() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([
    { cod_rol: 'cli', nombre: 'Cliente' },
    { cod_rol: 'emp', nombre: 'Empleado' },
  ]);

  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    codRol: 'cli',
  });

  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Obtener requisitos de contraseña
  const requisitos = obtenerRequisitos(formData.contrasena);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Limpiar error del campo cuando el usuario comience a escribir
    if (errores[name]) {
      setErrores({
        ...errores,
        [name]: '',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validar formulario
    const validacion = validarRegistro(formData);
    if (!validacion.valido) {
      setErrores(validacion.errores);
      setError('Por favor corrige los errores en el formulario');
      return;
    }

    setLoading(true);

    try {
      // Llamar al servicio de API
      const datos = await registro({
        nombre: formData.nombre,
        correo: formData.correo,
        contrasena: formData.contrasena,
        cod_rol: formData.codRol,
      });

      setSuccess('¡Registro exitoso! Redirigiendo al login...');

      // Redirigir a login después de 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Error al registrar. Intenta con otro correo.');
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
                  Únete a nuestro equipo
                </h2>
                <p className="mt-5 max-w-sm text-slate-300">
                  Crea tu cuenta y accede a todas las funcionalidades de Cafetería Pro.
                </p>
              </div>

              <div className="space-y-5">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <p className="text-sm uppercase tracking-[0.28em] text-amber-200">Seguridad</p>
                  <p className="mt-4 text-sm text-white">
                    Tu contraseña se encripta de forma segura en nuestros servidores.
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
              <h1 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">Crear cuenta</h1>
              <p className="mt-3 text-slate-600">
                Regístrate para acceder a tu panel de usuario.
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
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nombre */}
              <div>
                <label htmlFor="nombre" className="text-sm font-medium text-slate-700 block mb-2">
                  Nombre completo
                </label>
                <input
                  id="nombre"
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Juan García García"
                  className={`w-full rounded-3xl border ${errores.nombre ? 'border-red-500' : 'border-slate-300'} bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:ring-2 ${errores.nombre ? 'focus:ring-red-200' : 'focus:border-amber-500 focus:ring-amber-200'}`}
                  disabled={loading}
                />
                {errores.nombre && (
                  <p className="text-xs text-red-600 mt-1">⚠️ {errores.nombre}</p>
                )}
              </div>

              {/* Correo */}
              <div>
                <label htmlFor="correo" className="text-sm font-medium text-slate-700 block mb-2">
                  Correo electrónico
                </label>
                <input
                  id="correo"
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="tu.email@ejemplo.com"
                  className={`w-full rounded-3xl border ${errores.correo ? 'border-red-500' : 'border-slate-300'} bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:ring-2 ${errores.correo ? 'focus:ring-red-200' : 'focus:border-amber-500 focus:ring-amber-200'}`}
                  disabled={loading}
                />
                {errores.correo && (
                  <p className="text-xs text-red-600 mt-1">⚠️ {errores.correo}</p>
                )}
              </div>

              {/* Rol */}
              <div>
                <label htmlFor="codRol" className="text-sm font-medium text-slate-700 block mb-2">
                  Tipo de cuenta
                </label>
                <select
                  id="codRol"
                  name="codRol"
                  value={formData.codRol}
                  onChange={handleChange}
                  className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  disabled={loading}
                >
                  <option value="cli">Cliente - Para comprar y hacer pedidos</option>
                  <option value="emp">Empleado - Para gestionar la cafetería</option>
                </select>
                {errores.codRol && (
                  <p className="text-xs text-red-600 mt-1">⚠️ {errores.codRol}</p>
                )}
              </div>

              {/* Contraseña */}
              <div>
                <label htmlFor="contrasena" className="text-sm font-medium text-slate-700 block mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="contrasena"
                    type={showPassword ? 'text' : 'password'}
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full rounded-3xl border ${errores.contrasena ? 'border-red-500' : 'border-slate-300'} bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:ring-2 ${errores.contrasena ? 'focus:ring-red-200' : 'focus:border-amber-500 focus:ring-amber-200'}`}
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

                {/* Requisitos de contraseña */}
                {formData.contrasena && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-xs font-semibold text-slate-700 mb-2">Requisitos:</p>
                    <div className="space-y-1 text-xs">
                      <p className={requisitos.longitud ? 'text-green-600' : 'text-red-600'}>
                        {requisitos.longitud ? '✓' : '✗'} Mínimo 8 caracteres
                      </p>
                      <p className={requisitos.mayuscula ? 'text-green-600' : 'text-red-600'}>
                        {requisitos.mayuscula ? '✓' : '✗'} Una mayúscula (A-Z)
                      </p>
                      <p className={requisitos.minuscula ? 'text-green-600' : 'text-red-600'}>
                        {requisitos.minuscula ? '✓' : '✗'} Una minúscula (a-z)
                      </p>
                      <p className={requisitos.numero ? 'text-green-600' : 'text-red-600'}>
                        {requisitos.numero ? '✓' : '✗'} Un número (0-9)
                      </p>
                      <p className={requisitos.especial ? 'text-green-600' : 'text-red-600'}>
                        {requisitos.especial ? '✓' : '✗'} Carácter especial (!@#$%)
                      </p>
                    </div>
                  </div>
                )}

                {errores.contrasena && (
                  <p className="text-xs text-red-600 mt-1">⚠️ {errores.contrasena}</p>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label htmlFor="confirmarContrasena" className="text-sm font-medium text-slate-700 block mb-2">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    id="confirmarContrasena"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmarContrasena"
                    value={formData.confirmarContrasena}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full rounded-3xl border ${errores.confirmarContrasena ? 'border-red-500' : 'border-slate-300'} bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:ring-2 ${errores.confirmarContrasena ? 'focus:ring-red-200' : 'focus:border-amber-500 focus:ring-amber-200'}`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-3 text-slate-500 hover:text-slate-700 text-lg"
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errores.confirmarContrasena && (
                  <p className="text-xs text-red-600 mt-1">⚠️ {errores.confirmarContrasena}</p>
                )}
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-3xl bg-slate-900 px-5 py-3 text-base font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed mt-6 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registrando...
                  </>
                ) : (
                  'Crear cuenta'
                )}
              </button>
            </form>

            {/* Enlace de Login */}
            <div className="mt-6 text-center">
              <p className="text-slate-600 text-sm">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="font-semibold text-amber-600 hover:text-amber-700">
                  Inicia sesión
                </Link>
              </p>
            </div>

            {/* Términos */}
            <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-slate-600">
              <p className="text-xs">
                Al registrarte, aceptas nuestros términos de servicio y política de privacidad.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
