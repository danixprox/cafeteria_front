import { useState } from "react";

const Login = ({ onBack }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Email:", email, "Password:", password);
  };

  return (
    <div className="min-h-screen  from-amber-100 via-slate-50 to-amber-200 px-4 py-10">
      <div className="mx-auto max-w-5xl overflow-hidden bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="hidden  bg-slate-900 p-10 text-white lg:block">
            <div className="flex h-full flex-col justify-between">
              <div>
                <span className="inline-flex rounded-full bg-amber-200/15 px-3 py-1 text-xs uppercase tracking-[0.32em] text-amber-200">
                  Cafetería
                </span>
                <h2 className="mt-8 text-4xl font-semibold leading-tight">
                  Bienvenido a tu rincón del café
                </h2>
                <p className="mt-5 max-w-sm text-slate-300">
                  Inicia sesión para ver tus pedidos, favoritos y promociones en tu cafetería preferida.
                </p>
              </div>

              <div className="space-y-5">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <p className="text-sm uppercase tracking-[0.28em] text-amber-200">Especial</p>
                  <p className="mt-4 text-lg font-semibold text-white">Latte de vainilla</p>
                  <p className="mt-2 text-slate-300">Crema, aroma dulce y sabor suave para acompañar tu día.</p>
                </div>

                <button
                  onClick={onBack}
                  className="inline-flex w-full items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          </section>

          <section className="p-8 sm:p-10">
            <button
              onClick={onBack}
              className="mb-6 inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 lg:hidden"
            >
              Volver
            </button>

            <div className="mb-8">
              <p className="text-sm uppercase tracking-[0.32em] text-amber-500">Cafetería Minimal</p>
              <h1 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">Iniciar sesión</h1>
              <p className="mt-3 text-slate-600">
                Accede con tu correo y contraseña para continuar con tu pedido.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-3xl bg-slate-900 px-5 py-3 text-base font-semibold text-white transition hover:bg-slate-700"
              >
                Entrar
              </button>
            </form>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <a href="#" className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-3 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                ¿Olvidaste tu contraseña?
              </a>
              <a href="#" className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-3 text-center text-sm font-semibold text-amber-700 transition hover:bg-amber-100">
                Crear cuenta nueva
              </a>
            </div>

            <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-600">
              <p className="text-sm font-semibold text-slate-900">Sugerencia</p>
              <p className="mt-2 text-sm">
                Usa tu correo registrado para acceder más rápido y disfrutar de tus bebidas favoritas.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Login;