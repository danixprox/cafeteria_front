const Home = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-5 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-700">Cafetería</p>
            <h1 className="text-3xl font-semibold text-slate-900">Café Minimal</h1>
          </div>
          <button
            onClick={onLogin}
            className="rounded-full bg-amber-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            Iniciar sesión
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 lg:py-16">
        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800">
              Bienvenido a tu espacio de café
            </span>
            <h2 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              El lugar ideal para tu café diario
            </h2>
            <p className="max-w-xl text-lg leading-8 text-slate-600">
              Descubre una experiencia cálida y sencilla con café de especialidad, pastelería fresca
              y un ambiente limpio pensado para relajarte, trabajar o compartir.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={onLogin}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-700"
              >
                Acceder
              </button>
              <a
                href="#about"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Conoce más
              </a>
            </div>
          </div>

          <div className=" bg-white p-8 shadow-lg ring-1 ring-slate-200">
            <div className="flex h-full flex-col justify-between gap-6">
              <div className="rounded-3xl bg-slate-900 p-6 text-white">
                <p className="text-sm uppercase tracking-[0.25em] text-amber-300">Especial de la casa</p>
                <h3 className="mt-4 text-3xl font-semibold">Latte vainilla</h3>
                <p className="mt-3 text-slate-200">
                  Cremoso, suave y con el aroma perfecto para empezar el día.
                </p>
              </div>
              <div className="grid gap-4">
                <div className="rounded-3xl border border-slate-200 p-5">
                  <h4 className="text-lg font-semibold text-slate-900">Ambiente calmado</h4>
                  <p className="mt-2 text-slate-600">Madera clara, plantas y luz natural.</p>
                </div>
                <div className="rounded-3xl border border-slate-200 p-5">
                  <h4 className="text-lg font-semibold text-slate-900">Menú fresco</h4>
                  <p className="mt-2 text-slate-600">Bebidas, sándwiches y postres recién hechos.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="mt-20 grid gap-8 lg:grid-cols-3">
          <article className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-xl font-semibold text-slate-900">Nuestra filosofía</h3>
            <p className="mt-3 text-slate-600">
              Cuidamos cada detalle desde el grano hasta la taza para que disfrutes un café honesto.
            </p>
          </article>
          <article className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-xl font-semibold text-slate-900">Productos locales</h3>
            <p className="mt-3 text-slate-600">
              Ingredientes seleccionados para que cada bocado sea fresco y lleno de sabor.
            </p>
          </article>
          <article className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-xl font-semibold text-slate-900">Diseño minimalista</h3>
            <p className="mt-3 text-slate-600">
              Espacios limpios y cómodos para crear un refugio tranquilo en la ciudad.
            </p>
          </article>
        </section>
      </main>
    </div>
  );
};

export default Home;