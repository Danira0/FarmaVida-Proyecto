import db from '../config/db.js';

export const getPresentaciones = async (req, res) => {
    try {
        const [result] = await db.promise().query(`
            SELECT ID_Presentacion, nombre_presentacion 
            FROM presentacion
            ORDER BY nombre_presentacion
            `);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error al obtener las presentaciones", error);
        res.status(500).json({
            message: "Error al obtener las presentaciones",
            error: error.message,
        });
    }
}