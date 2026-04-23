import { Router } from 'express';
import * as profileController from '../controllers/profileController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/me', authenticate, profileController.getProfile);
router.put('/me', authenticate, profileController.updateProfile);

export default router;
