import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-50 via-slate-50 to-slate-200">
      <header className="border-b border-amber-200 bg-amber-50/90 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-700">Donde Juanita</p>
            <h1 className="text-3xl font-black text-slate-900">Café con estilo</h1>
          </div>
          <Link
            to="/login"
            className="rounded-full bg-amber-700 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-800"
          >
            Ingresar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-14">
        <section className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr] items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Tu refugio de café y comodidad
            </h2>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              Descubre un lugar donde cada café se disfruta con calma. Regístrate, gestiona tus reservas y disfruta una experiencia pensada para ti.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/registro"
                className="inline-flex items-center justify-center rounded-full bg-amber-700 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-amber-800"
              >
                Crear cuenta
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full border border-amber-700 bg-white px-6 py-3 text-base font-semibold text-amber-700 transition hover:bg-amber-100"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl ring-1 ring-slate-900/10">
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-800 to-slate-950 p-8">
              <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Bienvenido</p>
              <h3 className="mt-5 text-3xl font-semibold">Disfruta el mejor café</h3>
              <p className="mt-4 text-slate-300 leading-7">
                Reserva, consulta tu perfil y mantente siempre conectado con Donde Juanita.
              </p>
            </div>
            <div className="mt-8 grid gap-4">
              <div className="rounded-3xl bg-white/10 p-5">
                <h4 className="text-lg font-semibold text-white">Ambiente acogedor</h4>
                <p className="mt-2 text-slate-300">Un espacio cálido para relajarte y conversar.</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-5">
                <h4 className="text-lg font-semibold text-white">Servicio sencillo</h4>
                <p className="mt-2 text-slate-300">Tu experiencia en línea es clara y rápida.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 rounded-[2rem] bg-white p-10 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-3xl font-semibold text-slate-900 text-center mb-6">Nuestra Historia</h2>
          <p className="text-lg leading-8 text-slate-600 max-w-3xl mx-auto text-center">
            Hace más de 26 años nació un lugar pensado para compartir. Desde entonces, Donde Juanita se convirtió en el punto ideal para quienes buscan café con calidad y una experiencia cuidada.
          </p>
        </section>

        <section className="mt-20 grid gap-6 lg:grid-cols-3">
          <article className="rounded-[1.75rem] bg-slate-950 p-8 text-white shadow-lg ring-1 ring-slate-900/10">
            <h3 className="text-xl font-semibold">Tradición</h3>
            <p className="mt-3 text-slate-300">Sabores clásicos trabajados con ingredientes frescos.</p>
          </article>
          <article className="rounded-[1.75rem] bg-white p-8 shadow-lg ring-1 ring-slate-200">
            <h3 className="text-xl font-semibold text-slate-900">Calidez</h3>
            <p className="mt-3 text-slate-600">Un ambiente pensado para hacerte sentir en casa.</p>
          </article>
          <article className="rounded-[1.75rem] bg-white p-8 shadow-lg ring-1 ring-slate-200">
            <h3 className="text-xl font-semibold text-slate-900">Calidad</h3>
            <p className="mt-3 text-slate-600">Cada detalle se cuida para ofrecer lo mejor.</p>
          </article>
        </section>

        <section className="mt-20 rounded-[2rem] bg-amber-700 p-10 text-white shadow-2xl">
          <h2 className="text-3xl font-bold">Listo para empezar?</h2>
          <p className="mt-4 max-w-2xl leading-8 text-amber-100">
            Regístrate y accede a tu espacio personal para gestionar reservas, pedidos y tu experiencia con nosotros.
          </p>
          <div className="mt-8">
            <Link
              to="/registro"
              className="inline-flex rounded-full bg-slate-950 px-7 py-3 text-base font-semibold text-white transition hover:bg-slate-800"
            >
              Crear cuenta
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p>© 2026 Donde Juanita. Todos los derechos reservados.</p>
          <p className="text-sm mt-1">Un espacio hecho para tu mejor experiencia.</p>
        </div>
      </footer>
    </div>
  );
}
