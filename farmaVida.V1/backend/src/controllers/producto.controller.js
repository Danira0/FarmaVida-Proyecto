  import db from '../config/db.js';
  import * as productoModel from "../models/producto.model.js";
  import path from "path";
  import { fileURLToPath } from "url";
  import fs from 'fs';

  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  export const getProductos = async (req, res) => {
    try {
      const { nombre, tipo } = req.query;
      const productos = await productoModel.getProductos(nombre, tipo);
      res.status(200).json(productos);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      res.status(500).json({
        message: "Error al obtener los productos",
        error: error.message,
      });
    }
  };

  export const getProductoById = async (id) => {
    try {
      const producto = await productoModel.getProductoById(id);
      if (!producto) {
        throw new Error("Producto no encontrado" );
      }
      return producto
    } catch (error) {
      console.error("Error al obtener el producto:", error);
      throw error;
    }
  };

  /* OBTENER SOLAMENTE PARA LOS INFORMES*/

  export const getTodosProductos = async (req, res) => {
    try {
      const [rows] = await db.promise().query(
        `
        SELECT p.*, c.nombre_categoria, l.nombre AS nombre_laboratorio, pr.nombre_presentacion, e.nombre_estado
        FROM producto p
        LEFT JOIN categoria c ON p.CategoriaID_Categoria = c.ID_Categoria
        LEFT JOIN laboratorio l ON p.LaboratorioID_Laboratorio = l.ID_Laboratorio
        LEFT JOIN presentacion pr ON p.PresentacionID_Presentacion = pr.ID_Presentacion
        LEFT JOIN estado e ON p.EstadoID_Estado = e.ID_ESTADO
        ORDER BY p.nombre
      `);
      res.status(200).json(rows);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      res.status(500).json({
        message: "Error al obtener los productos",
        error: error.message,
      });
    }
  }

  // 2. Obtener productos por vencer (próximos a vencer en los siguientes 90 días)
  export const getProductosPorVencer = async (req, res) => {
    try {
      const diasLimite = req.query.dias || 90; // Por defecto 90 días
      
      const [rows] = await db.promise().query(`
        SELECT p.*, c.nombre_categoria, l.nombre AS nombre_laboratorio, pr.nombre_presentacion, e.nombre_estado,
          DATEDIFF(p.fecha_vencimiento, CURDATE()) AS dias_para_vencer
        FROM producto p
        LEFT JOIN categoria c ON p.CategoriaID_Categoria = c.ID_Categoria
        LEFT JOIN laboratorio l ON p.LaboratorioID_Laboratorio = l.ID_Laboratorio
        LEFT JOIN presentacion pr ON p.PresentacionID_Presentacion = pr.ID_Presentacion
        LEFT JOIN estado e ON p.EstadoID_Estado = e.ID_ESTADO
        WHERE p.fecha_vencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
        ORDER BY p.fecha_vencimiento
      `, [diasLimite]);
      
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  // 3. Obtener productos en stock (calculando stock disponible basado en movimientos)
  export const getProductosenStock = async (req, res) => {
    try {
      const [rows] = await db.promise().query(`
        SELECT 
        p.ID_PRODUCTO,
        p.nombre,
        p.descripcion,
        p.valor_unitario,
        p.lote,
        p.fecha_vencimiento,
        l.nombre AS nombre_laboratorio,
        c.nombre_categoria,
        pr.nombre_presentacion,
        e.nombre_estado,
        COALESCE(
          (SELECT SUM(
            CASE 
              WHEN m.tipo_movimiento = 'Entrada' THEN m.cantidad
              WHEN m.tipo_movimiento = 'Salida' THEN -m.cantidad
              WHEN m.tipo_movimiento = 'Ajuste' THEN m.cantidad
              WHEN m.tipo_movimiento = 'Devolucion' THEN m.cantidad
              WHEN m.tipo_movimiento = 'Descarte' THEN -m.cantidad
            END
          ) FROM movimiento m WHERE m.ProductoID_Producto = p.ID_PRODUCTO), 0
        ) AS stock_actual,
        p.stock_minimo
      FROM producto p
      LEFT JOIN categoria c ON p.CategoriaID_Categoria = c.ID_Categoria
      LEFT JOIN laboratorio l ON p.LaboratorioID_Laboratorio = l.ID_Laboratorio
      LEFT JOIN presentacion pr ON p.PresentacionID_Presentacion = pr.ID_Presentacion
      LEFT JOIN estado e ON p.EstadoID_Estado = e.ID_ESTADO
      ORDER BY stock_actual ASC`);
      res.status(200).json(rows);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      res.status(500).json({
        message: "Error al obtener los productos",
        error: error.message,
      });
    }
  }

  // 4. Obtener productos por fecha de ingreso (entrada al inventario)
  export const getProductosPorFechaIngreso = async (req, res) => {
    try {
      const { fechaInicio, fechaFin } = req.query;
      let query = `
        SELECT p.*, c.nombre_categoria, l.nombre AS nombre_laboratorio, 
              pr.nombre_presentacion, e.nombre_estado
        FROM producto p
        LEFT JOIN categoria c ON p.CategoriaID_Categoria = c.ID_Categoria
        LEFT JOIN laboratorio l ON p.LaboratorioID_Laboratorio = l.ID_Laboratorio
        LEFT JOIN presentacion pr ON p.PresentacionID_Presentacion = pr.ID_Presentacion
        LEFT JOIN estado e ON p.EstadoID_Estado = e.ID_ESTADO
      `;
      
      const params = [];
      
      if (fechaInicio && fechaFin) {
        query += ` WHERE p.fecha_entrada BETWEEN ? AND ?`;
        params.push(fechaInicio, fechaFin);
      } else if (fechaInicio) {
        query += ` WHERE p.fecha_entrada >= ?`;
        params.push(fechaInicio);
      } else if (fechaFin) {
        query += ` WHERE p.fecha_entrada <= ?`;
        params.push(fechaFin);
      }
      
      query += ` ORDER BY p.fecha_entrada DESC`;
      
      const [rows] = await db.promise().query(query, params);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

export const createProducto = async (req, res) => {
  const producto = req.body;
  const imagen = req.file;

  const camposRequeridos = [
    "nombre",
    "valor_unitario",
    "fecha_entrada",
    "CategoriaID_Categoria",
    "LaboratorioID_Laboratorio",
    "PresentacionID_Presentacion",
    "EstadoID_Estado",
    "stock_minimo",
    "lote",
    "fecha_vencimiento"
  ];

  const camposFaltantes = camposRequeridos.filter(campo => !producto[campo]);

  if (camposFaltantes.length > 0) {
    return res.status(400).json({ 
      message: "Todos los campos obligatorios deben estar presentes",
      camposFaltantes: camposFaltantes
    });
  }

  try {
    const productoExistente = await productoModel.getProductoByNombrePresentacion(
      producto.nombre,
      producto.PresentacionID_Presentacion
    );
    
    if (productoExistente) {
      return res.status(400).json({
        message: "Este producto ya existe en la base de datos con la misma presentación.",
      });
    }

    const fechaVencimiento = new Date(producto.fecha_vencimiento);
    const fechaActual = new Date();

    if (fechaVencimiento < fechaActual) {
      return res.status(400).json({
        message: "La fecha de vencimiento no puede ser anterior a la fecha actual",
      });
    }

    producto.fecha_actualizacion = new Date();
    const idProducto = await productoModel.createProducto(producto);
    if (imagen) {
      const imagenPath = path.relative(path.join(__dirname, '../public'), imagen.path);
      
      await db.promise().execute(
        'INSERT INTO imagen (imagen_producto, ID_Producto) VALUES (?, ?)',
        [imagenPath, idProducto]
      );
    }

    res.status(201).json({
      message: "Producto creado correctamente",
      id: idProducto,
      imagen: imagen ? imagen.filename : null,
    });    

  } catch (error) {
    console.error("Error al crear el producto:", error);
    res.status(500).json({
      message: "Error al crear el producto",
      error: error.message,
    });
  }
};


export const updateProducto = async (req, res) => {
  const { id } = req.params;
  const producto = req.body;
  const imagen = req.file;

  try {
    const productoExistente = await productoModel.getProductoById(id);
    if (!productoExistente) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const camposRequeridos = [
      "nombre",
      "descripcion",
      "valor_unitario",
      "fecha_entrada",
      "CategoriaID_Categoria",
      "LaboratorioID_Laboratorio",
      "PresentacionID_Presentacion",
      "EstadoID_Estado",
      "stock_minimo",
      "lote",
      "fecha_vencimiento",
    ];

    if (producto.PresentacionID_Presentacion !== 1 && producto.PresentacionID_Presentacion !== 2) {
      camposRequeridos.push("cantidad_unidades");
    }

    if (producto.PresentacionID_Presentacion === 3 || producto.PresentacionID_Presentacion === 4 || producto.PresentacionID_Presentacion === 5) {
      camposRequeridos.push("cantidad_frascos");
    }

    const camposFaltantes = camposRequeridos.filter(
      campo => producto[campo] === undefined || producto[campo] === null || producto[campo] === ''
    );

    if (camposFaltantes.length > 0) {
      return res.status(400).json({ 
        message: "Todos los campos obligatorios deben estar presentes",
        camposFaltantes: camposFaltantes
      });
    }

    // Validar fecha de vencimiento
    const fechaVencimiento = new Date(producto.fecha_vencimiento);
    const fechaActual = new Date();
    if (fechaVencimiento < fechaActual) {
      return res.status(400).json({ 
        message: "La fecha de vencimiento no puede ser anterior a la fecha actual" 
      });
    }

    // Manejar la imagen
    if (imagen) {
      const imagenPath = path.relative(path.join(__dirname, '../public'), imagen.path);
      
      // Verificar si ya existe una imagen para este producto
      const [existingImage] = await db.promise().query(
        'SELECT * FROM imagen WHERE ID_Producto = ?', 
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
          'UPDATE imagen SET imagen_producto = ? WHERE ID_Producto = ?',
          [imagenPath, id]
        );
      } else {
        // Insertar nueva imagen
        await db.promise().execute(
          'INSERT INTO imagen (imagen_producto, ID_Producto) VALUES (?, ?)',
          [imagenPath, id]
        );
      }
    }

    const cleanProducto = {
      ...producto,
      fecha_actualizacion: new Date()
    };

    const affectedRows = await productoModel.updateProducto(id, cleanProducto);
    if (affectedRows === 0) {
      return res.status(400).json({ 
        message: "No se pudo actualizar el producto" 
      });
    }

    return res.status(200).json({ 
      message: "Producto actualizado correctamente",
      imagen: imagen ? imagen.filename : null
    });
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    return res.status(500).json({ 
      message: "Error al actualizar el producto", 
      error: error.message 
    });
  }
};

export const updateProductoStock = async (productoData) => {
  try {
    const { id, cantidad_unidades, cantidad_frascos } = productoData;
    if (cantidad_unidades === undefined && cantidad_frascos === undefined) {
         throw new Error("Se requiere al menos un campo de cantidad (unidades o frascos)");
      };

  const updateData = {
      fecha_actualizacion: new Date()
    };

    if (cantidad_unidades !== undefined) {
      updateData.cantidad_unidades = cantidad_unidades;
    }
    
    if (cantidad_frascos !== undefined) {
      updateData.cantidad_frascos = cantidad_frascos;
    }

    const affectedRows = await productoModel.updateProducto(id, updateData);
    
    if (affectedRows === 0) {
      throw new Error("No se pudo actualizar el stock del producto");
    }
    return { success: true, affectedRows };
  } catch (error) {
    console.error("Error al actualizar el stock del producto:", error);
    throw error;
  }
};

export const deleteProducto = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "El ID es obligatorio" });
  }

  try {
    const tieneDatosRelacionados = await productoModel.verificarDatosRelacionados(id);
    if (tieneDatosRelacionados) {
      return res.status(400).json({
        message: "No se puede eliminar el producto porque tiene datos relacionados",
        details: "Este producto cuenta con información primordial asociada que no puede ser eliminada"
      });
    }

    // Obtener y eliminar la imagen asociada si existe
    const [imagen] = await db.promise().query(
      'SELECT imagen_producto FROM imagen WHERE ID_Producto = ?',
      [id]
    );

    if (imagen.length > 0) {
      try {
        const imagenPath = path.join(__dirname, '../public', imagen[0].imagen_producto);
        fs.unlinkSync(imagenPath);
      } catch (err) {
        console.error('Error al eliminar archivo de imagen:', err);
      }
    }

    // Eliminar las imágenes de la base de datos
    await productoModel.eliminarImagenesDeProducto(id);

    // Eliminar el producto
    const affectedRows = await productoModel.deleteProducto(id);
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.status(200).json({ message: "Producto eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    res.status(500).json({
      message: "Error al eliminar el producto",
      error: error.message,
    });
  }
};