import db from "../config/db.js";

export const getAdmi = async () => {
  const query = `
    SELECT u.*, i.imagen_producto as imagen_perfil 
    FROM usuario u
    LEFT JOIN imagen i ON u.ID_Usuario = i.ID_Usuario
    WHERE u.ROLID_ROL = 1
  `;
  const [result] = await db.promise().execute(query);
  return result;
};

// Crear un nuevo administrador (devuelve el ID del usuario creado)
export const createAdmi = async ({ nombre, apellido, correo, nombre_usuario, contrasena_usuario, ROLID_ROL }) => {
  if (ROLID_ROL !== 1) {
    throw new Error("Solo se pueden registrar administradores");
  }

  const createUserQuery = `
    INSERT INTO usuario (nombre, apellido, correo, nombre_usuario, contrasena_usuario, ROLID_ROL)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  try {
    const [result] = await db.promise().execute(createUserQuery, [
      nombre, 
      apellido, 
      correo, 
      nombre_usuario, 
      contrasena_usuario, 
      ROLID_ROL
    ]);
    return { usuarioId: result.insertId };
  } catch (error) {
    console.error("Error al crear administrador:", error);
    throw new Error("No se pudo crear el administrador.");
  }
};

// Actualizar un administrador
export const updateAdmi = async (ID_Usuario, { nombre, apellido, correo, nombre_usuario, contrasena_usuario, ROLID_ROL }) => {
  if (ROLID_ROL !== 1) {
    throw new Error("Solo se pueden actualizar administradores");
  }

  const query = `
    UPDATE usuario 
    SET nombre = ?, apellido = ?, correo = ?, nombre_usuario = ?, contrasena_usuario = ?
    WHERE ID_Usuario = ? AND ROLID_ROL = 1
  `;

  try {
    const [result] = await db.promise().execute(query, [
      nombre, 
      apellido, 
      correo, 
      nombre_usuario, 
      contrasena_usuario, 
      ID_Usuario
    ]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error al actualizar el administrador:", error);
    throw new Error("No se pudo actualizar el administrador.");
  }
};

// Eliminar un administrador
export const deleteAdmi = async (ID_Usuario) => {
  const query = "DELETE FROM usuario WHERE ID_Usuario = ? AND ROLID_ROL = 1";

  try {
    const [result] = await db.promise().execute(query, [ID_Usuario]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error al eliminar el administrador:", error);
    throw new Error("No se pudo eliminar el administrador.");
  }
};

// Nuevo método para manejar la imagen del administrador
export const handleAdmiImage = async (ID_Usuario, imagen, nombre, apellido) => {
  try {
    // Verificar si ya existe una imagen
    const [existingImage] = await db.promise().execute(
      'SELECT * FROM imagen WHERE ID_Usuario = ?',
      [ID_Usuario]
    );

    if (existingImage.length > 0) {
      // Actualizar imagen existente
      const [result] = await db.promise().execute(
        'UPDATE imagen SET imagen_producto = ?, descripcion = ? WHERE ID_Usuario = ?',
        [imagen.filename, `Imagen de perfil de ${nombre} ${apellido}`, ID_Usuario]
      );
      return result.affectedRows > 0;
    } else {
      // Insertar nueva imagen
      const [result] = await db.promise().execute(
        'INSERT INTO imagen (imagen_producto, descripcion, ID_Usuario) VALUES (?, ?, ?)',
        [imagen.filename, `Imagen de perfil de ${nombre} ${apellido}`, ID_Usuario]
      );
      return result.affectedRows > 0;
    }
  } catch (error) {
    console.error("Error al manejar la imagen del administrador:", error);
    throw new Error("No se pudo manejar la imagen del administrador.");
  }
};