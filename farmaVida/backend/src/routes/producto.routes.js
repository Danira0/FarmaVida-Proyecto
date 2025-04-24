import { Router } from "express";
import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
  getProductoById,
  updateProductoStock,
  getTodosProductos,
  getProductosPorVencer,
  getProductosenStock,
  getProductosPorFechaIngreso,
} from "../controllers/producto.controller.js";
import { getFechavenci } from "../controllers/medicaFechaVenci.controller.js";
import { verificarStockYEnviarAlerta } from "../controllers/stockminimo.controller.js"; 
import upload from '../middlewares/producto.imagen.js';

const router = Router();

router.get('/obtener/productos', getProductos);
router.post('/registrar/productos', upload.single('imagen'), createProducto);
router.put('/actualizar/productos/:id', upload.single('imagen'), updateProducto);
router.put('/actualizar/stock/productos/:id', updateProductoStock);
router.delete('/eliminar/productos/:id', deleteProducto);
router.get('/caducidad/productos', getFechavenci);
router.get('/obtener/producto/:id', getProductoById);
router.get('/verificar-stock', verificarStockYEnviarAlerta);

/*INFORMES */ 
router.get('/productos/todos', getTodosProductos);
router.get('/productos/vencer', getProductosPorVencer);
router.get('/productos/stock', getProductosenStock);
router.get('/productos/fecha-ingreso', getProductosPorFechaIngreso);

export default router;