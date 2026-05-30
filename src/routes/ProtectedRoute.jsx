import { Navigate } from 'react-router-dom';

const getRedirectPath = (rol) => {
  switch (rol) {
    case 'admin':
      return '/admin';
    case 'cocinero':
      return '/cocinero/comandas';
    case 'mesero':
    case 'emp':
      return '/empleado';
    case 'cliente':
      return '/cliente';
    default:
      return '/login';
  }
};

const ProtectedRoute = ({ children, rolesPermitidos }) => {
  const token = localStorage.getItem('token');
  let rol = localStorage.getItem('rol_usuario');

  rol = rol ? rol.toLowerCase().trim() : '';

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!rolesPermitidos.includes(rol)) {
    return <Navigate to={getRedirectPath(rol)} replace />;
  }

  return children;
};

export default ProtectedRoute;