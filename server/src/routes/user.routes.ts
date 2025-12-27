import { Router } from 'express';
import { 
  getProfile, 
  updateProfile, 
  changePassword, 
  deleteAccount 
} from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener perfil
router.get('/profile', getProfile);

// Actualizar perfil
router.put('/profile', updateProfile);

// Cambiar contraseña
router.put('/password', changePassword);

// Eliminar cuenta
router.delete('/account', deleteAccount);

export default router;
