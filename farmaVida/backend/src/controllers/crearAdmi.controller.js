import db from "../config/db.js";
import Swal from "sweetalert2";
import bcrypt from 'bcryptjs';
import { createAdmi as createAdmiModel, updateAdmi as updateAdmiModel, deleteAdmi as deleteAdmiModel } from "../models/crearAdmi.model.js";


export const getAdmi = async (req, res) => {
  try {
    const [result] = await db.promise().query(`
      SELECT u.*, i.imagen_producto as imagen_perfil 
      FROM usuario u
      LEFT JOIN imagen i ON u.ID_Usuario = i.ID_Usuario
      WHERE u.ROLID_ROL = 1
    `);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error al obtener el Administrador", error);
    res.status(500).json({
      message: "Error al obtener el Administrador",
      error: error.message,
    });
  }
};

export const createAdmi = async (req, res) => {
  const { nombre, apellido, correo, nombre_usuario, contrasena_usuario, ROLID_ROL } = req.body;
  const imagen = req.file; 

  if (!nombre || !apellido || !correo || !nombre_usuario || !contrasena_usuario || ROLID_ROL !== 1) {
    return res.status(400).json({ message: "Todos los campos son obligatorios y el rol debe ser Administrador" });
  }

  const checkUserQuery = 'SELECT * FROM usuario WHERE correo = ?';
  const [existingUser] = await db.promise().execute(checkUserQuery, [correo]);

  if (existingUser.length > 0) {
    return res.status(400).json({ message: 'El correo ya está en uso' });
  }

  try {
    const hashedPassword = await bcrypt.hash(contrasena_usuario, 10);
    const { usuarioId } = await createAdmiModel({ 
      nombre, 
      apellido, 
      correo, 
      nombre_usuario, 
      contrasena_usuario: hashedPassword, 
      ROLID_ROL 
    });

    if (imagen) {
      await db.promise().execute(
        'INSERT INTO imagen (imagen_producto, descripcion, ID_Usuario) VALUES (?, ?, ?)',
        [imagen.filename, `Imagen de perfil de ${nombre} ${apellido}`, usuarioId]
      );
    }

    res.status(201).json({ 
      message: "Administrador creado correctamente",
      usuarioId 
    });
  } catch (error) {
    console.error("Error al crear el Administrador:", error);
    res.status(500).json({ message: "Error al crear al Administrador", error: error.message });
  }
};

export const updateAdmi = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, correo, nombre_usuario, contrasena_usuario, ROLID_ROL } = req.body;
  const imagen = req.file; 

  if (!nombre || !apellido || !correo || !nombre_usuario || !contrasena_usuario || ROLID_ROL !== 1) {
    return res.status(400).json({ message: "Todos los campos son obligatorios y el rol debe ser Administrador" });
  }

  try {
    const [rows] = await db.promise().query("SELECT * FROM usuario WHERE ID_Usuario = ? AND ROLID_ROL = 1", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Administrador no encontrado" });
    }

    const hashedPassword = await bcrypt.hash(contrasena_usuario, 10);
    const query = `
      UPDATE usuario SET nombre = ?, apellido = ?, correo = ?, nombre_usuario = ?, contrasena_usuario = ?
      WHERE ID_Usuario = ? AND ROLID_ROL = 1`;
    const [result] = await db.promise().execute(query, [nombre, apellido, correo, nombre_usuario, hashedPassword, id]);

    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "Error al actualizar datos del Administrador" });
    }

    if (imagen) {
      const [existingImage] = await db.promise().execute(
        'SELECT * FROM imagen WHERE ID_Usuario = ?',
        [id]
      );

      if (existingImage.length > 0) {
        await db.promise().execute(
          'UPDATE imagen SET imagen_producto = ?, descripcion = ? WHERE ID_Usuario = ?',
          [imagen.filename, `Imagen de perfil de ${nombre} ${apellido}`, id]
        );
      } else {
        await db.promise().execute(
          'INSERT INTO imagen (imagen_producto, descripcion, ID_Usuario) VALUES (?, ?, ?)',
          [imagen.filename, `Imagen de perfil de ${nombre} ${apellido}`, id]
        );
      }
    }

    res.status(200).json({ message: "Administrador actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar el Administrador:", error);
    res.status(500).json({ message: "Error al actualizar el Administrador", error: error.message });
  }
};

export const deleteAdmi = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "El ID es obligatorio" });
  }

  try {
    const [rows] = await db.promise().query("SELECT * FROM usuario WHERE ID_Usuario = ? AND ROLID_ROL = 1", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Administrador no encontrado" });
    }

    await db.promise().execute("DELETE FROM imagen WHERE ID_Usuario = ?", [id]);

    const [result] = await db.promise().execute("DELETE FROM usuario WHERE ID_Usuario = ? AND ROLID_ROL = 1", [id]);
    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "Error al eliminar el Administrador" });
    }

    res.status(200).json({ message: "Administrador eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar el Administrador:", error);
    res.status(500).json({ message: "Error al eliminar el Administrador", error: error.message });
  }
};

export const getAdmiImage = async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await db.promise().execute(
      'SELECT imagen_producto FROM imagen WHERE ID_Usuario = ?',
      [id]
    );
    
    if (result.length === 0) {
      return res.status(404).json({ message: "Imagen no encontrada" });
    }
    
    res.status(200).json(result[0]);
  } catch (error) {
    console.error("Error al obtener la imagen del administrador:", error);
    res.status(500).json({ 
      message: "Error al obtener la imagen del administrador", 
      error: error.message 
    });
  }
};