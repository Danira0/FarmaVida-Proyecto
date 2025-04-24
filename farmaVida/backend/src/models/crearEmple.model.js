import db from "../config/db.js";

export const getEmpleados = async () => {
  const query = "SELECT * FROM usuario WHERE ROLIDROL_ROL = 2";
  const [result] = await db.promise().execute(query);
  return result;
};

export const createEmple = async ({
  nombre,
  apellido,
  correo,
  nombre_usuario,
  contrasena_usuario,
  ROLID_ROL,
}) => {
  if (ROLID_ROL !== 2) {
    throw new Error("Solo se puede registrar Empleados");
  }

  const createEmpleQuery = `INSERT INTO usuario 
      (   nombre,
          apellido,
          correo,
          nombre_usuario,
          contrasena_usuario,
          ROLID_ROL )  VALUES (?,?,?,?,?,?)`;

  try {
    const [result] = await db
      .promise()
      .execute(createEmpleQuery, [
        nombre,
        apellido,
        correo,
        nombre_usuario,
        contrasena_usuario,
        ROLID_ROL,
      ]);
    return { usuarioId: result.insertId };
  } catch (error) {
    console.error("Error al crear Empleado:", error);
    throw new Error("No se pudo crear el Empleado.");
  }
};

export const updateEmple = async (
  ID_Usuario,
  { nombre, apellido, correo, nombre_usuario, contrasena_usuario, ROLID_ROL }
) => {
  const query = `UPDATE usuario SET
      nombre = ?,
              apellido = ?,
              correo = ?,
              nombre_usuario = ?,
              contrasena_usuario = ?,
              ROLID_ROL = 2
  }`;
  try {
    const [result] = await db
      .promise()
      .execute(query, [
        nombre,
        apellido,
        correo,
        nombre_usuario,
        contrasena_usuario,
        ROLID_ROL,
        ID_Usuario,
      ]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error al actualizar el administrador:", error);
    throw new Error("No se pudo actualizar el administrador.");
  }
};

export const deleteEmple = async (req, res) => {
  const { id } = req.params;
  if (!id) {
      return res.status(400).json({ message: "El ID es obligatorio" });
  }

  try {
      const [rows] = await db.promise().query("SELECT * FROM usuario WHERE ID_Usuario = ? AND ROLID_ROL = 2", [id]);
      if (rows.length === 0) {
          return res.status(404).json({ message: "Empleado no encontrado o no autorizado" });
      }

      await db.promise().execute("DELETE FROM empleado WHERE UsuarioID_Usuario = ?", [id]);

      const [result] = await db.promise().execute("DELETE FROM usuario WHERE ID_Usuario = ? AND ROLID_ROL = 2", [id]);

      if (result.affectedRows === 0) {
          return res.status(500).json({ message: "Error al eliminar el Empleado" });
      }

      res.status(200).json({ message: "Empleado eliminado exitosamente" });
  } catch (error) {
      console.error("Error al eliminar el Empleado:", error);
      res.status(500).json({ message: "Error al eliminar el Empleado", error: error.message });
  }
};