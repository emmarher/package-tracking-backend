import { Router } from 'express';
import { login, getProfile, testEndpoint } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.get('/profile', authenticateToken, getProfile);
router.get('/test', testEndpoint);

export default router;

