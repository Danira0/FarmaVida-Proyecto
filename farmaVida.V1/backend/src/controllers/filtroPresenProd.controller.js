import db from '../config/db.js';

// Controlador para obtener todos los productos
export const getProductos = async (req, res) => {
    try {
        const [result] = await db.promise().query(`
            SELECT p.ID_PRODUCTO, p.nombre, p.PresentacionID_Presentacion, 
                   pr.nombre_presentacion, pr.ID_Presentacion
            FROM producto p
            LEFT JOIN presentacion pr ON p.PresentacionID_Presentacion = pr.ID_Presentacion
            ORDER BY p.nombre
        `);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error al obtener los productos", error);
        res.status(500).json({
            message: "Error al obtener los productos",
            error: error.message,
        });
    }
}

// Controlador para obtener productos por presentación
export const getProductosByPresentacion = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validar que el ID sea un número
        if (isNaN(id)) {
            return res.status(400).json({
                message: "El ID de presentación debe ser un número"
            });
        }

        const [result] = await db.promise().query(`
            SELECT p.ID_PRODUCTO, p.nombre, p.PresentacionID_Presentacion, 
                   pr.nombre_presentacion, pr.ID_Presentacion
            FROM producto p
            LEFT JOIN presentacion pr ON p.PresentacionID_Presentacion = pr.ID_Presentacion
            WHERE p.PresentacionID_Presentacion = ?
            ORDER BY p.nombre
        `, [id]);
        
        if (result.length === 0) {
            return res.status(404).json({
                message: "No se encontraron productos para esta presentación"
            });
        }
        
        res.status(200).json(result);
    } catch (error) {
        console.error("Error al obtener los productos por presentación", error);
        res.status(500).json({
            message: "Error al obtener los productos por presentación",
            error: error.message,
        });
    }
}