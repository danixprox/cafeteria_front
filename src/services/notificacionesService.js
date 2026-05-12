const API = import.meta.env.VITE_API_URL;

export const obtenerNotificaciones = async () => {

    const res = await fetch(
        `${API}/api/notificaciones/`
    );

    return await res.json();
};

export const enviarNotificacion = async () => {

    const res = await fetch(
        `${API}/api/notificaciones/enviar/`,
        {
            method: "POST"
        }
    );

    return await res.json();
};

export const obtenerMisNotificaciones = async (clienteId) => {

    const res = await fetch(
        `${API}/api/notificaciones/mis-notificaciones/${clienteId}/`
    );

    return await res.json();
};