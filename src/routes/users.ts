import { Router } from 'express';
import { getDeliveryUsers, getAllUsers } from '../controllers/userController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.get('/delivery', authenticateToken, requireRole('admin'), getDeliveryUsers);
router.get('/', authenticateToken, requireRole('admin'), getAllUsers);

export default router;

