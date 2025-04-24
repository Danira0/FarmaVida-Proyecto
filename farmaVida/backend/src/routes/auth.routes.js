import { Router } from 'express';
import { login, register, approveUser, denyUser, requestPasswordReset, verifyResetCode, resetPassword } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/olvidar-contrasena', requestPasswordReset);
router.post('/establecer-codigo-verificacion', verifyResetCode);
router.post('/establecer-contrasena', resetPassword);


router.get('/verify', (req, res) => {
  const { action } = req.query;

  if (action === 'aprobar') {
    return approveUser(req, res);
  } else if (action === 'denegar') {
    return denyUser(req, res);
  }

  return res.status(400).json({ message: 'Acción inválida.' });
});

export default router;


