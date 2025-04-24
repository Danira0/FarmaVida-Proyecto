import db from '../config/db.js';

export const getUserById = async (userId) => {
  const query = 'SELECT * FROM usuario WHERE ID_Usuario = ?';
  try {
    const [results] = await db.promise().execute(query, [userId]);
    return results[0] || null;
  } catch (error) {
    console.error("Error al buscar usuario por ID:", error);
    return null;
  }
};

export const createUser = async ({
  nombre,
  apellido,
  correo,
  nombre_usuario,
  contrasena_usuario,
  ROLID_ROL,
}) => {
  const createUserQuery = `
    INSERT INTO usuario (nombre, apellido, correo, nombre_usuario, contrasena_usuario, ROLID_ROL)
    VALUES (?, ?, ?, ?, ?, ?)`;

  try {
    const [result] = await db.promise().execute(createUserQuery, [
      nombre,
      apellido,
      correo,
      nombre_usuario,
      contrasena_usuario,
      ROLID_ROL,
    ]);

    return { usuarioId: result.insertId };
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return { error: true, message: error.message };
  }
};

export const getUserByEmail = async (correo) => {
  const query = 'SELECT * FROM usuario WHERE correo = ?';
  try {
    const [results] = await db.promise().execute(query, [correo]);
    return results[0] || null;
  } catch (error) {
    console.error("Error al buscar usuario por email:", error);
    return null;
  }
};

export const savePasswordResetToken = async (userId, token, expiration) => {
  const query = 'UPDATE usuario SET reset_token = ?, reset_token_expires = ? WHERE ID_Usuario = ?';
  try {
    await db.promise().execute(query, [token, expiration, userId]);
    return true;
  } catch (error) {
    console.error("Error al guardar token de recuperación:", error);
    return false;
  }
};

export const getUserByResetToken = async (token) => {
  const query = 'SELECT * FROM usuario WHERE reset_token = ? AND reset_token_expires > NOW()';
  try {
    const [results] = await db.promise().execute(query, [token]);
    return results[0] || null;
  } catch (error) {
    console.error("Error al buscar usuario por token:", error);
    return null;
  }
};

export const updateUserPassword = async (userId, newPassword) => {
  const query = 'UPDATE usuario SET contrasena_usuario = ?, reset_token = NULL, reset_token_expires = NULL WHERE ID_Usuario = ?';
  try {
    await db.promise().execute(query, [newPassword, userId]);
    return true;
  } catch (error) {
    console.error("Error al actualizar contraseña:", error);
    return false;
  }
};