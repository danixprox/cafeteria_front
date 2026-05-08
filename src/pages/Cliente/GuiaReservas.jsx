import React from 'react';
import { useNavigate } from 'react-router-dom';

const GuiaReservas = () => {
    const navigate = useNavigate();

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen bg-slate-50">
            <h1 className="text-4xl font-black text-slate-800 mb-2">Cómo Hacer una Reserva</h1>
            <p className="text-slate-600 mb-8 text-lg">Sigue estos pasos simples para reservar tu mesa</p>

            <div className="space-y-6">
                {/* Paso 1 */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black text-lg">1</div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Selecciona una Sala</h2>
                            <p className="text-slate-600 mb-3">Ve a la sección de "Salas" y explora nuestras opciones temáticas. Elige la que más te guste según la ocasión y temática que prefieras.</p>
                            <button
                                onClick={() => navigate('/cliente/salas')}
                                className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-bold hover:bg-indigo-200 transition"
                            >
                                Ver Salas →
                            </button>
                        </div>
                    </div>
                </div>

                {/* Paso 2 */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black text-lg">2</div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Elige la Fecha</h2>
                            <p className="text-slate-600">Una vez dentro de la sala, selecciona la fecha en la que deseas hacer tu reserva. Solo puedes reservar en fechas futuras.</p>
                        </div>
                    </div>
                </div>

                {/* Paso 3 */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black text-lg">3</div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Selecciona el Horario</h2>
                            <p className="text-slate-600 mb-2">Elige el horario que prefieras. Se mostrarán los horarios disponibles para la fecha seleccionada:</p>
                            <ul className="text-slate-600 text-sm space-y-1 ml-4">
                                <li>• 10:00 - 11:30</li>
                                <li>• 11:30 - 13:00</li>
                                <li>• 13:00 - 14:30</li>
                                <li>• 14:30 - 16:00</li>
                                <li>• 16:00 - 17:30</li>
                                <li>• 17:30 - 19:00</li>
                                <li>• 19:00 - 20:30</li>
                                <li>• 20:30 - 22:00</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Paso 4 */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black text-lg">4</div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Selecciona tu Mesa</h2>
                            <p className="text-slate-600 mb-3">En el plano interactivo verás todas las mesas. El color indica su disponibilidad:</p>
                            <div className="space-y-2 ml-4 text-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-blue-500 rounded border-2 border-blue-600"></div>
                                    <span>Disponible - Haz clic para seleccionar</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-red-500 rounded border-2 border-red-600"></div>
                                    <span>No disponible - Ya está reservada</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-green-600 rounded border-2 border-green-700"></div>
                                    <span>Seleccionada - Tu mesa</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Paso 5 */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black text-lg">5</div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Confirma los Detalles</h2>
                            <p className="text-slate-600 mb-3">Antes de confirmar, especifica la cantidad de personas que asistirán. Asegúrate de que sea menor o igual a la capacidad de la mesa.</p>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                                <strong>Importante:</strong> Verifica que hayas seleccionado fecha, horario y mesa antes de confirmar.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Paso 6 */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-black text-lg">✓</div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Reserva Confirmada!</h2>
                            <p className="text-slate-600 mb-3">Tu reserva será creada con estado "Pendiente" y aparecerá en tu sección "Mis Reservas".</p>
                            <button
                                onClick={() => navigate('/cliente/mis-reservas')}
                                className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold hover:bg-green-200 transition"
                            >
                                Ver Mis Reservas →
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección de Cancelación */}
            <div className="mt-12">
                <h2 className="text-3xl font-bold text-slate-800 mb-4">Cancelar una Reserva</h2>
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 md:p-8">
                    <p className="text-slate-700 mb-4">
                        En la sección "Mis Reservas" puedes cancelar cualquier reserva que esté en estado <strong>Pendiente</strong> o <strong>Confirmada</strong>.
                    </p>
                    <div className="bg-white rounded-lg p-4 text-sm text-slate-600 space-y-2">
                        <p>✓ Cuando canceles, la mesa quedará disponible para otros clientes</p>
                        <p>✓ Las reservas en otros estados (en curso, finalizada, etc.) no pueden ser canceladas</p>
                        <p>✓ Se te pedirá confirmación antes de proceder con la cancelación</p>
                    </div>
                </div>
            </div>

            {/* CTA Final */}
            <div className="mt-12 text-center pb-12">
                <button
                    onClick={() => navigate('/cliente/salas')}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition text-lg shadow-md"
                >
                    Comienza a Reservar Ahora
                </button>
            </div>
        </div>
    );
};

export default GuiaReservas;
