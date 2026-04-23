import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../services/api";
import { validarLogin } from "../../utils/validation";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [bloqueado, setBloqueado] = useState(false);

  // 🔹 NUEVO: formatear tiempo
  const formatearTiempo = (segundos) => {
    const min = Math.floor(segundos / 60);
    const sec = segundos % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validacion = validarLogin(email, password);
    if (!validacion.valido) {
      setError(validacion.errores[0]);
      return;
    }

    setLoading(true);

    try {
      const datos = await login(email, password);
      
      console.log("LOGIN DATA:", datos);

      localStorage.setItem("usuario", JSON.stringify(datos.usuario));
      localStorage.setItem("id_usuario", datos.usuario.id);
      localStorage.setItem("nombre_usuario", datos.usuario.nombre);
      localStorage.setItem(
     "rol_usuario",
      datos.usuario.cod_rol?.cod_rol || datos.usuario.rol
     );
      if (datos.token) {
        localStorage.setItem("token", datos.token);
      }

      setSuccess(`Bienvenido, ${datos.usuario.nombre}`);

      setTimeout(() => {
        console.log("DATOS COMPLETOS:", datos);
        console.log("ROL RAW:", datos.usuario.cod_rol);
        console.log("ROL ALT:", datos.usuario.rol);

        const rolObj = datos.usuario.cod_rol;

        const rol =
          typeof rolObj === "object"
            ? rolObj.cod_rol
            : rolObj || datos.usuario.rol;

        console.log("ROL FINAL:", rol);

        if (rol === "admin") {
          navigate("/admin");
        } else if (["emp", "mesero", "cocinero"].includes(rol)) {
          navigate("/empleado");
        } else {
          navigate("/cliente");
        }
      }, 1000);
    } catch (err) {
      const mensaje = err.message || "Error al iniciar sesión";

      // 🔒 detectar bloqueo
      if (
        mensaje.includes("Demasiados intentos") ||
        mensaje.includes("bloqueada")
      ) {
        setBloqueado(true);
        setTiempoRestante(600); // 10 min
      }

      setError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!bloqueado || tiempoRestante <= 0) return;

    const intervalo = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          setBloqueado(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [bloqueado, tiempoRestante]);

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
                  Bienvenido
                </h2>
                <p className="mt-5 max-w-sm text-slate-300">
                  Accede a tu cuenta para ver tu panel, gestionar tus pedidos o
                  continuar tu experiencia.
                </p>
              </div>

              <div className="space-y-5">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <p className="text-sm uppercase tracking-[0.28em] text-amber-200">
                    Acceso seguro
                  </p>
                  <p className="mt-4 text-sm text-white">
                    Usa tu correo y contraseña registrados para ingresar al
                    sistema.
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
              <p className="text-sm uppercase tracking-[0.32em] text-amber-600">
                Iniciar sesión
              </p>
              <h1 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">
                Accede a tu cuenta
              </h1>
              <p className="mt-3 text-slate-600">
                Ingresa tus datos para continuar.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-700">❌ {error}</p>
              </div>
            )}

            {/* 🔥 NUEVO: contador */}
            {bloqueado && (
              <p className="text-red-600 text-sm mb-4">
                ⏳ Intenta nuevamente en {formatearTiempo(tiempoRestante)}
              </p>
            )}

            {success && (
              <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4">
                <p className="text-sm text-green-700">✅ {success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3 text-slate-500"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || bloqueado}
                className="w-full rounded-3xl bg-slate-900 px-5 py-3 text-white font-semibold"
              >
                {loading ? "Ingresando..." : "Entrar"}
              </button>
              <div className="mt-3 text-right">
                <Link
                  to="/recuperar"
                  className="text-sm text-amber-600 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-600 text-sm">
                ¿No tienes cuenta?{" "}
                <Link to="/registro" className="font-semibold text-amber-600">
                  Crear cuenta
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}


