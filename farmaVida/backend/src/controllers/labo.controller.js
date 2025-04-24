import db from '../config/db.js';
import { 
    createProveedor as createProveedorModel, 
    updateProveedor as updateProveedorModel, 
    deleteProveedor as deleteProveedorModel, 
    getProveedorById as getProveedorByIdModel 
} from '../models/labo.model.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const getProveedores = async (req, res) => {
    try {
        const [results] = await db.promise().query(`
            SELECT l.*, i.imagen_producto 
            FROM laboratorio l
            LEFT JOIN imagen i ON l.ID_Laboratorio = i.ID_Laboratorio
        `);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error al obtener proveedores:', error);
        res.status(500).json({ message: 'Error al obtener proveedores', error: error.message });
    }
}

export const getProveedorById = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'ID es obligatorio' });
    }

    try {
        const [proveedor] = await db.promise().query(`
            SELECT l.*, i.imagen_producto 
            FROM laboratorio l
            LEFT JOIN imagen i ON l.ID_Laboratorio = i.ID_Laboratorio
            WHERE l.ID_Laboratorio = ?
        `, [id]);
        
        if (!proveedor || proveedor.length === 0) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }
        
        res.status(200).json(proveedor[0]);
    } catch (error) {
        console.error('Error al obtener proveedor por ID:', error);
        res.status(500).json({ message: 'Error al obtener proveedor por ID', error: error.message });
    }
};

export const getTodosProveedor = async (req, res) => {
    try {
        const [rows] = await db.promise().query(`
          SELECT * FROM laboratorio
      ORDER BY nombre`);
      res.json(rows);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
}

export const getLaboratorioById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.promise().query(`
            SELECT * FROM laboratorio
            WHERE ID_Laboratorio = ?
          `, [id]);
          if (rows.length === 0) {
            return res.status(404).json({
                message: 'Laboratorio no encontrado'
            });
        }
            res.json(rows[0]);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      };

export const getProductoPorLaboratorio = async (req, res) => {
    try {
        const { laboratorioId } = req.params;
        const [rows] = await db.promise().query(`
            SELECT p.*, c.nombre_categoria, pr.nombre_presentacion
      FROM producto p
      LEFT JOIN categoria c ON p.CategoriaID_Categoria = c.ID_Categoria
      LEFT JOIN presentacion pr ON p.PresentacionID_Presentacion = pr.ID_Presentacion
      WHERE p.LaboratorioID_Laboratorio = ?
      ORDER BY p.nombre `, [laboratorioId]);

      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };


export const createProveedor = async (req, res) => {
    const { nombre, direccion, ciudad, telefono, correo_electronico, pagina_web } = req.body;
    const imagen = req.file;

    if (!nombre || !direccion || !ciudad || !telefono || !correo_electronico || !pagina_web) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
        // Crear el proveedor
        const laboratorioId = await createProveedorModel({ 
            nombre, 
            direccion, 
            ciudad, 
            telefono, 
            correo_electronico, 
            pagina_web 
        });

        // Si hay imagen, guardarla en la base de datos
        if (imagen) {
            const imagenPath = path.relative(path.join(__dirname, '../public'), imagen.path);
            
            await db.promise().execute(
                'INSERT INTO imagen (imagen_producto, ID_Laboratorio) VALUES (?, ?)',
                [imagenPath, laboratorioId]
            );
        }

        res.status(201).json({ 
            message: 'Proveedor creado exitosamente', 
            id: laboratorioId,
            imagen: imagen ? imagen.filename : null
        });
    } catch (error) {
        console.error('Error al crear proveedor:', error);
        res.status(500).json({ message: 'Error al crear proveedor', error: error.message });
    }
};

export const updateProveedor = async (req, res) => {
    const { id } = req.params;
    const { nombre, direccion, ciudad, telefono, correo_electronico, pagina_web } = req.body;
    const imagen = req.file;

    if (!id || !nombre || !direccion || !ciudad || !telefono || !correo_electronico || !pagina_web) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios y el ID debe ser válido' });
    }

    try {
        // Verificar si el proveedor existe
        const proveedorExistente = await getProveedorByIdModel(id);
        if (!proveedorExistente) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }

        // Actualizar el proveedor
        const affectedRows = await updateProveedorModel(id, { 
            nombre, 
            direccion, 
            ciudad, 
            telefono, 
            correo_electronico, 
            pagina_web 
        });

        if (affectedRows === 0) {
            return res.status(500).json({ message: 'Error al actualizar proveedor' });
        }

        // Manejar la imagen
        if (imagen) {
            const imagenPath = path.relative(path.join(__dirname, '../public'), imagen.path);
            
            // Verificar si ya existe una imagen para este laboratorio
            const [existingImage] = await db.promise().query(
                'SELECT * FROM imagen WHERE ID_Laboratorio = ?', 
                [id]
            );

            if (existingImage.length > 0) {
                // Eliminar imagen anterior del sistema de archivos
                try {
                    const oldImagePath = path.join(__dirname, '../public', existingImage[0].imagen_producto);
                    fs.unlinkSync(oldImagePath);
                } catch (err) {
                    console.error('Error al eliminar imagen anterior:', err);
                }

                // Actualizar imagen existente
                await db.promise().execute(
                    'UPDATE imagen SET imagen_producto = ? WHERE ID_Laboratorio = ?',
                    [imagenPath, id]
                );
            } else {
                // Insertar nueva imagen
                await db.promise().execute(
                    'INSERT INTO imagen (imagen_producto, ID_Laboratorio) VALUES (?, ?)',
                    [imagenPath, id]
                );
            }
        }

        res.status(200).json({ 
            message: 'Proveedor actualizado exitosamente',
            imagen: imagen ? imagen.filename : null
        });
    } catch (error) {
        console.error('Error al actualizar proveedor:', error);
        res.status(500).json({ message: 'Error al actualizar proveedor', error: error.message });
    }
};

export const deleteProveedor = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'ID es obligatorio' });
    }

    try {
        const proveedorExistente = await getProveedorByIdModel(id);
        if (!proveedorExistente) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }

        // Eliminar imagen asociada si existe
        const [imagen] = await db.promise().query(
            'SELECT imagen_producto FROM imagen WHERE ID_Laboratorio = ?',
            [id]
        );

        if (imagen.length > 0) {
            const imagenPath = path.join(__dirname, '../public', imagen[0].imagen_producto);
            try {
                fs.unlinkSync(imagenPath);
            } catch (err) {
                console.error('Error al eliminar archivo de imagen:', err);
            }

            await db.promise().execute(
                'DELETE FROM imagen WHERE ID_Laboratorio = ?',
                [id]
            );
        }

        const affectedRows = await deleteProveedorModel(id);

        if (affectedRows === 0) {
            return res.status(500).json({ message: 'Error al eliminar proveedor' });
        }

        res.status(200).json({ message: 'Proveedor eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar proveedor:', error);
        res.status(500).json({ message: 'Error al eliminar proveedor', error: error.message });
    }
};