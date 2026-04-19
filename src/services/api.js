const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Servicio único para conectar con el backend
 * Todos los endpoints de la API están centralizados aquí
 */

// ======================== AUTENTICACIÓN ========================

/**
 * Login del usuario
 * @param {string} correo - Email del usuario
 * @param {string} contrasena - Contraseña en texto plano
 * @returns {Promise} Datos del usuario autenticado
 */
export const login = async (correo, contrasena) => {
  try {
    const response = await fetch(`${API_URL}/api/usuarios/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        correo,
        contrasena,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al iniciar sesión');
    }

    return data;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

/**
 * Logout del usuario
 * @returns {Promise}
 */
export const logout = async () => {
  try {
    const response = await fetch(`${API_URL}/api/usuarios/logout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al cerrar sesión');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en logout:', error);
    throw error;
  }
};

/**
 * Registro de nuevo usuario
 * @param {Object} userData - {nombre, correo, contrasena, cod_rol}
 * @returns {Promise} Datos del usuario creado
 */
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

/**
 * Obtener lista de todos los usuarios
 * @returns {Promise} Array de usuarios
 */
export const obtenerUsuarios = async () => {
  try {
    const response = await fetch(`${API_URL}/api/usuarios/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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

/**
 * Obtener datos de un usuario específico
 * @param {number} usuarioId - ID del usuario
 * @returns {Promise} Datos del usuario
 */
export const obtenerUsuario = async (usuarioId) => {
  try {
    const response = await fetch(`${API_URL}/api/usuarios/${usuarioId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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

/**
 * Actualizar datos de un usuario
 * @param {number} usuarioId - ID del usuario
 * @param {Object} userData - Datos a actualizar
 * @returns {Promise}
 */
export const actualizarUsuario = async (usuarioId, userData) => {
  try {
    const response = await fetch(`${API_URL}/api/usuarios/${usuarioId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
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

/**
 * Eliminar un usuario
 * @param {number} usuarioId - ID del usuario
 * @returns {Promise}
 */
export const eliminarUsuario = async (usuarioId) => {
  try {
    const response = await fetch(`${API_URL}/api/usuarios/${usuarioId}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
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

/**
 * Asignar rol a un usuario
 * @param {number} usuarioId - ID del usuario
 * @param {string} codRol - Código del rol
 * @returns {Promise}
 */
export const asignarRol = async (usuarioId, codRol) => {
  try {
    const response = await fetch(`${API_URL}/api/usuarios/${usuarioId}/rol/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
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

/**
 * Obtener lista de roles disponibles
 * @returns {Promise} Array de roles
 */
export const obtenerRoles = async () => {
  try {
    const response = await fetch(`${API_URL}/api/roles/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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

/**
 * Obtener lista de empleados
 * @returns {Promise} Array de empleados
 */
export const obtenerEmpleados = async () => {
  try {
    const response = await fetch(`${API_URL}/api/empleados/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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

/**
 * Obtener detalle de un empleado
 * @param {number} empleadoId - ID del empleado
 * @returns {Promise}
 */
export const obtenerEmpleado = async (empleadoId) => {
  try {
    const response = await fetch(`${API_URL}/api/empleados/${empleadoId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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

/**
 * Obtener lista de clientes
 * @returns {Promise} Array de clientes
 */
export const obtenerClientes = async () => {
  try {
    const response = await fetch(`${API_URL}/api/clientes/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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

/**
 * Obtener detalle de un cliente
 * @param {number} clienteId - ID del cliente
 * @returns {Promise}
 */
export const obtenerCliente = async (clienteId) => {
  try {
    const response = await fetch(`${API_URL}/api/clientes/${clienteId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
