import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  ScrollText,
  DoorOpen,
  CalendarDays,
    ClipboardCheck,
    History,
  Bell
} from "lucide-react";

const AdminSidebar = ({ vista, setVista, mostrarInventario, setMostrarInventario, handleLogout }) => {
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

    const menuItems = [

  {
    id: 'usuarios',
    label: 'Usuarios',
    icon: <Users size={18} />
  },

  {
    id: 'bitacora',
    label: 'Bitácora',
    icon: <ScrollText size={18} />
  },

  {
    id: 'salas',
    label: 'Gestión de Salas',
    icon: <DoorOpen size={18} />
  },

  {
    id: 'reservas',
    label: 'Gestión de Reservas',
    icon: <CalendarDays size={18} />
  },

  {
    id: 'notificaciones',
    label: 'Notificaciones',
    icon: <Bell size={18} />
  },
  {
    id: 'categorias',
    label: 'Gestión de Categorías',
    icon: <ClipboardCheck size={18} />
  },

  {
    id: 'productos',
    label: 'Gestión de Productos',
    icon: <ClipboardCheck size={18} />
  }

    ,

    {
        id: 'historial_pedidos',
        label: 'Historial de Pedidos',
        icon: <History size={18} />
    }

];

    const handleSelectOption = (id) => {
        setVista(id);
        if(id !== 'inventario') setMostrarInventario(false);
        setIsOpen(false);
    };

    const toggleInventario = () => {
        setMostrarInventario(true);
        setVista('inventario');
        setIsOpen(false);
    };

    return (
        <div className="w-full bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
            <div className="flex justify-between items-center px-4 py-3">
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

                    {/* DROPDOWN FLOTANTE A LA IZQUIERDA */}
                    <div className={`
                        absolute top-[120%] left-0 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden
                        transition-all duration-200 origin-top-left
                        ${isOpen ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible'}
                    `}>
                        <div className="p-2 flex flex-col gap-1">
                            {menuItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelectOption(item.id)}
                                    className={`w-full text-left px-4 py-3 flex items-center gap-3 rounded-lg transition-colors ${vista === item.id && !mostrarInventario ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}
                            <button
                                onClick={toggleInventario}
                                className={`w-full text-left px-4 py-3 flex items-center gap-3 rounded-lg transition-colors ${vista === 'inventario' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                            >
                                <span className="text-xl">📦</span>
                                Inventario
                            </button>
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
    );
};

export default AdminSidebar;
