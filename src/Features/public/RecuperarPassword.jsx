import { useState, useEffect } from "react";
import {
  recuperarPassword,
  verificarCodigo,
  nuevaPassword,
} from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function RecuperarPassword() {
  const [paso, setPaso] = useState(1);
  const [correo, setCorreo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [tiempoRestante, setTiempoRestante] = useState(0);

  const navigate = useNavigate();

  // ⏱ contador
  useEffect(() => {
    if (tiempoRestante <= 0) return;

    const timer = setInterval(() => {
      setTiempoRestante((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [tiempoRestante]);

  const formatearTiempo = (segundos) => {
    const min = Math.floor(segundos / 60);
    const sec = segundos % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  // PASO 1
  const handleCorreo = async () => {
    if (!correo) {
      setMensaje("Por favor ingresa tu correo");
      return;
    }

    try {
      await recuperarPassword(correo);
      setMensaje("Revisa tu bandeja de entrada o spam 📩");
      setPaso(2);
      setTiempoRestante(60); // 🔥 inicia contador
    } catch (e) {
      setMensaje(e.message);
    }
  };

  // 🔁 REENVIAR
  const reenviarCodigo = async () => {
    try {
      await recuperarPassword(correo);
      setMensaje("Código reenviado 📩");
      setTiempoRestante(60);
    } catch (e) {
      setMensaje(e.message);
    }
  };

  // PASO 2
  const handleCodigo = async () => {
    if (!codigo || codigo.trim().length === 0) {
      setMensaje("Ingresa el código");
      return;
    }

    try {
      const res = await verificarCodigo(correo, codigo);

      if (res.error) {
        setMensaje(res.error);
        return;
      }

      setMensaje("Código correcto ✅");
      setPaso(3);
    } catch {
      setMensaje("Código incorrecto");
    }
  };

  // PASO 3
  const handlePassword = async () => {
    if (!password || password.trim().length === 0) {
      setMensaje("Ingresa una contraseña");
      return;
    }

    try {
      const res = await nuevaPassword(correo, password);

      if (res.error) {
        setMensaje(res.error);
        return;
      }

      setMensaje("Contraseña actualizada 🔐");
      setTimeout(() => navigate("/login"), 1500);
    } catch (e) {
      setMensaje(e.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md">

        <h2 className="text-2xl font-semibold text-center text-slate-900 mb-6">
          Recuperar contraseña
        </h2>

        {mensaje && (
          <p className="text-sm text-center text-slate-600 mb-4">
            {mensaje}
          </p>
        )}

        {/* PASO 1 */}
        {paso === 1 && (
          <>
            <input
              type="email"
              placeholder="Correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full mb-4 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />

            <button
              onClick={handleCorreo}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition"
            >
              Enviar código
            </button>
          </>
        )}

        {/* PASO 2 */}
        {paso === 2 && (
          <>
            <input
              type="text"
              placeholder="Código"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="w-full mb-4 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />

            <button
              onClick={handleCodigo}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition mb-3"
            >
              Verificar código
            </button>

            <button
              onClick={reenviarCodigo}
              disabled={tiempoRestante > 0}
              className="w-full bg-amber-600 text-white py-2 rounded-xl text-sm hover:bg-amber-700 transition disabled:bg-slate-300"
            >
              {tiempoRestante > 0
                ? `Reenviar en ${formatearTiempo(tiempoRestante)}`
                : "Reenviar código"}
            </button>
          </>
        )}

        {/* PASO 3 */}
        {paso === 3 && (
          <>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-4 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />

            <button
              onClick={handlePassword}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition"
            >
              Cambiar contraseña
            </button>
          </>
        )}
      </div>
    </div>
  );
}