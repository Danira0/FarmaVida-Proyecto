const pool = require('../config/db');

// 1. Obtener todos los laboratorios (proveedores)
const getAllLaboratorios = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM laboratorio
      ORDER BY nombre
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Obtener un laboratorio específico por ID
const getLaboratorioById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.query(`
      SELECT * FROM laboratorio
      WHERE ID_Laboratorio = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Laboratorio no encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Obtener productos por laboratorio
const getProductosPorLaboratorio = async (req, res) => {
  try {
    const { labId } = req.params;
    
    const [rows] = await pool.query(`
      SELECT p.*, c.nombre_categoria, pr.nombre_presentacion
      FROM producto p
      LEFT JOIN categoria c ON p.CategoriaID_Categoria = c.ID_Categoria
      LEFT JOIN presentacion pr ON p.PresentacionID_Presentacion = pr.ID_Presentacion
      WHERE p.LaboratorioID_Laboratorio = ?
      ORDER BY p.nombre
    `, [labId]);
    
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllLaboratorios,
  getLaboratorioById,
  getProductosPorLaboratorio
};