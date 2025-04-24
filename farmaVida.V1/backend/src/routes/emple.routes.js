import { Router } from 'express';
import { getEmpleados, createEmple, updateEmple, deleteEmple } from '../controllers/crearEmple.controller.js';

const router = Router();

router.get('/obtener/empleado', getEmpleados);
router.post('/registrar/empleado', createEmple);
router.put('/actualizar/empleado/:id', updateEmple);
router.delete('/eliminar/empleado/:id', deleteEmple);

export default router;
