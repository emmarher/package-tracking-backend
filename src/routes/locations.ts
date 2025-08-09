import { Router } from 'express';
import { getLocations, getCurrentLocations, createLocation } from '../controllers/locationController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.get('/current', authenticateToken, requireRole('admin'), getCurrentLocations);
router.get('/:userId', authenticateToken, getLocations);
router.post('/', authenticateToken, requireRole('delivery'), createLocation);

export default router;

