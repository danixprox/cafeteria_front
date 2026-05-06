import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';

const ClientPage = () => {
    const navigate = useNavigate();

    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("usuario"));
        setUsuario(user);
    }, []);

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 lg:py-12 space-y-10 w-full">
            <div className="mb-4">
                <h1 className="text-3xl font-black text-slate-800">Panel de Cliente</h1>
                <p className="text-sm text-slate-600">Bienvenido, {usuario?.nombre}</p>
            </div>

                {/* PERFIL */}
                <section className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">
                        👤 Mi Perfil
                    </h2>

                    <p className="text-slate-700">
                        <strong>Nombre:</strong> {usuario?.nombre}
                    </p>

                    <p className="text-slate-700">
                        <strong>Correo:</strong> {usuario?.correo}
                    </p>

                    <p className="text-slate-500 text-sm mt-2">
                        (Datos básicos de tu cuenta)
                    </p>
                </section>

                {/* SECCIÓN PRINCIPAL */}
                <section>
                    <h2 className="text-2xl font-semibold text-slate-900">
                        🍽️ Explora nuestros productos
                    </h2>

                    <p className="text-slate-600 mt-2">
                        Aquí podrás ver el menú, realizar pedidos y gestionar tus compras.
                    </p>

                    {/* CARDS SIMPLES */}
                    <div className="grid md:grid-cols-3 gap-6 mt-6">

                        <div className="bg-white rounded-xl shadow p-5">
                            <h3 className="font-semibold text-slate-900">📋 Ver Menú</h3>
                            <p className="text-sm text-slate-600 mt-2">
                                Explora los productos disponibles.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow p-5">
                            <h3 className="font-semibold text-slate-900">🛒 Realizar Pedido</h3>
                            <p className="text-sm text-slate-600 mt-2">
                                Selecciona productos y haz tu pedido.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow p-5">
                            <h3 className="font-semibold text-slate-900">📦 Mis Pedidos</h3>
                            <p className="text-sm text-slate-600 mt-2">
                                Consulta el estado de tus pedidos.
                            </p>
                        </div>

                    </div>
                </section>

                {/* BOTÓN EXTRA */}
                <div>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Actualizar
                    </button>
                </div>

        </div>
    );
};

export default ClientPage;