import { Router } from 'express';
import { 
  getInvoices, 
  getInvoiceById, 
  createInvoice, 
  updateInvoiceStatus, 
  generateInvoicePDF,
  deleteInvoice 
} from '../controllers/invoice.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// CRUD de facturas
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.post('/', createInvoice);
router.patch('/:id/status', updateInvoiceStatus);
router.get('/:id/pdf', generateInvoicePDF);
router.delete('/:id', deleteInvoice);

export default router;
