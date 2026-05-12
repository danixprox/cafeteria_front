import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ClientPage = () => {
    const navigate = useNavigate();
    const [perfil, setPerfil] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editando, setEditando] = useState(false);
    const [guardando, setGuardando] = useState(false);

    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    const [fotoFile, setFotoFile] = useState(null);
    const [fotoPreview, setFotoPreview] = useState(null);
    const fileInputRef = useRef(null);

    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [guardandoPassword, setGuardandoPassword] = useState(false);

    const [notificacion, setNotificacion] = useState(null);

    const mostrarNotif = (mensaje, tipo = 'success') => {
        setNotificacion({ mensaje, tipo });
        setTimeout(() => setNotificacion(null), 4000);
    };

    const getToken = () => localStorage.getItem('token');

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${API_URL}${path}`;
    };

    const cargarPerfil = async () => {
        try {
            const res = await fetch(`${API_URL}/api/mi-perfil/`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            if (!res.ok) throw new Error('Error cargando perfil');
            const data = await res.json();
            setPerfil(data);
            setNombre(data.nombre || '');
            setTelefono(data.telefono || '');
            setDireccion(data.direccion || '');
            setFotoFile(null);
            setFotoPreview(null);
        } catch (error) {
            console.error(error);
            mostrarNotif('Error al cargar el perfil. Recarga la página.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargarPerfil(); }, []);

    const handleCancelarEdicion = () => {
        setEditando(false);
        setNombre(perfil?.nombre || '');
        setTelefono(perfil?.telefono || '');
        setDireccion(perfil?.direccion || '');
        setFotoFile(null);
        setFotoPreview(null);
    };

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            mostrarNotif('El archivo debe ser una imagen (JPG, PNG, WEBP)', 'error');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            mostrarNotif('La imagen no debe superar 5MB', 'error');
            return;
        }
        setFotoFile(file);
        setFotoPreview(URL.createObjectURL(file));
    };

    const handleGuardarPerfil = async () => {
        if (!nombre.trim()) {
            mostrarNotif('El nombre no puede estar vacío', 'error');
            return;
        }
        setGuardando(true);
        try {
            const formData = new FormData();
            formData.append('nombre', nombre.trim());
            formData.append('telefono', telefono.trim());
            formData.append('direccion', direccion.trim());
            if (fotoFile) formData.append('foto_perfil', fotoFile);

            const res = await fetch(`${API_URL}/api/mi-perfil/`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${getToken()}` },
                body: formData
            });

            const responseText = await res.text();
            let data;
            try { data = JSON.parse(responseText); } catch (e) { throw new Error('Respuesta inválida del servidor'); }
            if (!res.ok) throw new Error(data.error || 'No se pudo actualizar el perfil.');

            const perfilActualizado = {
                id_usuario: data.id_usuario, nombre: data.nombre, correo: data.correo,
                rol: data.rol, foto_perfil: data.foto_perfil, cod_cliente: data.cod_cliente,
                telefono: data.telefono, direccion: data.direccion,
            };
            setPerfil(perfilActualizado);
            setNombre(perfilActualizado.nombre || '');
            setTelefono(perfilActualizado.telefono || '');
            setDireccion(perfilActualizado.direccion || '');
            setEditando(false);
            setFotoFile(null);
            setFotoPreview(null);

            try {
                const storedUser = JSON.parse(localStorage.getItem('usuario') || '{}');
                storedUser.nombre = perfilActualizado.nombre;
                localStorage.setItem('usuario', JSON.stringify(storedUser));
            } catch (e) { console.warn('[PERFIL] Error actualizando localStorage:', e); }

            mostrarNotif('Perfil actualizado correctamente.');
        } catch (error) {
            console.error('[PERFIL] Error al guardar:', error);
            mostrarNotif(error.message || 'No se pudo actualizar el perfil.', 'error');
        } finally {
            setGuardando(false);
        }
    };

    const handleCambiarPassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) { mostrarNotif('Completa todos los campos de contraseña', 'error'); return; }
        if (newPassword !== confirmPassword) { mostrarNotif('La nueva contraseña y la confirmación no coinciden', 'error'); return; }
        if (newPassword.length < 6) { mostrarNotif('La contraseña debe tener al menos 6 caracteres', 'error'); return; }
        if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) { mostrarNotif('La contraseña debe tener mayúscula, minúscula y número', 'error'); return; }

        setGuardandoPassword(true);
        try {
            const res = await fetch(`${API_URL}/api/cambiar-password/`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al cambiar contraseña');
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
            setMostrarPassword(false);
            mostrarNotif('Contraseña actualizada correctamente.');
        } catch (error) { mostrarNotif(error.message, 'error'); }
        finally { setGuardandoPassword(false); }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-slate-500 font-semibold text-sm">Cargando tu perfil...</p>
                </div>
            </div>
        );
    }

    const fotoActual = fotoPreview || getImageUrl(perfil?.foto_perfil);

    return (
        <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-5">
            {notificacion && (
                <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-lg shadow-lg font-semibold text-sm transition-all ${notificacion.tipo === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`} style={{ animation: 'slideIn 0.3s ease-out' }}>
                    {notificacion.mensaje}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                    <div className="relative shrink-0">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-indigo-100 border-2 border-slate-200 shadow-sm">
                            {fotoActual ? (
                                <img src={fotoActual} alt="Foto de perfil" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl font-black text-indigo-600">
                                    {perfil?.nombre?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                            )}
                        </div>
                        {editando && (
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 bg-indigo-600 hover:bg-indigo-700 text-white w-8 h-8 rounded-full flex items-center justify-center shadow border-2 border-white transition" title="Cambiar foto de perfil">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </button>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFotoChange} />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-xl font-bold text-slate-800">{perfil?.nombre}</h1>
                        <p className="text-slate-500 text-sm">{perfil?.correo}</p>
                        <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">Cliente — {perfil?.cod_cliente || ''}</span>
                    </div>
                    <div className="shrink-0">
                        {!editando ? (
                            <button onClick={() => setEditando(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                Editar Perfil
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={handleCancelarEdicion} className="border border-slate-300 text-slate-600 px-3 py-2 rounded-lg font-semibold text-sm hover:bg-slate-50 transition">Cancelar</button>
                                <button onClick={handleGuardarPerfil} disabled={guardando} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition disabled:opacity-50 flex items-center gap-1.5">
                                    {guardando ? (<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>) : (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>)}
                                    Guardar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                {fotoFile && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-xs text-indigo-600 font-semibold mb-2">Vista previa de la nueva foto:</p>
                        <img src={fotoPreview} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200" />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                    <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider"><span className="text-indigo-600">👤</span> Información Personal</h2>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Nombre</label>
                            {editando ? (<input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="Tu nombre completo" />) : (<p className="text-slate-800 font-medium text-sm bg-slate-50 px-3 py-2 rounded-lg">{perfil?.nombre || '—'}</p>)}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Correo electrónico</label>
                            <p className="text-slate-800 font-medium text-sm bg-slate-50 px-3 py-2 rounded-lg">{perfil?.correo || '—'}</p>
                            {editando && <p className="text-[11px] text-slate-400 mt-0.5">El correo no se puede modificar.</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Código de cliente</label>
                            <p className="text-slate-800 font-medium text-sm bg-slate-50 px-3 py-2 rounded-lg">{perfil?.cod_cliente || '—'}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                    <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider"><span className="text-emerald-600">📞</span> Contacto</h2>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Teléfono</label>
                            {editando ? (<input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="Ej. 70012345" />) : (<p className="text-slate-800 font-medium text-sm bg-slate-50 px-3 py-2 rounded-lg">{perfil?.telefono || 'Sin registrar'}</p>)}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Dirección</label>
                            {editando ? (<textarea value={direccion} onChange={(e) => setDireccion(e.target.value)} rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none" placeholder="Tu dirección" />) : (<p className="text-slate-800 font-medium text-sm bg-slate-50 px-3 py-2 rounded-lg">{perfil?.direccion || 'Sin registrar'}</p>)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <button type="button" onClick={() => setMostrarPassword(!mostrarPassword)} className="w-full flex items-center justify-between text-left">
                    <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider"><span className="text-amber-600">🔒</span> Cambiar Contraseña</h2>
                    <svg className={`w-4 h-4 text-slate-400 transition-transform ${mostrarPassword ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {mostrarPassword && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 max-w-sm">
                        <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Contraseña actual</label><input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••" /></div>
                        <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Nueva contraseña</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Mín. 6 caracteres, mayúscula, minúscula, número" /></div>
                        <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Confirmar nueva contraseña</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Repite la contraseña" /></div>
                        <button type="button" onClick={handleCambiarPassword} disabled={guardandoPassword} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition disabled:opacity-50 flex items-center gap-1.5">
                            {guardandoPassword && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                            Actualizar Contraseña
                        </button>
                    </div>
                )}
            </div>

            <style>{`@keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }`}</style>
        </div>
    );
};

export default ClientPage;