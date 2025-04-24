const pool = require('../config/db');

// Modelo para consultas de informes
const InformesModel = {
  // Informe de inventario actual
  async getInventarioActual() {
    try {
      const [rows] = await pool.query(`
        SELECT p.ID_PRODUCTO, p.nombre, p.descripcion, p.valor_unitario,
               c.nombre_categoria, l.nombre as laboratorio, 
               pr.nombre_presentacion, e.nombre_estado,
               (SELECT SUM(
                  CASE 
                    WHEN m.tipo_movimiento = 'Entrada' THEN m.cantidad
                    WHEN m.tipo_movimiento = 'Salida' THEN -m.cantidad
                    WHEN m.tipo_movimiento = 'Ajuste' THEN m.cantidad
                    WHEN m.tipo_movimiento = 'Devolucion' THEN m.cantidad
                    ELSE 0
                  END
                )
                FROM movimiento m
                WHERE m.ProductoID_Producto = p.ID_PRODUCTO
               ) as stock_actual,
               p.stock_minimo,
               p.fecha_vencimiento
        FROM producto p
        LEFT JOIN categoria c ON p.CategoriaID_Categoria = c.ID_Categoria
        LEFT JOIN laboratorio l ON p.LaboratorioID_Laboratorio = l.ID_Laboratorio
        LEFT JOIN presentacion pr ON p.PresentacionID_Presentacion = pr.ID_Presentacion
        LEFT JOIN estado e ON p.EstadoID_Estado = e.ID_ESTADO
        ORDER BY p.nombre
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  },

  // Informe de productos por vencer (próximos 3 meses)
  async getProductosPorVencer() {
    try {
      const [rows] = await pool.query(`
        SELECT p.ID_PRODUCTO, p.nombre, p.descripcion, 
               c.nombre_categoria, l.nombre as laboratorio,
               p.lote, p.fecha_vencimiento,
               (SELECT SUM(
                  CASE 
                    WHEN m.tipo_movimiento = 'Entrada' THEN m.cantidad
                    WHEN m.tipo_movimiento = 'Salida' THEN -m.cantidad
                    WHEN m.tipo_movimiento = 'Ajuste' THEN m.cantidad
                    WHEN m.tipo_movimiento = 'Devolucion' THEN m.cantidad
                    ELSE 0
                  END
                )
                FROM movimiento m
                WHERE m.ProductoID_Producto = p.ID_PRODUCTO
               ) as stock_actual,
               DATEDIFF(p.fecha_vencimiento, CURDATE()) as dias_para_vencer
        FROM producto p
        LEFT JOIN categoria c ON p.CategoriaID_Categoria = c.ID_Categoria
        LEFT JOIN laboratorio l ON p.LaboratorioID_Laboratorio = l.ID_Laboratorio
        WHERE p.fecha_vencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 MONTH)
        ORDER BY p.fecha_vencimiento
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  },

  // Informe de ventas por periodo
  async getVentasPorPeriodo(fechaInicio, fechaFin) {
    try {
      const [rows] = await pool.query(`
        SELECT m.fecha_hora_movimiento, p.nombre as producto, 
               pr.nombre_presentacion, m.cantidad, 
               m.valor_unitario_movimiento, m.subtotal, m.total_venta,
               m.iva_aplicado, u.nombre as vendedor
        FROM movimiento m
        JOIN producto p ON m.ProductoID_Producto = p.ID_PRODUCTO
        JOIN presentacion pr ON m.PresentacionID_Presentacion = pr.ID_Presentacion
        JOIN usuario u ON m.UsuarioID_Usuario = u.ID_Usuario
        WHERE m.tipo_movimiento = 'Salida'
        AND m.motivo = 'Venta'
        AND m.fecha_hora_movimiento BETWEEN ? AND ?
        ORDER BY m.fecha_hora_movimiento DESC
      `, [fechaInicio, fechaFin]);
      return rows;
    } catch (error) {
      throw error;
    }
  },

  // Informe de ventas por usuario/vendedor
  async getVentasPorUsuario(fechaInicio, fechaFin) {
    try {
      const [rows] = await pool.query(`
        SELECT u.nombre, u.apellido, COUNT(m.ID_STOCK) as total_ventas,
               SUM(m.subtotal) as subtotal_ventas,
               SUM(m.iva_aplicado) as total_iva,
               SUM(m.total_venta) as total_ventas_con_iva
        FROM movimiento m
        JOIN usuario u ON m.UsuarioID_Usuario = u.ID_Usuario
        WHERE m.tipo_movimiento = 'Salida'
        AND m.motivo = 'Venta'
        AND m.fecha_hora_movimiento BETWEEN ? AND ?
        GROUP BY u.ID_Usuario
        ORDER BY total_ventas_con_iva DESC
      `, [fechaInicio, fechaFin]);
      return rows;
    } catch (error) {
      throw error;
    }
  },

  // Informe de productos más vendidos
  async getProductosMasVendidos(fechaInicio, fechaFin, limite = 10) {
    try {
      const [rows] = await pool.query(`
        SELECT p.nombre, c.nombre_categoria, 
               SUM(m.cantidad) as unidades_vendidas,
               SUM(m.subtotal) as total_ventas
        FROM movimiento m
        JOIN producto p ON m.ProductoID_Producto = p.ID_PRODUCTO
        JOIN categoria c ON p.CategoriaID_Categoria = c.ID_Categoria
        WHERE m.tipo_movimiento = 'Salida'
        AND m.motivo = 'Venta'
        AND m.fecha_hora_movimiento BETWEEN ? AND ?
        GROUP BY p.ID_PRODUCTO
        ORDER BY unidades_vendidas DESC
        LIMIT ?
      `, [fechaInicio, fechaFin, limite]);
      return rows;
    } catch (error) {
      throw error;
    }
  },

  // Informe de productos bajo stock mínimo
  async getProductosBajoStock() {
    try {
      const [rows] = await pool.query(`
        SELECT p.ID_PRODUCTO, p.nombre, p.descripcion, 
               c.nombre_categoria, l.nombre as laboratorio,
               p.stock_minimo,
               (SELECT SUM(
                  CASE 
                    WHEN m.tipo_movimiento = 'Entrada' THEN m.cantidad
                    WHEN m.tipo_movimiento = 'Salida' THEN -m.cantidad
                    WHEN m.tipo_movimiento = 'Ajuste' THEN m.cantidad
                    WHEN m.tipo_movimiento = 'Devolucion' THEN m.cantidad
                    ELSE 0
                  END
                )
                FROM movimiento m
                WHERE m.ProductoID_Producto = p.ID_PRODUCTO
               ) as stock_actual
        FROM producto p
        LEFT JOIN categoria c ON p.CategoriaID_Categoria = c.ID_Categoria
        LEFT JOIN laboratorio l ON p.LaboratorioID_Laboratorio = l.ID_Laboratorio
        HAVING stock_actual < p.stock_minimo OR stock_actual IS NULL
        ORDER BY stock_actual
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  },
  
  // Informe de ventas por categoría
  async getVentasPorCategoria(fechaInicio, fechaFin) {
    try {
      const [rows] = await pool.query(`
        SELECT c.nombre_categoria, 
               COUNT(m.ID_STOCK) as total_ventas,
               SUM(m.cantidad) as unidades_vendidas,
               SUM(m.subtotal) as subtotal_ventas,
               SUM(m.iva_aplicado) as total_iva,
               SUM(m.total_venta) as total_ventas_con_iva
        FROM movimiento m
        JOIN producto p ON m.ProductoID_Producto = p.ID_PRODUCTO
        JOIN categoria c ON p.CategoriaID_Categoria = c.ID_Categoria
        WHERE m.tipo_movimiento = 'Salida'
        AND m.motivo = 'Venta'
        AND m.fecha_hora_movimiento BETWEEN ? AND ?
        GROUP BY c.ID_Categoria
        ORDER BY total_ventas_con_iva DESC
      `, [fechaInicio, fechaFin]);
      return rows;
    } catch (error) {
      throw error;
    }
  },
  
  // Informe de historial de movimientos de un producto
  async getHistorialProducto(productoId) {
    try {
      const [rows] = await pool.query(`
        SELECT m.ID_STOCK, m.fecha_hora_movimiento, 
               m.tipo_movimiento, m.motivo, m.cantidad,
               m.valor_unitario_movimiento, m.subtotal,
               u.nombre as usuario, ub.nombre_ubicacion
        FROM movimiento m
        LEFT JOIN usuario u ON m.UsuarioID_Usuario = u.ID_Usuario
        LEFT JOIN ubicacion ub ON m.UbicacionID_Ubicacion = ub.ID_Ubicacion
        WHERE m.ProductoID_Producto = ?
        ORDER BY m.fecha_hora_movimiento DESC
      `, [productoId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = InformesModel;