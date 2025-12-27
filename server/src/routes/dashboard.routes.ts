import { Router } from 'express';
import { 
  getDashboardMetrics, 
  getRecentActivity, 
  getMonthlyRevenue 
} from '../controllers/dashboard.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Métricas del dashboard
router.get('/metrics', getDashboardMetrics);
router.get('/activity', getRecentActivity);
router.get('/revenue', getMonthlyRevenue);

export default router;
