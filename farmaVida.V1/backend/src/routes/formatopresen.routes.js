import { Router } from 'express';
import {
    getFormatopresentacion,
    createFormatopresentacion,
    updateFormatopresentacion,
    deleteFormatopresentacion,
  } from '../controllers/formatopresen.controller.js';
    
    const router = Router();

    router.get('/obtener/presentaciones', getFormatopresentacion);
    router.post('/registrar/presentaciones', createFormatopresentacion);
    router.put('/actualizar/presentaciones/:id', updateFormatopresentacion);
    router.delete('/eliminar/presentaciones/:id', deleteFormatopresentacion);

    export default router;