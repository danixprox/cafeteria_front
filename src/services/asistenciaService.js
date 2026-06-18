import api from './axiosClient';

export const obtenerPendientes = async () => {
    const res = await api.get('/asistencia/pendientes/');
    return res.data;
};

export const realizarCheckin = async (id) => {
    const res = await api.patch(`/asistencia/checkin/${id}/`);
    return res.data;
};

export const marcarNoAsistio = async (id) => {
    const res = await api.patch(`/asistencia/no-asistio/${id}/`);
    return res.data;
};
