import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login/request-otp', authController.requestOtp);
router.post('/login/verify-otp', authController.verifyOtp);
router.get('/me', authenticate, authController.me);

export default router;
