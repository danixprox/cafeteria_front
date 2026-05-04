import React from 'react';

const MapaMesas = ({ mesas, disponibilidad, mesaSeleccionada, onSeleccionarMesa }) => {
    // Si no hay disponibilidad calculada, se asume azul si la mesa está activa
    const getEstadoMesa = (mesaId) => {
        if (!disponibilidad) return 'disponible';
        
        const mesaInfo = disponibilidad.mesas?.find(m => m.id === mesaId);
        if (!mesaInfo) return 'disponible';
        
        return mesaInfo.disponible ? 'disponible' : 'reservada';
    };

    const getColor = (mesaId) => {
        const estado = getEstadoMesa(mesaId);
        if (estado === 'reservada') return 'bg-gray-400 cursor-not-allowed text-white';
        if (mesaSeleccionada === mesaId) return 'bg-green-500 text-white border-green-700 shadow-lg scale-105';
        return 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer shadow';
    };

    const handleSelect = (mesaId) => {
        if (getEstadoMesa(mesaId) === 'disponible') {
            onSeleccionarMesa(mesaId);
        }
    };

    return (
        <div className="w-full bg-slate-50 border rounded-lg p-6 my-4 shadow-inner relative" style={{ minHeight: '300px' }}>
            <h3 className="text-xl font-bold text-center mb-6 text-gray-700">Plano de Mesas</h3>
            
            <div className="relative w-full h-full">
                {mesas.map((mesa) => (
                    <div
                        key={mesa.id}
                        onClick={() => handleSelect(mesa.id)}
                        className={`absolute flex flex-col items-center justify-center rounded-lg transition-all duration-200 p-2 border-2 ${getColor(mesa.id)}`}
                        style={{
                            left: `${mesa.posicion_x}%`,
                            top: `${mesa.posicion_y}%`,
                            width: '80px',
                            height: '80px',
                            transform: 'translate(-50%, -50%)' // Para centrar la mesa en la coordenada exacta
                        }}
                    >
                        <span className="font-bold">{mesa.nombre}</span>
                        <span className="text-xs">Cap: {mesa.capacidad}</span>
                    </div>
                ))}
                
                {mesas.length === 0 && (
                    <div className="flex justify-center items-center h-full w-full text-gray-400">
                        No hay mesas configuradas en esta sala.
                    </div>
                )}
            </div>

            <div className="flex justify-center gap-6 mt-8 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-500 rounded"></div> <span className="text-sm">Disponible</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-400 rounded"></div> <span className="text-sm">Reservada</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded"></div> <span className="text-sm">Seleccionada</span></div>
            </div>
        </div>
    );
};

export default MapaMesas;
