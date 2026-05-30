import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cocinaService from '../../services/cocinaService';

const PerfilCocinero = () => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const response = await cocinaService.obtenerPerfilCocinero();
        setPerfil(response.data);
      } catch (err) {
        if (!err.response) {
          setError('No se pudo conectar con el servidor.');
          return;
        }

        if (err.response.status === 401) {
          localStorage.clear();
          navigate('/login');
          return;
        }

        if (err.response.status === 403) {
          setError('No tienes permiso para ver este perfil.');
          return;
        }

        setError('No se pudo cargar el perfil del cocinero.');
      } finally {
        setLoading(false);
      }
    };

    cargarPerfil();
  }, [navigate]);

  const getInitial = (name = '') => name.trim().charAt(0).toUpperCase() || 'C';

  if (loading) {
    return (
      <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm border border-slate-200">
        <p className="text-slate-600">Cargando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[2rem] bg-white p-8 shadow-sm border border-red-200">
        <p className="text-red-700 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-100 text-4xl font-black text-amber-700">
              {getInitial(perfil?.nombre)}
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-amber-600">Perfil</p>
              <h2 className="mt-3 text-3xl font-black text-slate-900">{perfil?.nombre}</h2>
              <p className="mt-2 text-slate-600">{perfil?.correo}</p>
            </div>
          </div>

          <span className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold uppercase tracking-[0.35em] text-slate-700">
            Cocinero
          </span>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Información personal</h3>
          <div className="mt-6 space-y-4 text-slate-700">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Nombre</p>
              <p className="mt-2 text-lg font-semibold">{perfil?.nombre || 'Sin nombre'}</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Rol</p>
              <p className="mt-2 text-lg font-semibold">Cocinero</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Contacto</h3>
          <div className="mt-6 space-y-4 text-slate-700">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Teléfono</p>
              <p className="mt-2 text-lg font-semibold">{perfil?.telefono || 'Sin teléfono'}</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Dirección</p>
              <p className="mt-2 text-lg font-semibold">{perfil?.direccion || 'Sin dirección'}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PerfilCocinero;
