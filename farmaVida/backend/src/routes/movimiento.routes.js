import { Router} from 'express';
import { getMovimiento, createMovimiento, updateMovimiento, deleteMovimiento, getMovimientoById, getTodosMovimientos, getMovimientoPorFecha, getMovimientoPorProducto,  getMovimientoPorUsuario, getMovimientoPorTipo, getProductosParaDevolucion, createDevolucion} from '../controllers/movimiento.controller.js';
import { getUsuarios } from '../controllers/verUsuarios.controller.js';
import { getPresentaciones } from '../controllers/verPresentacion.controller.js';
import { getProductos, getProductosByPresentacion } from '../controllers/filtroPresenProd.controller.js';
import upload from '../middlewares/ubicacion.imagen.js';


const router = Router();

router.get('/obtener/movimientos', getMovimiento);
router.get('/obtener/movimiento/:id', getMovimientoById);
router.get ('/obtener/usuarios', getUsuarios);
router.get('/obtener/presentaciones', getPresentaciones);
router.get('/obtener/productos', getProductos);
router.get('/obtener/productos/presentacion/:id', getProductosByPresentacion);

router.post('/registrar/movimiento', upload.single('imagen'), createMovimiento);
router.put('/actualizar/movimiento/:id', upload.single('imagen'), updateMovimiento);
router.delete('/eliminar/movimiento/:id', deleteMovimiento);

router.get('/devolucion/usuario/:usuarioId', getProductosParaDevolucion);
router.post('/devolucion/:movimientoId', createDevolucion)

/* Informes */ 
router.get('/movimiento/todos', getTodosMovimientos);
router.get('/movimiento/fechas', getMovimientoPorFecha);
router.get('/movimiento/porproducto', getMovimientoPorProducto);
router.get('/movimiento/usuario/:usuarioId', getMovimientoPorUsuario);
router.get('/movimiento/tipo', getMovimientoPorTipo);
export default router;
