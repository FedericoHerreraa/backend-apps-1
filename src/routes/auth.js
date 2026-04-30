import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/otp/send', authController.sendOtp);
router.post('/otp/resend', authController.resendOtp);
router.post('/otp/verify', authController.verifyOtpAndSignIn);
router.get('/me', authenticate, authController.me);

export default router;
