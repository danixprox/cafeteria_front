import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, rolesPermitidos }) => {
  const token = localStorage.getItem('token');
  let rol = localStorage.getItem('rol_usuario');

  // 🔧 limpiar rol
  rol = rol ? rol.toLowerCase().trim() : '';

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const tienePermiso = rolesPermitidos.some(r =>
    rol.includes(r)
  );

  if (!tienePermiso) {
    return <Navigate to="/cliente" replace />;
  }

  return children;
};

export default ProtectedRoute;