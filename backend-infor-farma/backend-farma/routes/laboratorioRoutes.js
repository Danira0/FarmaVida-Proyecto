const express = require('express');
const laboratorioController = require('../controllers/laboratorioController');

const router = express.Router();

// Rutas para laboratorios (proveedores)
router.get('/', laboratorioController.getAllLaboratorios);
router.get('/:id', laboratorioController.getLaboratorioById);
router.get('/:labId/productos', laboratorioController.getProductosPorLaboratorio);

module.exports = router;
