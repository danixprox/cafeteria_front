const money = (value) => `Bs. ${Number(value || 0).toFixed(2)}`;

const NotaVentaClienteModal = ({ nota, onClose }) => {
    if (!nota) return null;

    const productos = Array.isArray(nota.productos) ? nota.productos : [];

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <style>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }

                    #nota-venta-cliente-print-area,
                    #nota-venta-cliente-print-area * {
                        visibility: visible !important;
                    }

                    #nota-venta-cliente-print-area {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        max-width: none !important;
                        box-shadow: none !important;
                        border: 0 !important;
                        border-radius: 0 !important;
                    }

                    .nota-venta-cliente-actions {
                        display: none !important;
                    }
                }
            `}</style>

            <div
                id="nota-venta-cliente-print-area"
                className="w-full max-w-2xl rounded-xl bg-white p-8 text-slate-900 shadow-2xl ring-1 ring-slate-200"
            >
                <h2 className="mb-6 text-center text-2xl font-black tracking-wide">
                    NOTA DE VENTA
                </h2>

                <div className="mb-5 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        <span className="font-black">N° Comprobante:</span>{' '}
                        <span className="font-black">{nota.numeroComprobante || 'NV-000000'}</span>
                    </p>
                    <p>
                        <span className="font-semibold">Fecha/Hora:</span>{' '}
                        <span>{nota.fechaHora || '-'}</span>
                    </p>
                </div>

                <div className="mb-6 space-y-1 text-sm">
                    <p>
                        <span className="font-semibold">Cliente:</span> {nota.cliente || 'Cliente'}
                    </p>
                    <p>
                        <span className="font-semibold">Mesero:</span> {nota.mesero || 'Reserva en línea'}
                    </p>
                    <p>
                        <span className="font-semibold">Mesa:</span> {nota.mesa || 'Sin mesa'}
                    </p>
                    <p>
                        <span className="font-semibold">Sala:</span> {nota.sala || 'Sin sala'}
                    </p>
                </div>

                <div className="mb-6 overflow-hidden rounded-lg border border-slate-200">
                    <table className="w-full text-center text-sm">
                        <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                            <tr>
                                <th className="px-3 py-3 font-black">Cant</th>
                                <th className="px-3 py-3 font-black">Producto</th>
                                <th className="px-3 py-3 font-black">Precio</th>
                                <th className="px-3 py-3 font-black">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productos.map((item, index) => (
                                <tr key={`${item.producto}-${index}`} className="border-t border-slate-100">
                                    <td className="px-3 py-3">{item.cantidad}</td>
                                    <td className="px-3 py-3 text-left">{item.producto}</td>
                                    <td className="px-3 py-3">{money(item.precio)}</td>
                                    <td className="px-3 py-3 font-semibold">{money(item.total)}</td>
                                </tr>
                            ))}
                            {productos.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-3 py-6 text-slate-500">
                                        Sin productos detallados
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="ml-auto mb-5 w-full max-w-xs space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-600">Subtotal:</span>
                        <span className="font-semibold">{money(nota.subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t-2 border-slate-900 pt-3">
                        <span className="text-lg font-black">TOTAL:</span>
                        <span className="text-2xl font-black">{money(nota.total)}</span>
                    </div>
                </div>

                <div className="mb-6 rounded-lg bg-blue-50 px-4 py-3 text-center text-sm font-black text-blue-800 ring-1 ring-blue-100">
                    Método de pago: {nota.metodoPago || 'STRIPE'}
                </div>

                <div className="nota-venta-cliente-actions flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                    >
                        Imprimir
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotaVentaClienteModal;
