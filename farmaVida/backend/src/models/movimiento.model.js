import db from "../config/db.js";

export const getMovimientos = async (tipo_movimiento = null) => {
  let query = `
    SELECT 
      m.ID_STOCK,
      p.nombre AS producto,
      pr.nombre_presentacion AS presentacion_nombre,
      u.nombre AS usuario,
      ub.nombre_ubicacion AS ubicacion_nombre,
      m.fecha_hora_movimiento,
      m.cantidad,
      m.motivo,
      m.tipo_movimiento,
      m.observaciones,
      m.subtotal,
      m.total_venta,
      m.iva_aplicado,
      m.valor_unitario_movimiento,
      m.movimiento_referencia,
       orig.fecha_hora_movimiento AS fecha_movimiento_referencia,
      orig.tipo_movimiento AS tipo_movimiento_referencia
    FROM movimiento m
    JOIN producto p ON m.ProductoID_Producto = p.ID_PRODUCTO
    JOIN presentacion pr ON m.PresentacionID_Presentacion = pr.ID_presentacion
    JOIN usuario u ON m.UsuarioID_Usuario = u.ID_Usuario
    JOIN ubicacion ub ON m.UbicacionID_Ubicacion = ub.ID_Ubicacion
    LEFT JOIN movimiento orig ON m.movimiento_referencia = orig.ID_STOCK
  `;

  if (tipo_movimiento) {
    query += ` WHERE m.tipo_movimiento = ?`;
  }

  query += ` ORDER BY m.fecha_hora_movimiento DESC`;

  const [result] = await db.promise().query(query, tipo_movimiento ? [tipo_movimiento] : []);
  return result;
};

export const getMovimientoById = async (id) => {
  const query = `
    SELECT 
      m.ID_STOCK,
      p.nombre AS producto,
      pr.nombre_presentacion AS presentacion_nombre,
      u.nombre AS usuario,
      ub.nombre_ubicacion AS ubicacion_nombre,
      m.fecha_hora_movimiento,
      m.cantidad,
      m.motivo,
      m.tipo_movimiento,
      m.observaciones,
      m.subtotal,
      m.total_venta,
      m.iva_aplicado,
      m.valor_unitario_movimiento
    FROM movimiento m
    JOIN producto p ON m.ProductoID_Producto = p.ID_PRODUCTO
    JOIN presentacion pr ON m.PresentacionID_Presentacion = pr.ID_presentacion
    JOIN usuario u ON m.UsuarioID_Usuario = u.ID_Usuario
    JOIN ubicacion ub ON m.UbicacionID_Ubicacion = ub.ID_Ubicacion
    WHERE m.ID_STOCK = ?
  `;
  
  try {
    const [movimiento] = await db.promise().query(query, [id]);
    
    if (movimiento.length > 0) {
      const [imagenes] = await db.promise().query(
        `SELECT * FROM imagen WHERE ID_Ubicacion = ?`,
        [id]
      );
      movimiento[0].imagenes = imagenes;
      return movimiento[0];
    }
    return null;
  } catch (error) {
    console.error("Error al obtener el movimiento por ID:", error);
    throw error;
  }
};

export const getDevoluciones = async () => {
  const query = `
    SELECT 
      dev.ID_STOCK AS id_devolucion,
      dev.fecha_hora_movimiento AS fecha_devolucion,
      orig.ID_STOCK AS id_movimiento_original,
      orig.fecha_hora_movimiento AS fecha_original,
      TIMESTAMPDIFF(HOUR, orig.fecha_hora_movimiento, dev.fecha_hora_movimiento) AS horas_transcurridas,
      p.nombre AS producto_nombre,
      pr.nombre_presentacion,
      u.nombre AS usuario_nombre,
      dev.cantidad AS cantidad_devuelta,
      dev.motivo,
      dev.observaciones
    FROM movimiento dev
    JOIN movimiento orig ON dev.movimiento_referencia = orig.ID_STOCK
    JOIN producto p ON dev.ProductoID_Producto = p.ID_PRODUCTO
    JOIN presentacion pr ON dev.PresentacionID_Presentacion = pr.ID_Presentacion
    JOIN usuario u ON dev.UsuarioID_Usuario = u.ID_Usuario
    WHERE dev.tipo_movimiento = 'Devolucion'
    ORDER BY dev.fecha_hora_movimiento DESC
  `;
  
  const [result] = await db.promise().query(query);
  return result;
};

export const createMovimiento = async (movimiento) => {
  const {
    ProductoID_Producto,
    PresentacionID_Presentacion,
    UsuarioID_Usuario,
    UbicacionID_Ubicacion,
    cantidad,
    fecha_hora_movimiento,
    tipo_movimiento,
    motivo,
    observaciones,
    iva_aplicado = null,
    subtotal = null,
    total_venta = null,
    valor_unitario_movimiento = null,
    movimiento_referencia = null
  } = movimiento;

  const query = `
    INSERT INTO movimiento (
      ProductoID_Producto,
      PresentacionID_Presentacion,
      UsuarioID_Usuario,
      UbicacionID_Ubicacion,
      cantidad,
      fecha_hora_movimiento,
      tipo_movimiento,
      motivo,
      observaciones,
      iva_aplicado,
      subtotal,
      total_venta,
      valor_unitario_movimiento,
      movimiento_referencia
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const [result] = await db.promise().execute(query, [
      ProductoID_Producto,
      PresentacionID_Presentacion,
      UsuarioID_Usuario,
      UbicacionID_Ubicacion,
      cantidad,
      fecha_hora_movimiento,
      tipo_movimiento,
      motivo,
      observaciones,
      iva_aplicado,
      subtotal,
      total_venta,
      valor_unitario_movimiento,
      movimiento_referencia
    ]);

    return result.insertId;
  } catch (error) {
    console.error("Error al crear el movimiento en la base de datos:", error);
    throw error;
  }
};

export const updateMovimiento = async (id, movimiento) => {
  const query = `
    UPDATE movimiento
    SET
      ProductoID_Producto = ?,
      PresentacionID_Presentacion = ?,
      UsuarioID_Usuario = ?,
      UbicacionID_Ubicacion = ?,
      cantidad = ?,
      fecha_hora_movimiento = ?,
      tipo_movimiento = ?,
      motivo = ?,
      observaciones = ?,
      iva_aplicado = ?,
      subtotal = ?,
      total_venta = ?,
      valor_unitario_movimiento = ?
    WHERE ID_STOCK = ?
  `;

  const [result] = await db.promise().execute(query, [
    movimiento.ProductoID_Producto,
    movimiento.PresentacionID_Presentacion,
    movimiento.UsuarioID_Usuario,
    movimiento.UbicacionID_Ubicacion,
    movimiento.cantidad,
    movimiento.fecha_hora_movimiento,
    movimiento.tipo_movimiento,
    movimiento.motivo,
    movimiento.observaciones,
    movimiento.iva_aplicado,
    movimiento.subtotal,
    movimiento.total_venta,
    movimiento.valor_unitario_movimiento,
    id,
  ]);

  return result.affectedRows;
};

export const deleteMovimiento = async (id) => {
  const [movimiento] = await db.promise().query(
    `SELECT ProductoID_Producto, PresentacionID_Presentacion 
     FROM movimiento WHERE ID_STOCK = ?`,
    [id]
  );

  if (movimiento.length > 0) {
    const { ProductoID_Producto, PresentacionID_Presentacion } = movimiento[0];
    const [count] = await db.promise().query(
      `SELECT COUNT(*) as count FROM movimiento 
       WHERE ProductoID_Producto = ? AND PresentacionID_Presentacion = ?`,
      [ProductoID_Producto, PresentacionID_Presentacion]
    );

    if (count[0].count === 1) {
      throw new Error("No se puede eliminar el único movimiento de este producto con esta presentación");
    }
  }

  // Si no es único, proceder con la eliminación
  const query = `DELETE FROM movimiento WHERE ID_STOCK = ?`;
  const [result] = await db.promise().execute(query, [id]);
  return result.affectedRows;
};