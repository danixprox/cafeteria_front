import { Search, UserRound, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { notificacionesOperativasService } from '../services/notificacionesOperativasService';

const ClientePedidoSelector = ({ value, onChange, disabled = false }) => {
  const [modo, setModo] = useState(value?.cliente_id ? 'registrado' : 'presencial');
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (modo !== 'registrado' || busqueda.trim().length < 2) {
      setResultados([]);
      return undefined;
    }
    const timer = setTimeout(async () => {
      setCargando(true);
      try {
        const res = await notificacionesOperativasService.buscarClientes(busqueda);
        setResultados(Array.isArray(res.data) ? res.data : []);
      } catch {
        setResultados([]);
      } finally {
        setCargando(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [busqueda, modo]);

  const cambiarModo = (nuevoModo) => {
    setModo(nuevoModo);
    setBusqueda('');
    setResultados([]);
    onChange(
      nuevoModo === 'registrado'
        ? { cliente_id: null, nombre_cliente: '' }
        : { cliente_id: null, nombre_cliente: 'Cliente presencial' },
    );
  };

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-700">Identificación</p>
        <h3 className="mt-2 text-xl font-black text-slate-900">¿A nombre de quién es el pedido?</h3>
        <p className="mt-1 text-sm text-slate-500">Puedes asociarlo a una cuenta o usar un nombre de atención.</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => cambiarModo('presencial')}
          className={`rounded-2xl border p-4 text-left transition ${modo === 'presencial' ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}
        >
          <UsersRound size={20} className="text-amber-700" />
          <p className="mt-2 font-bold text-slate-900">Cliente presencial</p>
          <p className="text-xs text-slate-500">No necesita estar registrado.</p>
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => cambiarModo('registrado')}
          className={`rounded-2xl border p-4 text-left transition ${modo === 'registrado' ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-slate-50'}`}
        >
          <UserRound size={20} className="text-indigo-700" />
          <p className="mt-2 font-bold text-slate-900">Cliente registrado</p>
          <p className="text-xs text-slate-500">Busca por nombre o correo.</p>
        </button>
      </div>

      {modo === 'presencial' ? (
        <label className="mt-4 block text-sm font-semibold text-slate-700">
          Nombre para atención
          <input
            disabled={disabled}
            value={value?.nombre_cliente || ''}
            onChange={(e) => onChange({ cliente_id: null, nombre_cliente: e.target.value })}
            placeholder="Ej. Juan o Cliente presencial"
            maxLength={100}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
          />
        </label>
      ) : (
        <div className="relative mt-4">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            disabled={disabled}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Escribe al menos 2 letras..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
          {(cargando || resultados.length > 0) && (
            <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              {cargando ? (
                <p className="p-4 text-sm text-slate-500">Buscando clientes...</p>
              ) : (
                resultados.map((cliente) => (
                  <button
                    type="button"
                    key={cliente.id}
                    onClick={() => {
                      onChange({ cliente_id: cliente.id, nombre_cliente: cliente.nombre });
                      setBusqueda(cliente.nombre);
                      setResultados([]);
                    }}
                    className="block w-full border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-indigo-50"
                  >
                    <p className="font-semibold text-slate-900">{cliente.nombre}</p>
                    <p className="text-xs text-slate-500">{cliente.correo}</p>
                  </button>
                ))
              )}
            </div>
          )}
          {value?.cliente_id && (
            <p className="mt-2 text-sm font-semibold text-emerald-700">Seleccionado: {value.nombre_cliente}</p>
          )}
        </div>
      )}
    </section>
  );
};

export default ClientePedidoSelector;
