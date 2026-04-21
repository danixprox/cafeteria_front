import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-5 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-700">Cafetería "Donde Juanita"</p>
            <h1 className="text-3xl font-semibold text-slate-900">Café & Sistema</h1>
          </div>
          <Link
            to="/login"
            className="rounded-full bg-amber-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            Iniciar sesión
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 lg:py-16">
        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800">
              ☕ Bienvenidos a Cafetería "Donde Juanita"
            </span>
            <h2 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Desde hace 26 años, endulzando tus días con café y amor
            </h2>
            <p className="max-w-xl text-lg leading-8 text-slate-600">
              Sistema integral para gestionar usuarios, empleados, clientes y todas las operaciones
              de tu cafetería en un solo lugar.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-700"
              >
                Acceder al sistema
              </Link>
              <Link
                to="/registro"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Crear cuenta
              </Link>
            </div>
          </div>

          <div className="bg-white p-8 shadow-lg ring-1 ring-slate-200">
            <div className="flex h-full flex-col justify-between gap-6">
              <div className="rounded-3xl bg-linear-to-br from-slate-900 to-slate-800 p-6 text-white">
                <p className="text-sm uppercase tracking-[0.25em] text-amber-300">Sistema General</p>
                <h3 className="mt-4 text-3xl font-semibold">Cafetería "Donde Juanita"</h3>
                <p className="mt-3 text-slate-200">
                  Gestión completa para tu negocio de cafetería.
                </p>
              </div>
              <div className="grid gap-4">
                <div className="rounded-3xl border border-slate-200 p-5">
                  <h4 className="text-lg font-semibold text-slate-900">👥 Gestión de usuarios</h4>
                  <p className="mt-2 text-slate-600">Administra clientes y empleados fácilmente.</p>
                </div>
                <div className="rounded-3xl border border-slate-200 p-5">
                  <h4 className="text-lg font-semibold text-slate-900">🔒 Seguridad</h4>
                  <p className="mt-2 text-slate-600">Roles y permisos para proteger tus datos.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="historia" className="mt-20 bg-white p-10 rounded-3xl shadow-sm ring-1 ring-slate-200">
          <h2 className="text-3xl font-semibold text-slate-900 text-center mb-6">Nuestra Historia</h2>
          <p className="text-lg leading-8 text-slate-600 max-w-4xl mx-auto text-center">
            Cafetería "Donde Juanita" nació hace más de 26 años con la visión de crear un espacio cálido donde el café no solo sea una bebida, sino una experiencia que conecta a las personas. Fundada por Juanita, nuestra cafetería ha sido un pilar en la comunidad, ofreciendo sabores tradicionales y un servicio amable que hace que cada visita sea especial.
          </p>
        </section>

        <section id="valores" className="mt-20 grid gap-8 lg:grid-cols-3">
          <article className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-xl font-semibold text-slate-900">🌿 Tradición</h3>
            <p className="mt-3 text-slate-600">
              Mantenemos las recetas clásicas que han deleitado a generaciones.
            </p>
          </article>
          <article className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-xl font-semibold text-slate-900">❤️ Calidez</h3>
            <p className="mt-3 text-slate-600">
              Un ambiente acogedor donde te sientes como en casa.
            </p>
          </article>
          <article className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-xl font-semibold text-slate-900">⭐ Calidad</h3>
            <p className="mt-3 text-slate-600">
              Ingredientes frescos y un compromiso con la excelencia.
            </p>
          </article>
        </section>

        <section className="mt-20 bg-linear-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-10 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para comenzar?</h2>
          <p className="text-lg text-slate-200 mb-6 max-w-2xl mx-auto">
            Crea tu cuenta ahora y accede a todas las funcionalidades de Cafetería "Donde Juanita".
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/registro"
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-full font-semibold transition"
            >
              Registrarse
            </Link>
            <Link
              to="/login"
              className="bg-white hover:bg-slate-100 text-slate-900 px-8 py-3 rounded-full font-semibold transition"
            >
              Iniciar sesión
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400 text-center py-8 mt-20">
        <p className="mb-2">© 2026 Cafetería "Donde Juanita". Todos los derechos reservados.</p>
        <p className="text-sm">Desarrollado con ❤️ para cafeterías modernas</p>
      </footer>
    </div>
  );
}