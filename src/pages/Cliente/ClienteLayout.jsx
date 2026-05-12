import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const ClienteLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Cerrar al presionar Escape o hacer clic fuera
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        const token = localStorage.getItem("token");
        try {
            await fetch("http://127.0.0.1:8000/api/logout/", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (error) {
            console.error("Error logout:", error);
        }
        localStorage.clear();
        navigate('/login');
    };

    const menuItems = [

    {
        path: '/cliente/salas',
        label: 'Reservar Sala',
        icon: '🚪'
    },

    {
        path: '/cliente/mis-reservas',
        label: 'Mis Reservas',
        icon: '📅'
    },

    {
        path: '/cliente/notificaciones',
        label: 'Notificaciones',
        icon: '🔔'
    },

    {
        path: '/cliente/mis-pedidos',
        label: 'Mis Pedidos',
        icon: '📦'
    },

    {
        path: '/cliente/perfil',
        label: 'Mi Perfil',
        icon: '👤'
    }

];

    const handleNavigation = (path) => {
        navigate(path);
        setIsOpen(false);
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 relative">
            {/* TOP NAVBAR & DROPDOWN */}
            <div className="w-full bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
                <div className="flex justify-between items-center px-4 py-3 max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 relative" ref={dropdownRef}>
                        <button 
                            onClick={() => setIsOpen(!isOpen)}
                            className={`p-2 rounded-lg font-bold flex items-center gap-2 transition ${isOpen ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isOpen 
                                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                }
                            </svg>
                            <span className="hidden sm:inline">Menú</span>
                        </button>

                        <h2 className="text-xl font-black text-slate-800 tracking-tight ml-2">
                            ☕ Donde Juanita
                        </h2>

                        {/* DROPDOWN MENU FLOTANTE A LA IZQUIERDA */}
                        <div className={`
                            absolute top-[120%] left-0 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden
                            transition-all duration-200 origin-top-left
                            ${isOpen ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible'}
                        `}>
                            <div className="p-2 flex flex-col gap-1">
                                {menuItems.map(item => {
                                    const isActive = location.pathname === item.path || (item.path !== '/cliente' && location.pathname.startsWith(item.path));
                                    return (
                                        <button
                                            key={item.path}
                                            onClick={() => handleNavigation(item.path)}
                                            className={`w-full text-left px-4 py-3 flex items-center gap-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                                        >
                                            <span className="text-xl">{item.icon}</span>
                                            {item.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 text-sm border border-red-200"
                    >
                        <span className="hidden sm:inline">Cerrar sesión</span>
                        <span className="sm:hidden text-lg">🚪</span>
                    </button>
                </div>
            </div>

            {/* CONTENIDO PRINCIPAL RENDERIZADO AQUÍ */}
            <main className="flex-1 overflow-y-auto w-full">
                <Outlet />
            </main>
        </div>
    );
};

export default ClienteLayout;
