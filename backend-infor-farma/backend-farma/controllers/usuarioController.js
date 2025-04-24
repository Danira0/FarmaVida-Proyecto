const pool = require('../config/db');

// 1. Obtener todos los usuarios
const getAllUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.*, r.descripcion AS rol_descripcion, 
             e.nombre AS nombre_empleado, e.salario, e.telefono
      FROM usuario u
      LEFT JOIN rol r ON u.ROLID_ROL = r.ID_ROL
      LEFT JOIN empleado e ON u.ID_Usuario = e.UsuarioID_Usuario
      ORDER BY u.nombre
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Obtener usuarios por rol (administrador o empleado)
const getUsuariosPorRol = async (req, res) => {
  try {
    const { rolId } = req.params;
    
    const [rows] = await pool.query(`
      SELECT u.*, r.descripcion AS rol_descripcion, 
             e.nombre AS nombre_empleado, e.salario, e.telefono
      FROM usuario u
      LEFT JOIN rol r ON u.ROLID_ROL = r.ID_ROL
      LEFT JOIN empleado e ON u.ID_Usuario = e.UsuarioID_Usuario
      WHERE u.ROLID_ROL = ?
      ORDER BY u.nombre
    `, [rolId]);
    
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Obtener un usuario específico por ID
const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.query(`
      SELECT u.*, r.descripcion AS rol_descripcion, 
             e.nombre AS nombre_empleado, e.salario, e.telefono
      FROM usuario u
      LEFT JOIN rol r ON u.ROLID_ROL = r.ID_ROL
      LEFT JOIN empleado e ON u.ID_Usuario = e.UsuarioID_Usuario
      WHERE u.ID_Usuario = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Obtener empleados
const getEmpleados = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.*, u.nombre AS nombre_usuario, u.apellido AS apellido_usuario, 
             u.correo, r.descripcion AS rol
      FROM empleado e
      LEFT JOIN usuario u ON e.UsuarioID_Usuario = u.ID_Usuario
      LEFT JOIN rol r ON u.ROLID_ROL = r.ID_ROL
      ORDER BY e.nombre
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Obtener usuarios por fecha de registro
const getUsuariosPorFechaRegistro = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    let query = `
      SELECT u.*, r.descripcion AS rol_descripcion
      FROM usuario u
      LEFT JOIN rol r ON u.ROLID_ROL = r.ID_ROL
    `;
    
    const params = [];
    
    if (fechaInicio && fechaFin) {
      query += ` WHERE DATE(u.fecha_registro) BETWEEN ? AND ?`;
      params.push(fechaInicio, fechaFin);
    } else if (fechaInicio) {
      query += ` WHERE DATE(u.fecha_registro) >= ?`;
      params.push(fechaInicio);
    } else if (fechaFin) {
      query += ` WHERE DATE(u.fecha_registro) <= ?`;
      params.push(fechaFin);
    }
    
    query += ` ORDER BY u.fecha_registro DESC`;
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllUsuarios,
  getUsuariosPorRol,
  getUsuarioById,
  getEmpleados,
  getUsuariosPorFechaRegistro
};
