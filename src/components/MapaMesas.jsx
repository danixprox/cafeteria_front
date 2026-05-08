import React from 'react';

const MapaMesas = ({ mesas, disponibilidad, mesaSeleccionada, onSeleccionarMesa }) => {

    const getEstadoMesa = (mesaId) => {
        if (!disponibilidad) return 'disponible';

        const mesaInfo = disponibilidad.mesas?.find(m => m.id === mesaId);
        if (!mesaInfo) return 'disponible';

        return mesaInfo.disponible ? 'disponible' : 'reservada';
    };

    const getColor = (mesaId) => {
        const estado = getEstadoMesa(mesaId);

        if (estado === 'reservada') {
            return 'bg-red-500 text-white border-red-700 cursor-not-allowed opacity-70';
        }

        if (mesaSeleccionada === mesaId) {
            return 'bg-green-600 text-white border-green-800 scale-110 ring-4 ring-green-300 shadow-xl';
        }

        return 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-105 transition transform cursor-pointer shadow-md hover:shadow-xl';
    };

    const handleSelect = (mesaId) => {
        if (getEstadoMesa(mesaId) === 'disponible') {
            onSeleccionarMesa(mesaId === mesaSeleccionada ? null : mesaId);
        }
    };

    const maxX = Math.max(...mesas.map(m => m.posicion_x));
    const maxY = Math.max(...mesas.map(m => m.posicion_y));


    return (
        <div className="w-full bg-white border-2 border-gray-300 rounded-2xl p-6 my-4 shadow-lg relative overflow-hidden">

            {/* GRID DE FONDO 🔥 */}
            <div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            ></div>

            <h3 className="text-2xl font-black text-center mb-6 text-gray-800 tracking-wide">
                Plano de Mesas
            </h3>

            {/* LEYENDA */}
            <div className="flex gap-6 justify-center mb-6 text-sm font-semibold">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded border-2 border-blue-600"></div>
                    <span>Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-500 rounded border-2 border-red-600"></div>
                    <span>Reservada</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-600 rounded border-2 border-green-700"></div>
                    <span>Seleccionada</span>
                </div>
            </div>



            <div className="relative w-full h-full" style={{ minHeight: '400px' }}>
                {mesas.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400 font-semibold">
                        No hay mesas disponibles
                    </div>
                ) : (
                    mesas.map((mesa) => (
                        <div
                            key={mesa.id}
                            onClick={() => handleSelect(mesa.id)}
                            className={`absolute flex flex-col items-center justify-center rounded-xl transition-all duration-200 p-2 border-2 font-bold ${getColor(mesa.id)} active:scale-95`}
                            style={{
                                left: `${((mesa.posicion_x / maxX) * 80)-5}%`,
                                top: `${((mesa.posicion_y / maxY) * 80)-30}%`,
                                width: '110px',
                                height: '110px',
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            <span className="text-lg">{mesa.nombre}</span>
                            <span className="text-sm opacity-90">{mesa.capacidad} pax</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MapaMesas;