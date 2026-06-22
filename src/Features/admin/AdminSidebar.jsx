import React, { useEffect, useRef, useState } from 'react';
import {
  Bell,
  CalendarDays,
  ClipboardCheck,
  DoorOpen,
  History,
  ScrollText,
  Users,
  WalletCards,
  Tag,
} from 'lucide-react';

const menuItems = [
  { id: 'usuarios', label: 'Usuarios', icon: <Users size={18} /> },
  { id: 'bitacora', label: 'Bitacora', icon: <ScrollText size={18} /> },
  { id: 'salas', label: 'Gestion de Salas', icon: <DoorOpen size={18} /> },
  { id: 'reservas', label: 'Gestion de Reservas', icon: <CalendarDays size={18} /> },
  { id: 'notificaciones', label: 'Notificaciones', icon: <Bell size={18} /> },
  { id: 'reportes', label: 'Generar Reporte', icon: <ClipboardCheck size={18} /> },
  { id: 'cierre_caja', label: 'Cierre de Caja', icon: <WalletCards size={18} /> },
  { id: 'categorias', label: 'Gestion de Categorias', icon: <ClipboardCheck size={18} /> },
  { id: 'productos', label: 'Gestion de Productos', icon: <ClipboardCheck size={18} /> },
  { id: 'promociones', label: 'Gestion de Promociones', icon: <Tag size={18} /> },
  { id: 'historial_pedidos', label: 'Historial de Pedidos', icon: <History size={18} /> },
];

const AdminSidebar = ({ vista, setVista, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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

  const handleSelectOption = (id) => {
    setVista(id);
    setIsOpen(false);
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="relative flex items-center gap-4" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className={`flex items-center gap-2 rounded-lg p-2 font-bold transition ${
              isOpen
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
            <span className="hidden sm:inline">Menu</span>
          </button>

          <h2 className="ml-2 text-xl font-black tracking-tight text-slate-800">
            Donde Juanita
          </h2>

          <div
            className={`absolute left-0 top-[120%] w-64 origin-top-left overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl transition-all duration-200 ${
              isOpen ? 'visible scale-100 opacity-100' : 'invisible scale-95 opacity-0'
            }`}
          >
            <div className="flex flex-col gap-1 p-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectOption(item.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                    vista === item.id
                      ? 'bg-indigo-50 font-bold text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100"
        >
          <span className="hidden sm:inline">Cerrar sesion</span>
          <span className="text-lg sm:hidden">Salir</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
