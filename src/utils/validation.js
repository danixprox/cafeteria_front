/**
 * Validaciones de formularios según los modelos del backend
 */

// Constantes de validación
const NOMBRE_MIN = 3;
const NOMBRE_MAX = 50;
const CORREO_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTRASENA_MIN = 8;

/**
 * Validar nombre
 * @param {string} nombre
 * @returns {Object} {valido, errores}
 */
export const validarNombre = (nombre) => {
  const errores = [];

  if (!nombre || nombre.trim().length === 0) {
    errores.push('El nombre es requerido');
  } else if (nombre.trim().length < NOMBRE_MIN) {
    errores.push(`El nombre debe tener mínimo ${NOMBRE_MIN} caracteres`);
  } else if (nombre.trim().length > NOMBRE_MAX) {
    errores.push(`El nombre no puede exceder ${NOMBRE_MAX} caracteres`);
  }

  return {
    valido: errores.length === 0,
    errores,
  };
};

/**
 * Validar email
 * @param {string} correo
 * @returns {Object} {valido, errores}
 */
export const validarCorreo = (correo) => {
  const errores = [];

  if (!correo || correo.trim().length === 0) {
    errores.push('El correo es requerido');
  } else if (!CORREO_REGEX.test(correo)) {
    errores.push('Ingresa un correo válido (ej: usuario@ejemplo.com)');
  } else if (correo.length > 60) {
    errores.push('El correo no puede exceder 60 caracteres');
  }

  return {
    valido: errores.length === 0,
    errores,
  };
};

/**
 * Validar contraseña
 * Backend acepta cualquier contraseña, pero es buena práctica validar
 * @param {string} contrasena
 * @returns {Object} {valido, errores, requisitos}
 */
export const validarContrasena = (contrasena) => {
  const errores = [];
  const requisitos = {
    longitud: contrasena && contrasena.length >= CONTRASENA_MIN,
    mayuscula: contrasena && /[A-Z]/.test(contrasena),
    minuscula: contrasena && /[a-z]/.test(contrasena),
    numero: contrasena && /[0-9]/.test(contrasena),
    especial: contrasena && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(contrasena),
  };

  if (!contrasena || contrasena.length === 0) {
    errores.push('La contraseña es requerida');
  } else if (!requisitos.longitud) {
    errores.push(`La contraseña debe tener mínimo ${CONTRASENA_MIN} caracteres`);
  }

  // Para un registro más seguro, exigir todos los requisitos
  if (!requisitos.mayuscula) {
    errores.push('Debe contener al menos una mayúscula (A-Z)');
  }
  if (!requisitos.minuscula) {
    errores.push('Debe contener al menos una minúscula (a-z)');
  }
  if (!requisitos.numero) {
    errores.push('Debe contener al menos un número (0-9)');
  }
  if (!requisitos.especial) {
    errores.push('Debe contener al menos un carácter especial (!@#$%^&*)');
  }

  return {
    valido: errores.length === 0,
    errores,
    requisitos,
  };
};

/**
 * Validar confirmación de contraseña
 * @param {string} contrasena
 * @param {string} confirmar
 * @returns {Object} {valido, errores}
 */
export const validarConfirmacionContrasena = (contrasena, confirmar) => {
  const errores = [];

  if (contrasena !== confirmar) {
    errores.push('Las contraseñas no coinciden');
  }

  return {
    valido: errores.length === 0,
    errores,
  };
};

/**
 * Validar formulario de login
 * @param {string} correo
 * @param {string} contrasena
 * @returns {Object} {valido, errores}
 */
export const validarLogin = (correo, contrasena) => {
  const errores = [];

  if (!correo || correo.trim().length === 0) {
    errores.push('El correo es requerido');
  }

  if (!contrasena || contrasena.length === 0) {
    errores.push('La contraseña es requerida');
  }

  return {
    valido: errores.length === 0,
    errores,
  };
};

/**
 * Validar formulario de registro
 * @param {Object} datos - {nombre, correo, contrasena, confirmarContrasena, codRol}
 * @returns {Object} {valido, errores}
 */
export const validarRegistro = (datos) => {
  const errores = {};

  // Validar nombre
  const validacionNombre = validarNombre(datos.nombre);
  if (!validacionNombre.valido) {
    errores.nombre = validacionNombre.errores[0];
  }

  // Validar correo
  const validacionCorreo = validarCorreo(datos.correo);
  if (!validacionCorreo.valido) {
    errores.correo = validacionCorreo.errores[0];
  }

  // Validar contraseña
  const validacionContrasena = validarContrasena(datos.contrasena);
  if (!validacionContrasena.valido) {
    errores.contrasena = validacionContrasena.errores[0];
  }

  // Validar confirmación
  const validacionConfirmacion = validarConfirmacionContrasena(
    datos.contrasena,
    datos.confirmarContrasena
  );
  if (!validacionConfirmacion.valido) {
    errores.confirmarContrasena = validacionConfirmacion.errores[0];
  }

  // Validar rol
  if (!datos.codRol || datos.codRol.trim().length === 0) {
    errores.codRol = 'El rol es requerido';
  }

  return {
    valido: Object.keys(errores).length === 0,
    errores,
  };
};

/**
 * Obtener requisitos de contraseña
 * @param {string} contrasena
 * @returns {Object}
 */
export const obtenerRequisitos = (contrasena) => {
  return {
    longitud: contrasena && contrasena.length >= CONTRASENA_MIN,
    mayuscula: contrasena && /[A-Z]/.test(contrasena),
    minuscula: contrasena && /[a-z]/.test(contrasena),
    numero: contrasena && /[0-9]/.test(contrasena),
    especial: contrasena && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(contrasena),
  };
};
