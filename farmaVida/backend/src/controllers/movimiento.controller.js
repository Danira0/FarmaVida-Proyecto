import { getProductoById, updateProductoStock } from "./producto.controller.js";
import {
  getMovimientos as getMovimientoModel,
  getMovimientoById as getMovimientoByIdModel,
  createMovimiento as createMovimientoModel,
  updateMovimiento as updateMovimientoModel,
  deleteMovimiento as deleteMovimientoModel,
} from "../models/movimiento.model.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { config } from "process";
import db from "../config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAX_HORAS_DEVOLUCION = 8;
const PRESENTACIONES_UNIDADES = [1, 2]; 
const PRESENTACIONES_FRASCOS = [3, 4, 5, 6]; 

export const getProductosParaDevolucion = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const [movimientos] = await db.promise().query(`
      SELECT m.*, p.nombre AS nombre_producto, pr.nombre_presentacion, 
             u.nombre AS nombre_usuario, u.apellido AS apellido_usuario, ub.nombre_ubicacion
      FROM movimiento m
      LEFT JOIN producto p ON m.ProductoID_Producto = p.ID_PRODUCTO
      LEFT JOIN presentacion pr ON m.PresentacionID_Presentacion = pr.ID_Presentacion
      LEFT JOIN usuario u ON m.UsuarioID_Usuario = u.ID_Usuario
      LEFT JOIN ubicacion ub ON m.UbicacionID_Ubicacion = ub.ID_Ubicacion
      WHERE m.tipo_movimiento = 'Salida' 
      AND m.UsuarioID_Usuario = ?
      AND m.fecha_hora_movimiento >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      ORDER BY m.fecha_hora_movimiento DESC
    `, [usuarioId, MAX_HORAS_DEVOLUCION]);
    
    res.json(movimientos);
  } catch (error) {
    console.error("Error al obtener productos para devolución:", error);
    res.status(500).json({
      error: error.message
    });
  }
};

export const getMovimiento = async (req, res) => {
  try {
    const movimientos = await getMovimientoModel();
    res.status(200).json(movimientos);
  } catch (error) {
    console.error("Error al obtener los movimientos", error);
    res.status(500).json({
      message: "Error al obtener los movimientos",
      error: error.message,
    });
  }
};

export const getMovimientoById = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "ID es obligatorio" });
  }
  try {
    const movimiento = await getMovimientoByIdModel(id);
    if (!movimiento) {
      return res.status(404).json({
        message: "Movimiento no encontrado",
      });
    }
    res.status(200).json(movimiento);
  } catch (error) {
    console.error("Error al obtener el movimiento por el ID:", error);
    res.status(500).json({
      message: "Error al obtener el movimiento por ID",
      error: error.message,
    });
  }
};

// 1. Obtener todos los movimientos
export const getTodosMovimientos = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT m.*, p.nombre AS nombre_producto, pr.nombre_presentacion, 
             u.nombre AS nombre_usuario, ub.nombre_ubicacion
      FROM movimiento m
      LEFT JOIN producto p ON m.ProductoID_Producto = p.ID_PRODUCTO
      LEFT JOIN presentacion pr ON m.PresentacionID_Presentacion = pr.ID_Presentacion
      LEFT JOIN usuario u ON m.UsuarioID_Usuario = u.ID_Usuario
      LEFT JOIN ubicacion ub ON m.UbicacionID_Ubicacion = ub.ID_Ubicacion
      ORDER BY m.fecha_hora_movimiento DESC`
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Obtener movimientos por fecha
export const getMovimientoPorFecha = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    let query = `SELECT m.*, p.nombre AS nombre_producto, pr.nombre_presentacion, 
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
export const getMovimientoPorProducto = async (req, res) => {
  try {
    const {productoId} = req.params;

    const [rows] = await db.promise().query(`
        SELECT m.*, p.nombre AS nombre_producto, pr.nombre_presentacion, 
             u.nombre AS nombre_usuario, u.apellido AS apellido_usuario, ub.nombre_ubicacion
      FROM movimiento m
      LEFT JOIN producto p ON m.ProductoID_Producto = p.ID_PRODUCTO
      LEFT JOIN presentacion pr ON m.PresentacionID_Presentacion = pr.ID_Presentacion
      LEFT JOIN usuario u ON m.UsuarioID_Usuario = u.ID_Usuario
      LEFT JOIN ubicacion ub ON m.UbicacionID_Ubicacion = ub.ID_Ubicacion
      WHERE m.ProductoID_Producto = ?
      ORDER BY m.fecha_hora_movimiento DESC`, [productoId]);
      
      res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message});
  }
}

// 4. Obtener movimientos por usuario

export const getMovimientoPorUsuario = async (req, res) => {
  try {
    const {usuarioId} = req.params;

    const [rows] = await db.promise().query(`
       SELECT m.*, p.nombre AS nombre_producto, pr.nombre_presentacion, 
             u.nombre AS nombre_usuario, u.apellido AS apellido_usuario, ub.nombre_ubicacion
      FROM movimiento m
      LEFT JOIN producto p ON m.ProductoID_Producto = p.ID_PRODUCTO
      LEFT JOIN presentacion pr ON m.PresentacionID_Presentacion = pr.ID_Presentacion
      LEFT JOIN usuario u ON m.UsuarioID_Usuario = u.ID_Usuario
      LEFT JOIN ubicacion ub ON m.UbicacionID_Ubicacion = ub.ID_Ubicacion
      WHERE m.UsuarioID_Usuario = ?
      ORDER BY m.fecha_hora_movimiento DESC`, [usuarioId]);
      res.json(rows);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

// 5. Obtener movimientos por tipo (Entrada, Salida, etc.)

export const getMovimientoPorTipo = async (req, res) => {
  try {
    const { tipo }= req.params;
    const [rows] = await db.promise.query(`
         SELECT m.*, p.nombre AS nombre_producto, pr.nombre_presentacion, 
             u.nombre AS nombre_usuario, u.apellido AS apellido_usuario, ub.nombre_ubicacion
      FROM movimiento m
      LEFT JOIN producto p ON m.ProductoID_Producto = p.ID_PRODUCTO
      LEFT JOIN presentacion pr ON m.PresentacionID_Presentacion = pr.ID_Presentacion
      LEFT JOIN usuario u ON m.UsuarioID_Usuario = u.ID_Usuario
      LEFT JOIN ubicacion ub ON m.UbicacionID_Ubicacion = ub.ID_Ubicacion
      WHERE m.tipo_movimiento = ?
      ORDER BY m.fecha_hora_movimiento DESC`, [tipo]);
      res.json(rows);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export const createDevolucion = async (req, res) => {
  const { movimientoId } = req.params;
  const { motivo, observaciones } = req.body;
  
  try {
    // 1. Verificar que el movimiento existe y es válido para devolución
    const [movimientoData] = await db.promise().query(`
      SELECT m.*, p.*, pr.nombre_presentacion
      FROM movimiento m
      JOIN producto p ON m.ProductoID_Producto = p.ID_PRODUCTO
      JOIN presentacion pr ON m.PresentacionID_Presentacion = pr.ID_Presentacion
      WHERE m.ID_STOCK = ? AND m.tipo_movimiento = 'Salida'
    `, [movimientoId]);
    
    if (movimientoData.length === 0) {
      return res.status(404).json({
        message: "Movimiento de salida no encontrado",
        error: "MOVIMIENTO_NO_ENCONTRADO"
      });
    }
    
    const movimientoOriginal = movimientoData[0];
    const ahora = new Date();
    const fechaMovimiento = new Date(movimientoOriginal.fecha_hora_movimiento);
    const horasTranscurridas = (ahora - fechaMovimiento) / (1000 * 60 * 60);
    
    if (horasTranscurridas > MAX_HORAS_DEVOLUCION) {
      return res.status(400).json({
        message: `No se puede devolver el producto. Han pasado más de ${MAX_HORAS_DEVOLUCION} horas desde la salida.`,
        error: "TIEMPO_EXCEDIDO",
        horasTranscurridas: horasTranscurridas.toFixed(2)
      });
    }
    
    // 2. Crear el movimiento de devolución
    const fecha_hora_movimiento = ahora.toISOString().slice(0, 19).replace("T", " ");
    
    let cantidadDevolucion = movimientoOriginal.cantidad;
    let mensaje = "";
    
    // 3. Actualizar el inventario según la presentación
    const productoActual = await getProductoById(movimientoOriginal.ProductoID_Producto);
    
    if ([1, 2].includes(movimientoOriginal.PresentacionID_Presentacion)) {
      // Cápsulas o tabletas (se devuelven unidades)
      productoActual.cantidad_unidades += cantidadDevolucion;
      mensaje = `Se han devuelto ${cantidadDevolucion} unidades de ${productoActual.nombre}.`;
    } else {
      // Otras presentaciones (frascos, tubos, etc.)
      productoActual.cantidad_frascos += cantidadDevolucion;
      mensaje = `Se han devuelto ${cantidadDevolucion} frascos/tubos de ${productoActual.nombre}.`;
    }
    
    const nuevoMovimiento = {
      ProductoID_Producto: movimientoOriginal.ProductoID_Producto,
      PresentacionID_Presentacion: movimientoOriginal.PresentacionID_Presentacion,
      UsuarioID_Usuario: movimientoOriginal.UsuarioID_Usuario,
      UbicacionID_Ubicacion: movimientoOriginal.UbicacionID_Ubicacion,
      fecha_hora_movimiento,
      cantidad: cantidadDevolucion,
      tipo_movimiento: "Devolucion",
      motivo: motivo || "Devolución de producto",
      observaciones: observaciones || `Devolución del movimiento ${movimientoId}`,
      iva_aplicado: movimientoOriginal.iva_aplicado,
      subtotal: movimientoOriginal.subtotal,
      total_venta: movimientoOriginal.total_venta,
      valor_unitario_movimiento: movimientoOriginal.valor_unitario_movimiento,
      movimiento_referencia: movimientoId  
    };
    
    const idMovimiento = await createMovimientoModel(nuevoMovimiento);
    
    await updateProductoStock({
      id: movimientoOriginal.ProductoID_Producto,
      cantidad_unidades: productoActual.cantidad_unidades,
      cantidad_frascos: productoActual.cantidad_frascos
    });
    
    res.status(201).json({
      message: "Devolución realizada correctamente",
      id: idMovimiento,
      mensaje: mensaje,
      movimientoOriginal: movimientoOriginal,
      horasTranscurridas: horasTranscurridas.toFixed(2)
    });
    
  } catch (error) {
    console.error("Error al procesar la devolución:", error);
    res.status(500).json({
      message: "Error al procesar la devolución",
      error: error.message
    });
  }
};

export const createMovimiento = async (req, res) => {
  const movimiento = req.body;
  const imagen = req.file;

  console.log("Datos recibidos para crear movimiento:", movimiento);

  try {
    const [existingMovements] = await db.promise().query(
      `SELECT * FROM movimiento 
       WHERE ProductoID_Producto = ? AND PresentacionID_Presentacion = ?`,
      [movimiento.ProductoID_Producto, movimiento.PresentacionID_Presentacion]
    );

    if (existingMovements.length > 0) {
      return res.status(400).json({
        message: "Este producto con esta presentación ya está registrado",
        error: "DUPLICATE_PRODUCT_PRESENTATION"
      });
    }
  } catch (error) {
    console.error("Error al verificar movimientos existentes:", error);
    return res.status(500).json({
      message: "Error al verificar movimientos existentes",
      error: error.message
    });
  }

  if (![...PRESENTACIONES_UNIDADES, ...PRESENTACIONES_FRASCOS].includes(movimiento.PresentacionID_Presentacion)) {
    return res.status(400).json({ message: "Presentación no válida" });
  }


  const camposRequeridos = [
    "ProductoID_Producto",
    "PresentacionID_Presentacion",
    "UsuarioID_Usuario",
    "UbicacionID_Ubicacion",
    "cantidad",
    "tipo_movimiento",
    "motivo",
    "observaciones",
  ];

  if (movimiento.tipo_movimiento === "Salida") {
    camposRequeridos.push("valor_unitario_movimiento");
  }

  if (imagen) {
    const imagenPath = path.relative(
      path.join(__dirname, "../public"),
      imagen.path
    );

    await db.promise().execute(
      "INSERT INTO imagen (imagen_producto, ID_Ubicacion) VALUES (?, ?)",
      [imagenPath, movimiento.UbicacionID_Ubicacion] 
    );
  }

  const camposFaltantes = camposRequeridos.filter(
    (campo) =>
      movimiento[campo] === undefined ||
      movimiento[campo] === null ||
      movimiento[campo] === ""
  );
  const fecha_hora_movimiento = new Date()
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  const {
    ProductoID_Producto,
    PresentacionID_Presentacion,
    UsuarioID_Usuario,
    UbicacionID_Ubicacion,
    cantidad,
    tipo_movimiento,
    motivo,
    observaciones,
    valor_unitario_movimiento,
  } = movimiento;

  try {
    console.log("Obteniendo producto...");
    const [productoData] = await db.promise().query(`
      SELECT p.*, e.nombre_estado 
      FROM producto p
      LEFT JOIN estado e ON p.EstadoID_Estado = e.ID_ESTADO
      WHERE p.ID_PRODUCTO = ?
    `, [ProductoID_Producto]);
    
    if (!productoData || productoData.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const producto = productoData[0];


    if (tipo_movimiento === "Salida" && (producto.nombre_estado === "Inactivo" || producto.EstadoID_Estado === 2)) {
      return res.status(400).json({
        message: "No se puede realizar salida de un producto inactivo",
        error: "INACTIVE_PRODUCT"
      });
    }

    if (tipo_movimiento === "Salida") {
      if (!producto.fecha_vencimiento) {
        return res.status(400).json({
          message: "El producto no tiene fecha de vencimiento definida",
          error: "MISSING_EXPIRATION_DATE"
        });
      }
      
      const fechaActual = new Date();
      const fechaVencimiento = new Date(producto.fecha_vencimiento);
      
      fechaActual.setHours(0, 0, 0, 0);
      fechaVencimiento.setHours(0, 0, 0, 0);
      
      if (fechaVencimiento <= fechaActual) {
        return res.status(400).json({
          message: `No se puede realizar salida de un producto vencido (fecha de vencimiento: ${producto.fecha_vencimiento})`,
          error: "EXPIRED_PRODUCT",
          fecha_vencimiento: producto.fecha_vencimiento,
          fecha_actual: fechaActual.toISOString().split('T')[0]
        });
      }
    }

    if (
      PRESENTACIONES_UNIDADES.includes(PresentacionID_Presentacion) &&
      (!producto.unidades_por_blister || producto.unidades_por_blister <= 0)
    ) {
      return res.status(400).json({
        message: "El producto no tiene definido el número de unidades por blister",
      });
    }

    console.log("Producto obtenido:", producto);

    let cantidadUnidades = cantidad;
    let cantidadFrascos = cantidad;
    let mensaje = "";

    if (tipo_movimiento === "Entrada") {
      if (PRESENTACIONES_UNIDADES.includes(PresentacionID_Presentacion)) {
        // Para cápsulas y tabletas, calcular unidades totales
        cantidadUnidades = cantidad * producto.unidades_por_blister;
        mensaje = `Se han repuesto ${cantidad} blisters de ${producto.nombre}, equivalentes a ${cantidadUnidades} unidades.`;
        producto.cantidad_unidades = (producto.cantidad_unidades || 0) + cantidadUnidades;
      } else if (PRESENTACIONES_FRASCOS.includes(PresentacionID_Presentacion)) {
        // Para otras presentaciones, usar frascos directamente
        mensaje = `Se han repuesto ${cantidad} frascos/tubos de ${producto.nombre}.`;
        producto.cantidad_frascos = (producto.cantidad_frascos || 0) + cantidad;
        cantidadUnidades = cantidad;
      }

      const nuevoMovimiento = {
        ProductoID_Producto,
        PresentacionID_Presentacion,
        UsuarioID_Usuario,
        UbicacionID_Ubicacion,
        fecha_hora_movimiento,
        cantidad: cantidadUnidades,
        tipo_movimiento,
        motivo,
        observaciones,
        iva_aplicado: null,
        subtotal: null,
        total_venta: null,
        valor_unitario_movimiento: null,
      };

      console.log("Creando movimiento...");
      const idMovimiento = await createMovimientoModel(nuevoMovimiento);
      console.log("Movimiento creado con ID:", idMovimiento);

      console.log("Actualizando stock del producto...");
      await updateProductoStock({
        id: ProductoID_Producto,
        cantidad_unidades: producto.cantidad_unidades,
        cantidad_frascos: producto.cantidad_frascos,
      });

      console.log("Stock del producto actualizado correctamente");

      return res.status(201).json({
        message: "Movimiento creado correctamente",
        id: idMovimiento,
        mensaje: mensaje,
      });
   
    } else if (tipo_movimiento === "Salida") {
      if (PRESENTACIONES_UNIDADES.includes(PresentacionID_Presentacion)) {
        if ((producto.cantidad_unidades || 0) < cantidadUnidades) {
          return res.status(400).json({
            message: "No hay suficiente stock para realizar la salida",
          });
        }
        producto.cantidad_unidades -= cantidadUnidades;
        mensaje = `Se han vendido ${cantidadUnidades} unidades de ${producto.nombre}.`;
      } else if (PRESENTACIONES_FRASCOS.includes(PresentacionID_Presentacion)) {
        if ((producto.cantidad_frascos || 0) < cantidad) {
          return res.status(400).json({
            message: "No hay suficiente stock para realizar la salida",
          });
        }
        producto.cantidad_frascos -= cantidad;
        mensaje = `Se han vendido ${cantidad} frascos/tubos de ${producto.nombre}.`;
      }

      const subtotal = cantidadUnidades * valor_unitario_movimiento;
      const iva_aplicado = subtotal * 0.19;
      const total_venta = subtotal + iva_aplicado;

      const nuevoMovimiento = {
        ProductoID_Producto,
        PresentacionID_Presentacion,
        UsuarioID_Usuario,
        UbicacionID_Ubicacion,
        fecha_hora_movimiento,
        cantidad: cantidadUnidades,
        tipo_movimiento,
        motivo,
        observaciones,
        iva_aplicado,
        subtotal,
        total_venta,
        valor_unitario_movimiento,
      };

      console.log("Creando movimiento...");
      const idMovimiento = await createMovimientoModel(nuevoMovimiento);
      console.log("Movimiento creado con ID:", idMovimiento);

      console.log("Actualizando stock del producto...");
      await updateProductoStock({
        id: ProductoID_Producto,
        cantidad_unidades: producto.cantidad_unidades,
        cantidad_frascos: producto.cantidad_frascos,
      });
      console.log("Stock del producto actualizado correctamente");

      return res.status(201).json({
        message: "Movimiento creado correctamente",
        id: idMovimiento,
        mensaje: mensaje,
        imagen: imagen ? imagen.filename : null,
      });
    } else {
      return res.status(400).json({ message: "Tipo de movimiento no válido" });
    }
  } catch (error) {
    console.error("Error al crear el movimiento:", error);
    return res.status(500).json({
      message: "Error al crear el movimiento",
      error: error.message,
    });
  }
};

export const updateMovimiento = async (req, res) => {
  const { id } = req.params;
  const movimiento = req.body;
  const imagen = req.file;

  const PRESENTACIONES_FRASCOS = [3, 4, 5, 6];
  const PRESENTACIONES_UNIDADES = [1, 2];

  if (!id) {
    return res.status(400).json({ message: "ID es obligatorio" });
  }

  if (![...PRESENTACIONES_UNIDADES, ...PRESENTACIONES_FRASCOS].includes(movimiento.PresentacionID_Presentacion)) {
    return res.status(400).json({ message: "Presentación no válida" });
  }

  try {
    const movimientoActual = await getMovimientoByIdModel(id);
    if (!movimientoActual) {
      return res.status(404).json({ message: "Movimiento no encontrado" });
    }

    // Obtener producto relacionado
    const [productoData] = await db.promise().query(`
      SELECT p.*, e.nombre_estado 
      FROM producto p
      LEFT JOIN estado e ON p.EstadoID_Estado = e.ID_ESTADO
      WHERE p.ID_PRODUCTO = ?
    `, [movimiento.ProductoID_Producto]);
    
    if (!productoData || productoData.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const producto = productoData[0];

    // Validar unidades por blister para presentaciones que lo requieren
    if (PRESENTACIONES_UNIDADES.includes(movimiento.PresentacionID_Presentacion) && 
        (!producto.unidades_por_blister || producto.unidades_por_blister <= 0)) {
      return res.status(400).json({
        message: "El producto no tiene definido el número de unidades por blister",
      });
    }
    if (movimientoActual.tipo_movimiento === "Entrada") {
      if (PRESENTACIONES_UNIDADES.includes(movimientoActual.PresentacionID_Presentacion)) {
        producto.cantidad_unidades = (producto.cantidad_unidades || 0) - movimientoActual.cantidad;
      } else if (PRESENTACIONES_FRASCOS.includes(movimientoActual.PresentacionID_Presentacion)) {
        producto.cantidad_frascos = (producto.cantidad_frascos || 0) - movimientoActual.cantidad;
      }
    } else if (movimientoActual.tipo_movimiento === "Salida") {
      if (PRESENTACIONES_UNIDADES.includes(movimientoActual.PresentacionID_Presentacion)) {
        producto.cantidad_unidades = (producto.cantidad_unidades || 0) + movimientoActual.cantidad;
      } else if (PRESENTACIONES_FRASCOS.includes(movimientoActual.PresentacionID_Presentacion)) {
        producto.cantidad_frascos = (producto.cantidad_frascos || 0) + movimientoActual.cantidad;
      }
    }

    let cantidadUnidades = movimiento.cantidad;
    let mensaje = "";
    let movimientoActualizado = {
      ProductoID_Producto: movimiento.ProductoID_Producto,
      PresentacionID_Presentacion: movimiento.PresentacionID_Presentacion,
      UsuarioID_Usuario: movimiento.UsuarioID_Usuario,
      UbicacionID_Ubicacion: movimiento.UbicacionID_Ubicacion,
      fecha_hora_movimiento: movimiento.fecha_hora_movimiento || new Date().toISOString().slice(0, 19).replace("T", " "),
      tipo_movimiento: movimiento.tipo_movimiento,
      motivo: movimiento.motivo,
      observaciones: movimiento.observaciones,
      iva_aplicado: null,
      subtotal: null,
      total_venta: null,
      valor_unitario_movimiento: null
    };

    // Procesar según el tipo de movimiento
    if (movimiento.tipo_movimiento === "Entrada") {
      if (PRESENTACIONES_UNIDADES.includes(movimiento.PresentacionID_Presentacion)) {
        cantidadUnidades = movimiento.cantidad * producto.unidades_por_blister;
        producto.cantidad_unidades = (producto.cantidad_unidades || 0) + cantidadUnidades;
        mensaje = `Se han repuesto ${movimiento.cantidad} blisters de ${producto.nombre}, equivalentes a ${cantidadUnidades} unidades.`;
      } else {
        // Ajuste 3: Para frascos, usar directamente la cantidad
        producto.cantidad_frascos = (producto.cantidad_frascos || 0) + movimiento.cantidad;
        cantidadUnidades = movimiento.cantidad;
        mensaje = `Se han repuesto ${movimiento.cantidad} frascos/tubos de ${producto.nombre}.`;
      }

      movimientoActualizado.cantidad = cantidadUnidades;
    } else if (movimiento.tipo_movimiento === "Salida") {
      if (PRESENTACIONES_UNIDADES.includes(movimiento.PresentacionID_Presentacion)) {
        if ((producto.cantidad_unidades || 0) < cantidadUnidades) {
          return res.status(400).json({
            message: "No hay suficiente stock para realizar la salida",
          });
        }
        producto.cantidad_unidades -= cantidadUnidades;
        mensaje = `Se han vendido ${cantidadUnidades} unidades de ${producto.nombre}.`;
      } else {
        // Ajuste 4: Para frascos, verificar y restar directamente la cantidad
        if ((producto.cantidad_frascos || 0) < movimiento.cantidad) {
          return res.status(400).json({
            message: "No hay suficiente stock para realizar la salida",
          });
        }
        cantidadUnidades = movimiento.cantidad; // Usar la cantidad directamente para frascos
        producto.cantidad_frascos -= movimiento.cantidad;
        mensaje = `Se han vendido ${movimiento.cantidad} frascos/tubos de ${producto.nombre}.`;
      }

      // Cálculos para salida
      const subtotal = cantidadUnidades * movimiento.valor_unitario_movimiento;
      const iva_aplicado = subtotal * 0.19;
      const total_venta = subtotal + iva_aplicado;

      movimientoActualizado.cantidad = cantidadUnidades;
      movimientoActualizado.iva_aplicado = iva_aplicado;
      movimientoActualizado.subtotal = subtotal;
      movimientoActualizado.total_venta = total_venta;
      movimientoActualizado.valor_unitario_movimiento = movimiento.valor_unitario_movimiento;
    }

    const affectedRows = await updateMovimientoModel(id, movimientoActualizado);

    if (affectedRows === 0) {
      return res.status(404).json({ 
        message: "Movimiento no encontrado o no se pudo actualizar" 
      });
    }

    // Preparar datos para actualizar producto
    const updateData = {
      id: movimiento.ProductoID_Producto,
      cantidad_unidades: PRESENTACIONES_UNIDADES.includes(movimiento.PresentacionID_Presentacion) 
        ? producto.cantidad_unidades 
        : producto.cantidad_unidades, // No establecer como null para no perder datos
      cantidad_frascos: PRESENTACIONES_FRASCOS.includes(movimiento.PresentacionID_Presentacion) 
        ? producto.cantidad_frascos 
        : producto.cantidad_frascos, // No establecer como null para no perder datos
      PresentacionID_Presentacion: movimiento.PresentacionID_Presentacion
    };


    // Actualizar el stock del producto
    await updateProductoStock(updateData);

    return res.status(200).json({
      message: "Movimiento actualizado exitosamente",
      mensaje: mensaje
    });

  } catch (error) {
    console.error("Error al actualizar el movimiento:", error);
    return res.status(500).json({
      message: "Error al actualizar el movimiento",
      error: error.message,
    });
  }
};

export const deleteMovimiento = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "ID es obligatorio" });
  }

  try {
    const affectedRows = await deleteMovimientoModel(id);
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Movimiento no encontrado" });
    }
    res.status(200).json({ message: "Movimiento eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar el movimiento:", error);
    if (error.message.includes("No se puede eliminar el único movimiento")) {
      return res.status(400).json({
        message: error.message,
        error: "CANNOT_DELETE_UNIQUE_RECORD"
      });
    }
    res.status(500).json({
      message: "Error al eliminar el movimiento",
      error: error.message,
    });
  }
};
