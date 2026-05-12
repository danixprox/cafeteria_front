const API = import.meta.env.VITE_API_URL;

export const obtenerPendientes = async () => {

    const res = await fetch(
        `${API}/api/asistencia/pendientes/`
    );

    return await res.json();
};

export const realizarCheckin = async (id) => {

    const res = await fetch(
        `${API}/api/asistencia/checkin/${id}/`
    );

    return await res.json();
};

export const marcarNoAsistio = async (id) => {

    const res = await fetch(
        `${API}/api/asistencia/no-asistio/${id}/`
    );

    return await res.json();
};