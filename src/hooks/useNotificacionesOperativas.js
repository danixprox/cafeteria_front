import { useCallback, useEffect, useState } from 'react';
import { notificacionesOperativasService } from '../services/notificacionesOperativasService';

const useNotificacionesOperativas = (intervaloMs = 10000) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await notificacionesOperativasService.listar();
      setNotificaciones(Array.isArray(res.data?.results) ? res.data.results : []);
      setNoLeidas(res.data?.no_leidas || 0);
      setError('');
    } catch {
      setError('No se pudieron actualizar los avisos.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const inicial = setTimeout(cargar, 0);
    const intervalo = setInterval(cargar, intervaloMs);
    return () => {
      clearTimeout(inicial);
      clearInterval(intervalo);
    };
  }, [cargar, intervaloMs]);

  const marcarLeida = async (notificacion) => {
    if (notificacion.leido) return;
    await notificacionesOperativasService.marcarLeida(notificacion.id);
    setNotificaciones((actuales) => actuales.map((item) => (
      item.id === notificacion.id ? { ...item, leido: true } : item
    )));
    setNoLeidas((actual) => Math.max(0, actual - 1));
  };

  return { notificaciones, noLeidas, cargando, error, cargar, marcarLeida };
};

export default useNotificacionesOperativas;
