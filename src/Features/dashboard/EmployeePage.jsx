import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';

const EmployeePage = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200">
                <div className="mx-auto max-w-6xl px-4 py-5 flex items-center justify-between">
                    <h1 className="text-3xl font-semibold text-slate-900">Panel de Empleado</h1>
                    <button onClick={handleLogout} className="rounded-full bg-amber-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-amber-700">
                        Cerrar Sesión
                    </button>
                </div>
            </header>
            <main className="mx-auto max-w-6xl px-4 py-12 lg:py-16">
                <h2 className="text-2xl font-semibold text-slate-900">Gestión de Tareas</h2>
                <p className="text-slate-600">Aquí puedes gestionar tus tareas y ver tu información personal.</p>
            </main>
        </div>
    );
};

export default EmployeePage;