const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * HEADERS CON TOKEN AUTOMÁTICO
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');

  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// ======================== AUTENTICACIÓN ========================

export const login = async (correo, contrasena) => {
  try {
    const response = await fetch(`${API_URL}/api/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ correo, contrasena }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al iniciar sesión');
    }

    // 🔐 Guardar token
    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    return data;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await fetch(`${API_URL}/api/logout/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    localStorage.removeItem('token');

    if (!response.ok) {
      throw new Error('Error al cerrar sesión');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en logout:', error);
    throw error;
  }
};

export const registro = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/api/usuarios/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al registrar usuario');
    }

    return data;
  } catch (error) {
    console.error('Error en registro:', error);
    throw error;
  }
};

// ======================== USUARIOS ========================

export const obtenerUsuarios = async () => {
  try {
    const response = await fetch(`${API_URL}/api/usuarios/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener usuarios');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en obtenerUsuarios:', error);
    throw error;
  }
};

export const obtenerUsuario = async (usuarioId) => {
  try {
    const response = await fetch(`${API_URL}/api/usuarios/${usuarioId}/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener usuario');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en obtenerUsuario:', error);
    throw error;
  }
};

export const actualizarUsuario = async (usuarioId, userData) => {
  try {
    const response = await fetch(`${API_URL}/api/usuarios/${usuarioId}/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar usuario');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en actualizarUsuario:', error);
    throw error;
  }
};

export const eliminarUsuario = async (usuarioId) => {
  try {
    const response = await fetch(`${API_URL}/api/usuarios/${usuarioId}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al eliminar usuario');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en eliminarUsuario:', error);
    throw error;
  }
};

export const asignarRol = async (usuarioId, codRol) => {
  try {
    const response = await fetch(`${API_URL}/api/usuarios/${usuarioId}/rol/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ cod_rol: codRol }),
    });

    if (!response.ok) {
      throw new Error('Error al asignar rol');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en asignarRol:', error);
    throw error;
  }
};

// ======================== ROLES ========================

export const obtenerRoles = async () => {
  try {
    const response = await fetch(`${API_URL}/api/roles/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener roles');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en obtenerRoles:', error);
    throw error;
  }
};

// ======================== EMPLEADOS ========================

export const obtenerEmpleados = async () => {
  try {
    const response = await fetch(`${API_URL}/api/empleados/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener empleados');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en obtenerEmpleados:', error);
    throw error;
  }
};

export const obtenerEmpleado = async (empleadoId) => {
  try {
    const response = await fetch(`${API_URL}/api/empleados/${empleadoId}/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener empleado');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en obtenerEmpleado:', error);
    throw error;
  }
};

// ======================== CLIENTES ========================

export const obtenerClientes = async () => {
  try {
    const response = await fetch(`${API_URL}/api/clientes/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener clientes');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en obtenerClientes:', error);
    throw error;
  }
};

export const obtenerCliente = async (clienteId) => {
  try {
    const response = await fetch(`${API_URL}/api/clientes/${clienteId}/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener cliente');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en obtenerCliente:', error);
    throw error;
  }
};