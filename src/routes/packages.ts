import { Router } from 'express';
import { getPackages, createPackage, updatePackageStatus, assignPackage } from '../controllers/packageController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getPackages);
router.post('/', authenticateToken, requireRole('admin'), createPackage);
router.put('/:id/status', authenticateToken, updatePackageStatus);
router.put('/:id/assign', authenticateToken, requireRole('admin'), assignPackage);

export default router;

