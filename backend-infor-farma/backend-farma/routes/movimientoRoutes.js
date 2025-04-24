const express = require('express');
const movimientoController = require('../controllers/movimientoController');

const router = express.Router();

// Rutas para movimientos
router.get('/', movimientoController.getAllMovimientos);
router.get('/porFecha', movimientoController.getMovimientosPorFecha);
router.get('/porProducto/:productoId', movimientoController.getMovimientosPorProducto);
router.get('/porUsuario/:usuarioId', movimientoController.getMovimientosPorUsuario);
router.get('/porTipo/:tipo', movimientoController.getMovimientosPorTipo);

module.exports = router;