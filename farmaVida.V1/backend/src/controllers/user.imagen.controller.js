// import db from '../config/db.js';
// import path from "path";
// import { fileURLToPath } from "url";
// import fs from 'fs';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// // Función para obtener imagen de usuario
// const getUserImage = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     const [rows] = await db.promise().query(
//       'SELECT * FROM imagen WHERE ID_Usuario = ?',
//       [id]
//     );

//     if (rows.length === 0) {
//       return res.status(404).json({ 
//         message: "Imagen de usuario no encontrada" 
//       });
//     }

//     const imagen = rows[0];
//     res.status(200).json(imagen);
//   } catch (error) {
//     console.error("Error al obtener imagen de usuario:", error);
//     res.status(500).json({
//       message: "Error al obtener la imagen de usuario",
//       error: error.message,
//     });
//   }
// };

// // Función para subir imagen de usuario
// const uploadUserImage = async (req, res) => {
//   const { ID_Usuario } = req.body;
//   const imagen = req.file;

//   if (!ID_Usuario) {
//     return res.status(400).json({ 
//       message: "ID de usuario es requerido" 
//     });
//   }

//   if (!imagen) {
//     return res.status(400).json({ 
//       message: "Imagen es requerida" 
//     });
//   }

//   try {
//     // Verificar si el usuario existe
//     const [user] = await db.promise().query(
//       'SELECT ID_Usuario FROM usuario WHERE ID_Usuario = ?',
//       [ID_Usuario]
//     );

//     if (user.length === 0) {
//       fs.unlinkSync(imagen.path);
//       return res.status(404).json({ 
//         message: "Usuario no encontrado" 
//       });
//     }

//     const [existingImage] = await db.promise().query(
//       'SELECT ID_Imagen, imagen_producto FROM imagen WHERE ID_Usuario = ?',
//       [ID_Usuario]
//     );

//     const imagenPath = path.relative(path.join(__dirname, '../public'), imagen.path);

//     if (existingImage.length > 0) {
//       try {
//         const oldImagePath = path.join(__dirname, '../public', existingImage[0].imagen_producto);
//         if (fs.existsSync(oldImagePath)) {
//           fs.unlinkSync(oldImagePath);
//         }
//       } catch (err) {
//         console.error('Error al eliminar imagen anterior:', err);
//       }

//       await db.promise().execute(
//         'UPDATE imagen SET imagen_producto = ?, descripcion = ? WHERE ID_Usuario = ?',
//         [imagenPath, `Imagen de perfil del usuario ${ID_Usuario}`, ID_Usuario]
//       );
//     } else {
//       await db.promise().execute(
//         'INSERT INTO imagen (imagen_producto, descripcion, ID_Usuario) VALUES (?, ?, ?)',
//         [imagenPath, `Imagen de perfil del usuario ${ID_Usuario}`, ID_Usuario]
//       );
//     }

//     res.status(201).json({
//       message: "Imagen de usuario guardada correctamente",
//       imagen: imagenPath,
//       ID_Usuario: ID_Usuario
//     });
//   } catch (error) {
//     if (imagen && imagen.path) {
//       try {
//         fs.unlinkSync(imagen.path);
//       } catch (err) {
//         console.error('Error al eliminar imagen subida:', err);
//       }
//     }
    
//     console.error("Error al guardar imagen de usuario:", error);
//     res.status(500).json({
//       message: "Error al guardar la imagen de usuario",
//       error: error.message,
//     });
//   }
// };

// // Función para actualizar imagen de usuario
// const updateUserImage = async (req, res) => {
//   const { id } = req.params;
//   const imagen = req.file;

//   if (!imagen) {
//     return res.status(400).json({ 
//       message: "Imagen es requerida" 
//     });
//   }

//   try {
//     const [existingImage] = await db.promise().query(
//       'SELECT * FROM imagen WHERE ID_Imagen = ?',
//       [id]
//     );

//     if (existingImage.length === 0) {
//       fs.unlinkSync(imagen.path);
//       return res.status(404).json({ 
//         message: "Imagen no encontrada" 
//       });
//     }

//     try {
//       const oldImagePath = path.join(__dirname, '../public', existingImage[0].imagen_producto);
//       if (fs.existsSync(oldImagePath)) {
//         fs.unlinkSync(oldImagePath);
//       }
//     } catch (err) {
//       console.error('Error al eliminar imagen anterior:', err);
//     }

//     const imagenPath = path.relative(path.join(__dirname, '../public'), imagen.path);
    
//     await db.promise().execute(
//       'UPDATE imagen SET imagen_producto = ?, descripcion = ? WHERE ID_Imagen = ?',
//       [imagenPath, `Imagen de perfil actualizada`, id]
//     );

//     res.status(200).json({
//       message: "Imagen de usuario actualizada correctamente",
//       imagen: imagenPath,
//       ID_Imagen: id
//     });
//   } catch (error) {
//     if (imagen && imagen.path) {
//       try {
//         fs.unlinkSync(imagen.path);
//       } catch (err) {
//         console.error('Error al eliminar imagen subida:', err);
//       }
//     }
    
//     console.error("Error al actualizar imagen de usuario:", error);
//     res.status(500).json({
//       message: "Error al actualizar la imagen de usuario",
//       error: error.message,
//     });
//   }
// };

// // Función para eliminar imagen de usuario
// const deleteUserImage = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const [existingImage] = await db.promise().query(
//       'SELECT * FROM imagen WHERE ID_Imagen = ?',
//       [id]
//     );

//     if (existingImage.length === 0) {
//       return res.status(404).json({ 
//         message: "Imagen no encontrada" 
//       });
//     }

//     try {
//       const imagePath = path.join(__dirname, '../public', existingImage[0].imagen_producto);
//       if (fs.existsSync(imagePath)) {
//         fs.unlinkSync(imagePath);
//       }
//     } catch (err) {
//       console.error('Error al eliminar imagen:', err);
//     }

//     await db.promise().execute(
//       'DELETE FROM imagen WHERE ID_Imagen = ?',
//       [id]
//     );

//     res.status(200).json({ 
//       message: "Imagen de usuario eliminada correctamente",
//       ID_Imagen: id
//     });
//   } catch (error) {
//     console.error("Error al eliminar imagen de usuario:", error);
//     res.status(500).json({
//       message: "Error al eliminar la imagen de usuario",
//       error: error.message,
//     });
//   }
// };

// // Exporta todas las funciones correctamente
// export {
//   getUserImage,
//   uploadUserImage,
//   updateUserImage,
//   deleteUserImage
// };