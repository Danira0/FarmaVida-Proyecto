const express = require('express');
const usuarioController = require('../controllers/usuarioController');

const router = express.Router();

// Rutas para usuarios
router.get('/', usuarioController.getAllUsuarios);
router.get('/porRol/:rolId', usuarioController.getUsuariosPorRol);
router.get('/empleados', usuarioController.getEmpleados);
router.get('/porFechaRegistro', usuarioController.getUsuariosPorFechaRegistro);
router.get('/:id', usuarioController.getUsuarioById);

module.exports = router;
