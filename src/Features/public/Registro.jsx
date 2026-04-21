import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registro } from '../../services/api';
import { validarRegistro, obtenerRequisitos } from '../../utils/validation';

export default function Registro() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
  });

  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const requisitos = obtenerRequisitos(formData.contrasena);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

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

    const validacion = validarRegistro(formData);
    if (!validacion.valido) {
      setErrores(validacion.errores);
      setError('Revisa los campos marcados.');
      return;
    }

    setLoading(true);

    try {
      await registro({
        nombre: formData.nombre,
        correo: formData.correo,
        contrasena: formData.contrasena,
        cod_rol: 'cliente', // fijo
      });

      setSuccess('Cuenta creada. Te llevamos al inicio de sesión…');

      setTimeout(() => {
        navigate('/login');
      }, 1800);
    } catch (err) {
      setError(err.message || 'No se pudo registrar. Prueba con otro correo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen from-amber-100 via-slate-50 to-amber-200 px-4 py-10">
      <div className="mx-auto max-w-5xl overflow-hidden bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">

          {/* IZQUIERDA */}
          <section className="hidden bg-slate-900 p-10 text-white lg:block">
            <div className="flex h-full flex-col justify-between">
              <div>
                <span className="inline-flex rounded-full bg-amber-200/15 px-3 py-1 text-xs uppercase tracking-[0.32em] text-amber-200">
                  Donde Juanita
                </span>
                <h2 className="mt-8 text-4xl font-semibold leading-tight">
                  Tu café, a tu ritmo
                </h2>
                <p className="mt-5 max-w-sm text-slate-300">
                  Regístrate para explorar el menú, guardar favoritos y pedir sin filas.
                </p>
              </div>

              <div className="space-y-5">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <p className="text-sm uppercase tracking-[0.28em] text-amber-200">Para clientes</p>
                  <p className="mt-4 text-sm text-white">
                    Historial de pedidos, acceso rápido y notificaciones cuando tu pedido esté listo.
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

          {/* FORM */}
          <section className="p-8 sm:p-10">
            <Link
              to="/"
              className="mb-6 inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 lg:hidden"
            >
              ← Volver
            </Link>

            <div className="mb-8">
              <p className="text-sm uppercase tracking-[0.32em] text-amber-600">Crear cuenta</p>
              <h1 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">
                Empieza hoy
              </h1>
              <p className="mt-3 text-slate-600">
                Solo toma un minuto.
              </p>
            </div>

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

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nombre */}
              <div>
                <input
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Nombre completo"
                  className={`w-full rounded-3xl border ${errores.nombre ? 'border-red-500' : 'border-slate-300'} bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:ring-2 ${errores.nombre ? 'focus:ring-red-200' : 'focus:border-amber-500 focus:ring-amber-200'}`}
                  disabled={loading}
                />
                {errores.nombre && (
                  <p className="text-xs text-red-600 mt-1">⚠️ {errores.nombre}</p>
                )}
              </div>

              {/* Correo */}
              <div>
                <input
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="Correo electrónico"
                  className={`w-full rounded-3xl border ${errores.correo ? 'border-red-500' : 'border-slate-300'} bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:ring-2 ${errores.correo ? 'focus:ring-red-200' : 'focus:border-amber-500 focus:ring-amber-200'}`}
                  disabled={loading}
                />
                {errores.correo && (
                  <p className="text-xs text-red-600 mt-1">⚠️ {errores.correo}</p>
                )}
              </div>

              {/* Contraseña */}
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={handleChange}
                    placeholder="Contraseña"
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

                {formData.contrasena && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-xs font-semibold text-slate-700 mb-2">Requisitos:</p>
                    <div className="space-y-1 text-xs">
                      <p className={requisitos.longitud ? 'text-green-600' : 'text-red-600'}>
                        {requisitos.longitud ? '✓' : '✗'} Mínimo 8 caracteres
                      </p>
                      <p className={requisitos.mayuscula ? 'text-green-600' : 'text-red-600'}>
                        {requisitos.mayuscula ? '✓' : '✗'} Una mayúscula
                      </p>
                      <p className={requisitos.minuscula ? 'text-green-600' : 'text-red-600'}>
                        {requisitos.minuscula ? '✓' : '✗'} Una minúscula
                      </p>
                      <p className={requisitos.numero ? 'text-green-600' : 'text-red-600'}>
                        {requisitos.numero ? '✓' : '✗'} Un número
                      </p>
                      <p className={requisitos.especial ? 'text-green-600' : 'text-red-600'}>
                        {requisitos.especial ? '✓' : '✗'} Carácter especial
                      </p>
                    </div>
                  </div>
                )}

                {errores.contrasena && (
                  <p className="text-xs text-red-600 mt-1">⚠️ {errores.contrasena}</p>
                )}
              </div>

              {/* Confirmar */}
              <div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmarContrasena"
                    value={formData.confirmarContrasena}
                    onChange={handleChange}
                    placeholder="Confirmar contraseña"
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
                {loading ? 'Registrando…' : 'Crear cuenta'}
              </button>
            </form>

            {/* Login */}
            <div className="mt-6 text-center">
              <p className="text-slate-600 text-sm">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="font-semibold text-amber-600 hover:text-amber-700">
                  Inicia sesión
                </Link>
              </p>
            </div>

            {/* Nota */}
            <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-slate-600">
              <p className="text-xs">
                Tus datos se usan solo para gestionar tu cuenta y pedidos.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}