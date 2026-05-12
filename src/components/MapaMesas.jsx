import React from 'react';

const MapaMesas = ({ mesas, disponibilidad, mesaSeleccionada, onSeleccionarMesa }) => {
    // Determinar el estado de cada mesa según la disponibilidad del horario
    const getEstadoMesa = (mesaId) => {
        if (!disponibilidad) return 'disponible';

        const mesaInfo = disponibilidad.mesas?.find(m => m.id === mesaId);
        if (!mesaInfo) return 'disponible';

        return mesaInfo.disponible ? 'disponible' : 'reservada';
    };

    const handleSelect = (mesaId) => {
        if (getEstadoMesa(mesaId) === 'disponible') {
            onSeleccionarMesa(mesaId === mesaSeleccionada ? null : mesaId);
        }
    };

    // Distribuir mesas en una cuadrícula si todas están en (50,50) o superpuestas
    const mesasConPosicion = mesas.map((mesa, index) => {
        const todasMismaPosicion = mesas.every(
            m => m.posicion_x === mesas[0]?.posicion_x && m.posicion_y === mesas[0]?.posicion_y
        );

        if (todasMismaPosicion && mesas.length > 1) {
            const cols = Math.ceil(Math.sqrt(mesas.length));
            const row = Math.floor(index / cols);
            const col = index % cols;
            const totalRows = Math.ceil(mesas.length / cols);

            const paddingX = 15;
            const paddingY = 15;
            const usableX = 100 - paddingX * 2;
            const usableY = 100 - paddingY * 2;

            const spacingX = cols > 1 ? usableX / (cols - 1) : 0;
            const spacingY = totalRows > 1 ? usableY / (totalRows - 1) : 0;

            return {
                ...mesa,
                calcX: paddingX + col * (cols > 1 ? spacingX : 0) + (cols === 1 ? usableX / 2 : 0),
                calcY: paddingY + row * (totalRows > 1 ? spacingY : 0) + (totalRows === 1 ? usableY / 2 : 0),
            };
        }

        return {
            ...mesa,
            calcX: mesa.posicion_x,
            calcY: mesa.posicion_y,
        };
    });

    return (
        <div className="w-full">
            {/* LEYENDA */}
            <div className="flex flex-wrap justify-center gap-4 mb-4 px-2">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-sm shadow-sm"></div>
                    <span className="text-sm text-slate-600 font-medium">Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-300 rounded-sm shadow-sm"></div>
                    <span className="text-sm text-slate-600 font-medium">Reservada / No disponible</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-emerald-500 rounded-sm shadow-sm"></div>
                    <span className="text-sm text-slate-600 font-medium">Seleccionada</span>
                </div>
            </div>

            {/* PLANO DE MESAS */}
            <div 
                className="w-full bg-slate-100 border-2 border-slate-200 rounded-xl relative overflow-hidden"
                style={{ height: `${Math.max(400, Math.ceil(mesas.length / 3) * 140 + 80)}px` }}
            >
                {/* Título del plano */}
                <div className="absolute top-3 left-0 w-full text-center z-10 pointer-events-none">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Vista del plano de la sala
                    </span>
                </div>

                {/* Mesas */}
                {mesasConPosicion.map((mesa) => {
                    const estado = getEstadoMesa(mesa.id);
                    const esSeleccionada = mesaSeleccionada === mesa.id;
                    const esDisponible = estado === 'disponible';

                    let bgClass, borderClass, cursorClass, hoverClass;
                    if (esSeleccionada) {
                        bgClass = 'bg-emerald-500';
                        borderClass = 'border-emerald-700 ring-4 ring-emerald-200';
                        cursorClass = 'cursor-pointer';
                        hoverClass = '';
                    } else if (esDisponible) {
                        bgClass = 'bg-blue-500';
                        borderClass = 'border-blue-600';
                        cursorClass = 'cursor-pointer';
                        hoverClass = 'hover:bg-blue-600 hover:scale-105 hover:shadow-lg';
                    } else {
                        bgClass = 'bg-slate-300';
                        borderClass = 'border-slate-400';
                        cursorClass = 'cursor-not-allowed';
                        hoverClass = '';
                    }

                    return (
                        <div
                            key={mesa.id}
                            onClick={() => handleSelect(mesa.id)}
                            className={`absolute flex flex-col items-center justify-center rounded-xl border-2 shadow-md text-white transition-all duration-200 select-none
                                ${bgClass} ${borderClass} ${cursorClass} ${hoverClass}
                                ${esSeleccionada ? 'scale-110 z-20' : 'z-10'}
                            `}
                            style={{
                                left: `${mesa.calcX}%`,
                                top: `${mesa.calcY}%`,
                                width: '76px',
                                height: '76px',
                                transform: 'translate(-50%, -50%)',
                            }}
                            title={esDisponible ? `${mesa.nombre} — Capacidad: ${mesa.capacidad} — Click para seleccionar` : `${mesa.nombre} — No disponible`}
                        >
                            <span className="font-bold text-sm leading-tight">{mesa.nombre}</span>
                            <span className="text-[10px] opacity-90">{mesa.capacidad} pax</span>
                            {esSeleccionada && (
                                <span className="text-[9px] font-black mt-0.5">✓ ELEGIDA</span>
                            )}
                        </div>
                    );
                })}
                
                {mesas.length === 0 && (
                    <div className="flex justify-center items-center h-full w-full text-slate-400 font-semibold">
                        No hay mesas configuradas en esta sala.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapaMesas;