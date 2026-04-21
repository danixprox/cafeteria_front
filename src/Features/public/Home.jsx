import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-5 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-700">Donde Juanita</p>
            <h1 className="text-3xl font-semibold text-slate-900">Café & Experiencia</h1>
          </div>
          <Link
            to="/login"
            className="rounded-full bg-amber-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            Ingresar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 lg:py-16">
        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800">
              ☕ Bienvenido
            </span>
            <h2 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Más que café, un momento para ti
            </h2>
            <p className="max-w-xl text-lg leading-8 text-slate-600">
              Descubre un espacio donde cada taza cuenta una historia. Explora el menú, realiza pedidos y disfruta una experiencia pensada para ti.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/registro"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-700"
              >
                Crear cuenta
              </Link>
            </div>
          </div>

          <div className="bg-white p-8 shadow-lg ring-1 ring-slate-200">
            <div className="flex h-full flex-col justify-between gap-6">
              <div className="rounded-3xl bg-linear-to-br from-slate-900 to-slate-800 p-6 text-white">
                <p className="text-sm uppercase tracking-[0.25em] text-amber-300">Experiencia</p>
                <h3 className="mt-4 text-3xl font-semibold">Donde Juanita</h3>
                <p className="mt-3 text-slate-200">
                  Café, tranquilidad y momentos especiales en un solo lugar.
                </p>
              </div>
              <div className="grid gap-4">
                <div className="rounded-3xl border border-slate-200 p-5">
                  <h4 className="text-lg font-semibold text-slate-900">☕ Menú variado</h4>
                  <p className="mt-2 text-slate-600">Bebidas y productos para cada gusto.</p>
                </div>
                <div className="rounded-3xl border border-slate-200 p-5">
                  <h4 className="text-lg font-semibold text-slate-900">⚡ Pedidos rápidos</h4>
                  <p className="mt-2 text-slate-600">Ordena sin complicaciones desde tu cuenta.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="historia" className="mt-20 bg-white p-10 rounded-3xl shadow-sm ring-1 ring-slate-200">
          <h2 className="text-3xl font-semibold text-slate-900 text-center mb-6">Nuestra Historia</h2>
          <p className="text-lg leading-8 text-slate-600 max-w-4xl mx-auto text-center">
            Hace más de 26 años nació un lugar pensado para compartir. Desde entonces, Donde Juanita se ha convertido en un punto de encuentro donde el café, la conversación y la calidez siempre están presentes.
          </p>
        </section>

        <section id="valores" className="mt-20 grid gap-8 lg:grid-cols-3">
          <article className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-xl font-semibold text-slate-900">🌿 Tradición</h3>
            <p className="mt-3 text-slate-600">
              Recetas y sabores que se mantienen con el tiempo.
            </p>
          </article>
          <article className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-xl font-semibold text-slate-900">❤️ Calidez</h3>
            <p className="mt-3 text-slate-600">
              Un ambiente donde siempre eres bienvenido.
            </p>
          </article>
          <article className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-xl font-semibold text-slate-900">⭐ Calidad</h3>
            <p className="mt-3 text-slate-600">
              Ingredientes frescos y atención cuidada.
            </p>
          </article>
        </section>

        <section className="mt-20 bg-linear-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-10 text-center">
          <h2 className="text-3xl font-bold mb-4">Empieza cuando quieras</h2>
          <p className="text-lg text-slate-200 mb-6 max-w-2xl mx-auto">
            Crea tu cuenta y accede a tu espacio personal para pedidos y más.
          </p>
          <Link
            to="/registro"
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-full font-semibold transition"
          >
            Crear cuenta
          </Link>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400 text-center py-8 mt-20">
        <p className="mb-2">© 2026 Donde Juanita. Todos los derechos reservados.</p>
        <p className="text-sm">Hecho para brindar una mejor experiencia</p>
      </footer>
    </div>
  );
}