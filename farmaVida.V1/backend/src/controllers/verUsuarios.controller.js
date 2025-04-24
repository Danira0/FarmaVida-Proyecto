import db from '../config/db.js';

export const getUsuarios = async (req, res) => {
    try {
        const [result] = await db.promise().query(`
            SELECT usuario.*, rol.descripcion AS rol, imagen.imagen_producto
            FROM usuario
            JOIN rol ON usuario.ROLID_ROL = rol.ID_ROL
            LEFT JOIN imagen ON usuario.ID_Usuario = imagen.ID_Usuario
        `);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error al obtener los usuarios", error);
        res.status(500).json({
            message: "Error al obtener los usuarios",
            error: error.message,
        });
    }
}