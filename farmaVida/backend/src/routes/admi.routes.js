import { Router } from 'express';
import { 
  getAdmi, 
  createAdmi, 
  updateAdmi, 
  deleteAdmi, 
  getAdmiImage 
} from '../controllers/crearAdmi.controller.js';
import upload from '../middlewares/admiImagen.js';

const router = Router();

router.get('/obtener/administrador', getAdmi);
router.get('/administrador/imagen/:id', getAdmiImage);
router.post('/registrar/administrador', upload.single('imagen'), createAdmi);
router.put('/actualizar/administrador/:id', upload.single('imagen'), updateAdmi);
router.delete('/eliminar/administrador/:id', deleteAdmi);

export default router;