import axiosClient from './axiosClient';

export const obtenerNotificaciones = async () => {
    const res = await axiosClient.get('/notificaciones/');
    return res.data;
};

export const enviarNotificacion = async (payload) => {
    const res = await axiosClient.post('/notificaciones/enviar/', payload);
    return res.data;
};

export const obtenerMisNotificaciones = async () => {
    const res = await axiosClient.get('/notificaciones/mis/');
    return res.data;
};

export const contarNoLeidas = async () => {
    const res = await axiosClient.get('/notificaciones/count/');
    return res.data;
};

export const marcarLeido = async (id) => {
    const res = await axiosClient.post(`/notificaciones/${id}/marcar-leido/`);
    return res.data;
};