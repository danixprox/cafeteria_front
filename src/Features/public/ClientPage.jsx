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

    // 🔥 LOGOUT CON BITÁCORA
    const handleLogout = async () => {
        const token = localStorage.getItem("token");

        try {
            await fetch("http://127.0.0.1:8000/api/logout/", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (error) {
            console.error("Error logout:", error);
        }

        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50">

            {/* HEADER */}
            <header className="bg-white border-b border-slate-200">
                <div className="mx-auto max-w-6xl px-4 py-5 flex items-center justify-between">
                    
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-900">
                            Panel de Cliente
                        </h1>
                        <p className="text-sm text-slate-600">
                            Bienvenido, {usuario?.nombre}
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="rounded-full bg-amber-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </header>
            
            <main className="mx-auto max-w-6xl px-4 py-12 lg:py-16 space-y-10">

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

            </main>
        </div>
    );
};

export default ClientPage;