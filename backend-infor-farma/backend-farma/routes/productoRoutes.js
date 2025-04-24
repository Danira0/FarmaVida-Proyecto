const express = require('express');
const productoController = require('../controllers/productoController');

const router = express.Router();

// Rutas para productos
router.get('/', productoController.getAllProductos);
router.get('/porVencer', productoController.getProductosPorVencer);
router.get('/enStock', productoController.getProductosEnStock);
router.get('/porFechaIngreso', productoController.getProductosPorFechaIngreso);
router.get('/:id', productoController.getProductoById);

module.exports = router;
