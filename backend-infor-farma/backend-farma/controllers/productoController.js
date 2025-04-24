const pool = require('../config/db');

// 1. Obtener todos los productos
const getAllProductos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, c.nombre_categoria, l.nombre AS nombre_laboratorio, pr.nombre_presentacion, e.nombre_estado
      FROM producto p
      LEFT JOIN categoria c ON p.CategoriaID_Categoria = c.ID_Categoria
      LEFT JOIN laboratorio l ON p.LaboratorioID_Laboratorio = l.ID_Laboratorio
      LEFT JOIN presentacion pr ON p.PresentacionID_Presentacion = pr.ID_Presentacion
      LEFT JOIN estado e ON p.EstadoID_Estado = e.ID_ESTADO
      ORDER BY p.nombre
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Obtener productos por vencer (próximos a vencer en los siguientes 90 días)
const getProductosPorVencer = async (req, res) => {
  try {
    const diasLimite = req.query.dias || 90; // Por defecto 90 días
    
    const [rows] = await pool.query(`
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
const getProductosEnStock = async (req, res) => {
  try {
    const [rows] = await pool.query(`
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
      ORDER BY stock_actual ASC
    `);
    
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Obtener productos por fecha de ingreso (entrada al inventario)
const getProductosPorFechaIngreso = async (req, res) => {
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
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Obtener un producto específico por ID
const getProductoById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT p.*, c.nombre_categoria, l.nombre AS nombre_laboratorio, 
             pr.nombre_presentacion, e.nombre_estado
      FROM producto p
      LEFT JOIN categoria c ON p.CategoriaID_Categoria = c.ID_Categoria
      LEFT JOIN laboratorio l ON p.LaboratorioID_Laboratorio = l.ID_Laboratorio
      LEFT JOIN presentacion pr ON p.PresentacionID_Presentacion = pr.ID_Presentacion
      LEFT JOIN estado e ON p.EstadoID_Estado = e.ID_ESTADO
      WHERE p.ID_PRODUCTO = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllProductos,
  getProductosPorVencer,
  getProductosEnStock,
  getProductosPorFechaIngreso,
  getProductoById
};
