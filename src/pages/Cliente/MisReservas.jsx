import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservasService } from '../../services/reservasService';
import { finanzasService } from '../../services/finanzasService';
import NotaVentaClienteModal from './NotaVentaClienteModal';

const MisReservas = () => {
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [procesandoPago, setProcesandoPago] = useState(false);
    const [mensajePago, setMensajePago] = useState('');
    const [tipoMensaje, setTipoMensaje] = useState('');
    const [notaVenta, setNotaVenta] = useState(null);

    const cargarReservas = () => {
        setLoading(true);
        reservasService.getMisReservas()
            .then(res => setReservas(res.data))
            .catch(err => {
                console.error(err);
                alert('Error al cargar reservas');
            })
            .finally(() => setLoading(false));
    };

    // ── Verificar pago exitoso en el retorno de Stripe ──
    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const pagoSuccess = query.get('pago_success');
        const sessionId = query.get('session_id');

        if (pagoSuccess === 'true' && sessionId) {
            setProcesandoPago(true);
            setMensajePago('Procesando pago seguro con Stripe...');
            setTipoMensaje('');

            finanzasService.confirmarPagoStripe(sessionId)
                .then((res) => {
                    setTipoMensaje('exito');
                    setMensajePago('¡Pago confirmado con éxito! Tu reserva ha sido confirmada.');
                    if (res.data?.nota_venta) {
                        setNotaVenta({
                            ...res.data.nota_venta,
                            metodoPago: 'STRIPE',
                        });
                    }
                    cargarReservas();
                    setTimeout(() => {
                        setProcesandoPago(false);
                        setMensajePago('');
                        setTipoMensaje('');
                    }, 4000);
                })
                .catch(err => {
                    setTipoMensaje('error');
                    setMensajePago(err.response?.data?.error || 'Error al verificar el pago con Stripe.');
                    setTimeout(() => {
                        setProcesandoPago(false);
                        setMensajePago('');
                        setTipoMensaje('');
                    }, 5000);
                });

            // Limpiar query params de la URL
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            cargarReservas();
        }
    }, []);

    const handleCancelar = async (id, reserva) => {
        if (window.confirm('¿Estás seguro de cancelar esta reserva?')) {
            try {
                await reservasService.cancelar(id);
                alert('Reserva cancelada exitosamente');
                cargarReservas();
            } catch (error) {
                alert(error.response?.data?.error || error.response?.data?.mensaje || 'Error al cancelar');
            }
        }
    };

    const getEstadoBadge = (estado) => {
        const config = {
            'pendiente': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳' },
            'confirmada': { bg: 'bg-blue-100', text: 'text-blue-800', icon: '✓' },
            'en_curso': { bg: 'bg-green-100', text: 'text-green-800', icon: '▶' },
            'finalizada': { bg: 'bg-gray-100', text: 'text-gray-800', icon: '✓✓' },
            'cancelada': { bg: 'bg-red-100', text: 'text-red-800', icon: '✗' },
            'liberada': { bg: 'bg-purple-100', text: 'text-purple-800', icon: '◇' },
            'no_asistio': { bg: 'bg-red-100', text: 'text-red-800', icon: '✗' },
        };
        const c = config[estado] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: '?' };
        return c;
    };

    const puedeSerCancelada = (estado) => {
        return ['pendiente', 'confirmada'].includes(estado);
    };

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleExportarVoucher = (reserva) => {
        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

        const voucherWindow = window.open('', '_blank', 'width=600,height=800');
        voucherWindow.document.write(`
            <html>
                <head>
                    <title>Voucher de Reserva #${reserva.id}</title>
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; background-color: #f8fafc; }
                        .voucher { background: white; border: 2px dashed #cbd5e1; padding: 40px; border-radius: 15px; max-width: 450px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
                        .header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 20px; }
                        .header h1 { margin: 0; color: #4f46e5; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;}
                        .header p { margin: 5px 0 0; color: #64748b; font-size: 14px; }
                        .row { display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #f8fafc; padding-bottom: 10px; }
                        .label { font-weight: bold; color: #64748b; font-size: 12px; text-transform: uppercase; }
                        .value { font-weight: 800; font-size: 16px; color: #1e293b; text-align: right; }
                        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #94a3b8; line-height: 1.5; }
                        .code { background: #f1f5f9; padding: 10px; border-radius: 8px; font-family: monospace; font-size: 16px; color: #334155; margin: 20px 0; font-weight: bold; text-align: center; letter-spacing: 2px;}
                        @media print {
                            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white; padding: 0; }
                            .voucher { border: 2px solid #cbd5e1; box-shadow: none; max-width: 100%; margin: 0; padding: 20px;}
                        }
                    </style>
                </head>
                <body>
                    <div class="voucher">
                        <div class="header">
                            <h1>☕ Cafetería Prototipo</h1>
                            <p>Voucher Oficial de Reserva</p>
                        </div>
                        
                        <div class="code">REF-${reserva.id}-${new Date(reserva.creada_en).getTime().toString().slice(-4)}</div>

                        <div class="row">
                            <div class="label">Titular</div>
                            <div class="value">${usuario.nombre || 'Cliente'}</div>
                        </div>
                        <div class="row">
                            <div class="label">Sala / Mesa</div>
                            <div class="value">${reserva.sala_nombre}<br/><span style="font-size: 14px; color: #64748b;">${reserva.mesa_nombre}</span></div>
                        </div>
                        <div class="row">
                            <div class="label">Fecha</div>
                            <div class="value">${formatearFecha(reserva.fecha)}</div>
                        </div>
                        <div class="row">
                            <div class="label">Horario</div>
                            <div class="value">${reserva.hora_inicio?.substring(0, 5)} a ${reserva.hora_fin?.substring(0, 5)}</div>
                        </div>
                        <div class="row">
                            <div class="label">Asistentes</div>
                            <div class="value">${reserva.cantidad_personas} personas</div>
                        </div>
                        <div class="row">
                            <div class="label">Estado</div>
                            <div class="value" style="color: #16a34a; font-weight: 900;">CONFIRMADA ✓</div>
                        </div>
                        
                        <div class="footer">
                            <p>Este documento es válido como comprobante de su reserva.<br/>Por favor preséntelo al llegar al establecimiento.</p>
                        </div>
                    </div>
                    <script>
                        window.onload = function() { setTimeout(() => { window.print(); }, 500); }
                    </script>
                </body>
            </html>
        `);
        voucherWindow.document.close();
    };

    if (loading) return (
        <div className="p-10 text-center text-slate-500 font-bold min-h-screen flex items-center justify-center">
            <div className="text-lg">Cargando tus reservas...</div>
        </div>
    );

    const activas = reservas.filter(
        r => !['cancelada', 'finalizada', 'no_asistio'].includes(r.estado)
    );

    const historial = reservas.filter(
        r => ['cancelada', 'finalizada', 'no_asistio'].includes(r.estado)
    );


    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen bg-slate-50">
            <div className="mb-8">
                <h1 className="text-4xl font-black text-slate-800 mb-2">Mis Reservas</h1>
                <p className="text-slate-600">Visualiza y gestiona todas tus reservas de salas</p>
            </div>

            {reservas.length === 0 ? (
                <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-slate-200">
                    <p className="text-slate-500 text-lg font-semibold mb-4">Aún no tienes reservas registradas.</p>
                    <button
                        onClick={() => navigate('/cliente/salas')}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
                    >
                        Explorar Salas
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activas.map(reserva => {
                        const badge = getEstadoBadge(reserva.estado);
                        const puedeCancel = puedeSerCancelada(reserva.estado);

                        return (
                            <div key={reserva.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition">
                                <div className={`${badge.bg} ${badge.text} px-6 py-4 flex justify-between items-start`}>
                                    <div>
                                        <h3 className="font-bold text-lg">{reserva.sala_nombre}</h3>
                                        <p className="text-sm opacity-90">Mesa: {reserva.mesa_nombre}</p>
                                    </div>
                                    <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-xs font-bold uppercase whitespace-nowrap`}>
                                        {badge.icon} {reserva.estado.replace('_', ' ')}
                                    </span>
                                </div>

                                <div className="p-6">
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-slate-50 rounded-lg p-3">
                                            <p className="text-xs text-slate-600 font-bold uppercase mb-1">Fecha</p>
                                            <p className="font-bold text-slate-800">{formatearFecha(reserva.fecha)}</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-3">
                                            <p className="text-xs text-slate-600 font-bold uppercase mb-1">Horario</p>
                                            <p className="font-bold text-slate-800">
                                                {reserva.hora_inicio?.substring(0, 5)} - {reserva.hora_fin?.substring(0, 5)}
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-3">
                                            <p className="text-xs text-slate-600 font-bold uppercase mb-1">Personas</p>
                                            <p className="font-bold text-slate-800">{reserva.cantidad_personas} 👥</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-3">
                                            <p className="text-xs text-slate-600 font-bold uppercase mb-1">Creada</p>
                                            <p className="font-bold text-slate-800 text-sm">{new Date(reserva.creada_en).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        {reserva.estado === 'confirmada' && (
                                            <button
                                                onClick={() => handleExportarVoucher(reserva)}
                                                className="w-full text-indigo-700 bg-indigo-50 hover:bg-indigo-100 py-3 rounded-lg border-2 border-indigo-200 transition font-bold flex items-center justify-center gap-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                                Exportar Comprobante
                                            </button>
                                        )}

                                        {puedeCancel && (
                                            <button
                                                onClick={() => handleCancelar(reserva.id, reserva)}
                                                className="w-full text-red-600 hover:bg-red-50 py-3 rounded-lg border-2 border-red-200 transition font-bold hover:border-red-300 flex items-center justify-center gap-2"
                                            >
                                                <span>✗</span> Cancelar Reserva
                                            </button>
                                        )}
                                    </div>
                                    {!puedeCancel && (
                                        <div className="text-center py-3 text-slate-500 font-semibold text-sm">
                                            No se puede cancelar en este estado
                                        </div>
                                    )}
                                </div>
                            </div>

                        );
                    })}
                </div>
            )}

            {/* ── Modal de Procesando Pago (Stripe Success Return) ── */}
            {procesandoPago && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center animate-in zoom-in duration-200">
                        {tipoMensaje === '' && (
                            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
                        )}
                        {tipoMensaje === 'exito' && (
                            <div className="mx-auto mb-4 h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-3xl">
                                ✓
                            </div>
                        )}
                        {tipoMensaje === 'error' && (
                            <div className="mx-auto mb-4 h-16 w-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-3xl">
                                ✗
                            </div>
                        )}
                        <h3 className="text-xl font-bold text-slate-800 mb-2">
                            {tipoMensaje === 'exito' ? '¡Pago Confirmado!' : tipoMensaje === 'error' ? 'Error de Pago' : 'Verificando Transacción'}
                        </h3>
                        <p className="text-sm text-slate-600">
                            {mensajePago}
                        </p>
                    </div>
                </div>
            )}

            <NotaVentaClienteModal
                nota={notaVenta}
                onClose={() => setNotaVenta(null)}
            />
        </div>
    );
};

export default MisReservas;
