import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ClientPage = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('usuario'));
    setUsuario(user);
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-50 via-slate-50 to-slate-200 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="rounded-[2rem] bg-white/90 p-8 shadow-2xl ring-1 ring-slate-200 backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-amber-700">Cliente</p>
              <h1 className="mt-3 text-4xl font-black text-slate-900">Panel de Cliente</h1>
              <p className="mt-2 text-slate-600">Bienvenido, {usuario?.nombre}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Actualizar página
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] bg-white p-8 shadow-lg ring-1 ring-slate-200">
            <h2 className="text-2xl font-semibold text-slate-900">Mi Perfil</h2>
            <p className="mt-3 text-slate-600">Información de tu cuenta.</p>
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Nombre</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{usuario?.nombre}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Correo</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{usuario?.correo}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-8 shadow-lg ring-1 ring-slate-200">
            <h2 className="text-2xl font-semibold text-slate-900">Todo para ti</h2>
            <p className="mt-3 text-slate-600">Accede a tus opciones principales desde aquí.</p>
            <div className="mt-8 grid gap-4">
              <div className="rounded-3xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900">Ver menú</h3>
                <p className="mt-2 text-slate-600">Descubre los productos disponibles y elige lo que quieras.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900">Realizar pedido</h3>
                <p className="mt-2 text-slate-600">Selecciona tus favoritos y construye tu orden.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900">Mis pedidos</h3>
                <p className="mt-2 text-slate-600">Consulta el estado y detalles de tus compras.</p>
              </div>
            </div>
          </section>
        </div>

        <section className="rounded-[2rem] bg-white p-8 shadow-lg ring-1 ring-slate-200">
          <h2 className="text-2xl font-semibold text-slate-900">Explora más</h2>
          <p className="mt-3 text-slate-600">Todo tu espacio de cliente pensado como una experiencia cálida y sencilla.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 p-5">
              <p className="font-semibold text-slate-900">Reservas</p>
              <p className="mt-2 text-sm text-slate-600">Gestiona tus reservas en un solo lugar.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 p-5">
              <p className="font-semibold text-slate-900">Perfil</p>
              <p className="mt-2 text-sm text-slate-600">Mantén tus datos siempre actualizados.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 p-5">
              <p className="font-semibold text-slate-900">Soporte</p>
              <p className="mt-2 text-sm text-slate-600">Estamos aquí para ayudarte cuando lo necesites.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ClientPage;