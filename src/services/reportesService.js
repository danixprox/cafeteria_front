import api from './axiosClient';

export const getReporteEstatico = (params = {}) => (
    api.get('/finanzas/reportes/estatico/', { params })
);

export const getReporteDinamico = (params = {}) => (
    api.get('/finanzas/reportes/dinamico/', { params })
);

export const generarReporteVoz = (data) => (
    api.post('/finanzas/reportes/voz/', data)
);

export const reportesService = {
    getReporteEstatico,
    getReporteDinamico,
    generarReporteVoz
};

export default reportesService;
