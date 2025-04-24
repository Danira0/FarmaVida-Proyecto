const pool = require('../config/db');

// 1. Obtener todos los movimientos
const getAllMovimientos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.*, p.nombre AS nombre_producto, pr.nombre_presentacion, 
             u.nombre AS nombre_usuario, ub.nombre_ubicacion
      FROM movimiento m
      LEFT JOIN producto p ON m.ProductoID_Producto = p.ID_PRODUCTO
      LEFT JOIN presentacion pr ON m.PresentacionID_Presentacion = pr.ID_Presentacion
      LEFT JOIN usuario u ON m.UsuarioID_Usuario = u.ID_Usuario
      LEFT JOIN ubicacion ub ON m.UbicacionID_Ubicacion = ub.ID_Ubicacion
      ORDER BY m.fecha_hora_movimiento DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Obtener movimientos por fecha
const getMovimientosPorFecha = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    let query = `
      SELECT m.*, p.nombre AS nombre_producto, pr.nombre_presentacion, 
             u.nombre AS nombre_usuario, ub.nombre_ubicacion
      FROM movimiento m
      LEFT JOIN producto p ON m.ProductoID_Producto = p.ID_PRODUCTO
      LEFT JOIN presentacion pr ON m.PresentacionID_Presentacion = pr.ID_Presentacion
      LEFT JOIN usuario u ON m.UsuarioID_Usuario = u.ID_Usuario
      LEFT JOIN ubicacion ub ON m.UbicacionID_Ubicacion = ub.ID_Ubicacion
    `;
    
    const params = [];
    
    if (fechaInicio && fechaFin) {
      query += ` WHERE DATE(m.fecha_hora_movimiento) BETWEEN ? AND ?`;
      params.push(fechaInicio, fechaFin);
    } else if (fechaInicio) {
      query += ` WHERE DATE(m.fecha_hora_movimiento) >= ?`;
      params.push(fechaInicio);
    } else if (fechaFin) {
      query += ` WHERE DATE(m.fecha_hora_movimiento) <= ?`;
      params.push(fechaFin);
    }
    
    query += ` ORDER BY m.fecha_hora_movimiento DESC`;
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Obtener movimientos por producto
const getMovimientosPorProducto = async (req, res) => {
  try {
    const { productoId } = req.params;
    
    const [rows] = await pool.query(`
      SELECT m.*, p.nombre AS nombre_producto, pr.nombre_presentacion, 
             u.nombre AS nombre_usuario, u.apellido AS apellido_usuario, ub.nombre_ubicacion
      FROM movimiento m
      LEFT JOIN producto p ON m.ProductoID_Producto = p.ID_PRODUCTO
      LEFT JOIN presentacion pr ON m.PresentacionID_Presentacion = pr.ID_Presentacion
      LEFT JOIN usuario u ON m.UsuarioID_Usuario = u.ID_Usuario
      LEFT JOIN ubicacion ub ON m.UbicacionID_Ubicacion = ub.ID_Ubicacion
      WHERE m.ProductoID_Producto = ?
      ORDER BY m.fecha_hora_movimiento DESC
    `, [productoId]);
    
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Obtener movimientos por usuario
const getMovimientosPorUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    
    const [rows] = await pool.query(`
      SELECT m.*, p.nombre AS nombre_producto, pr.nombre_presentacion, 
             u.nombre AS nombre_usuario, u.apellido AS apellido_usuario, ub.nombre_ubicacion
      FROM movimiento m
      LEFT JOIN producto p ON m.ProductoID_Producto = p.ID_PRODUCTO
      LEFT JOIN presentacion pr ON m.PresentacionID_Presentacion = pr.ID_Presentacion
      LEFT JOIN usuario u ON m.UsuarioID_Usuario = u.ID_Usuario
      LEFT JOIN ubicacion ub ON m.UbicacionID_Ubicacion = ub.ID_Ubicacion
      WHERE m.UsuarioID_Usuario = ?
      ORDER BY m.fecha_hora_movimiento DESC
    `, [usuarioId]);
    
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Obtener movimientos por tipo (Entrada, Salida, etc.)
const getMovimientosPorTipo = async (req, res) => {
  try {
    const { tipo } = req.params;
    
    const [rows] = await pool.query(`
      SELECT m.*, p.nombre AS nombre_producto, pr.nombre_presentacion, 
             u.nombre AS nombre_usuario, u.apellido AS apellido_usuario, ub.nombre_ubicacion
      FROM movimiento m
      LEFT JOIN producto p ON m.ProductoID_Producto = p.ID_PRODUCTO
      LEFT JOIN presentacion pr ON m.PresentacionID_Presentacion = pr.ID_Presentacion
      LEFT JOIN usuario u ON m.UsuarioID_Usuario = u.ID_Usuario
      LEFT JOIN ubicacion ub ON m.UbicacionID_Ubicacion = ub.ID_Ubicacion
      WHERE m.tipo_movimiento = ?
      ORDER BY m.fecha_hora_movimiento DESC
    `, [tipo]);
    
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllMovimientos,
  getMovimientosPorFecha,
  getMovimientosPorProducto,
  getMovimientosPorUsuario,
  getMovimientosPorTipo
};
