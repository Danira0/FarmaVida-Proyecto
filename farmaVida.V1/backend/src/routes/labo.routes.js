import { Router } from 'express';
import { 
    getProveedores, 
    createProveedor, 
    updateProveedor, 
    deleteProveedor, 
    getProveedorById,
    getTodosProveedor,
    getLaboratorioById,
    getProductoPorLaboratorio,
} from '../controllers/labo.controller.js';
import upload from '../middlewares/imagen.labo.js';

const router = Router();

router.get('/obtener/proveedores', getProveedores);
router.get('/obtener/proveedores/:id', getProveedorById);
router.post('/registrar/proveedores', upload.single('imagen'), createProveedor);
router.put('/actualizar/proveedores/:id', upload.single('imagen'), updateProveedor);
router.delete('/eliminar/proveedores/:id', deleteProveedor);

router.get('/proveedor/todos', getTodosProveedor);
router.get('/proveedor/laboratorio/:id', getLaboratorioById);
router.get('/proveedor/productoporlaboratorio', getProductoPorLaboratorio);

export default router;
